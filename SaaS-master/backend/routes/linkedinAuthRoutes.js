import express from 'express';
import axios from 'axios';
import oauthTokenService from '../services/oauthTokenService.js';

const router = express.Router();

// Environment variables
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3002/auth/linkedin/callback';

console.log('🔧 LinkedIn OAuth Configuration:');
console.log('LINKEDIN_CLIENT_ID:', LINKEDIN_CLIENT_ID ? `${LINKEDIN_CLIENT_ID.substring(0, 10)}...` : 'MISSING');
console.log('LINKEDIN_CLIENT_SECRET:', LINKEDIN_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('REDIRECT_URI:', REDIRECT_URI);

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
  throw new Error('LinkedIn credentials not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env');
}

/**
 * Handle OAuth callback and exchange code for access token
 * POST /api/auth/linkedin/callback
 * Body: { code, email, state }
 */
router.post('/callback', async (req, res) => {
  try {
    const { code, email, state } = req.body;

    console.log('🔄 Processing LinkedIn OAuth callback');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Code: ${code ? code.substring(0, 20) + '...' : 'Missing'}`);
    console.log(`🛡️ State: ${state || 'Not provided'}`);

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'authorization_code_missing',
        message: 'Authorization code is required'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'email_required',
        message: 'Email is required to associate the LinkedIn account'
      });
    }

    // ⚠️ CRITICAL: Check if this code was already used
    const existingTokens = await oauthTokenService.getTokens(email, 'linkedin');
    if (existingTokens && existingTokens.last_code === code) {
      console.warn('⚠️ Authorization code already used - returning existing connection');
      
      // Instead of failing, return success if we already have a valid token
      const isExpired = existingTokens.expires_at ? new Date(existingTokens.expires_at) < new Date() : false;
      
      if (!isExpired) {
        console.log('✅ Returning existing valid token');
        return res.json({
          success: true,
          message: 'LinkedIn account already connected',
          data: {
            connected: true,
            scopes: existingTokens.scope?.split(',').map(s => s.trim()) || [],
            expiresIn: existingTokens.expires_in,
            expiresAt: existingTokens.expires_at ? new Date(existingTokens.expires_at).toISOString() : null
          }
        });
      } else {
        console.error('❌ Authorization code already used and token is expired');
        return res.status(400).json({
          success: false,
          error: 'code_already_used',
          message: 'This authorization code has already been used. Please try connecting again.'
        });
      }
    }

    console.log('🔄 Exchanging authorization code for access token...');
    
    // ✅ LinkedIn Web OAuth does NOT use PKCE - only mobile apps do
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI  // Must EXACTLY match authorization request
    });

    console.log('📋 Token exchange parameters:');
    console.log('   - grant_type: authorization_code');
    console.log('   - client_id:', LINKEDIN_CLIENT_ID);
    console.log('   - redirect_uri:', REDIRECT_URI);
    console.log('   - code:', code.substring(0, 20) + '...');

    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      tokenParams,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in, refresh_token, scope } = tokenResponse.data;

    console.log('✅ Access token obtained successfully');
    console.log('\n' + '='.repeat(70));
    console.log('🔑 FULL ACCESS TOKEN (copy this entire line):');
    console.log(access_token);
    console.log('='.repeat(70));
    console.log(`\n📊 Scopes granted: ${scope}`);
    console.log(`⏰ Expires in: ${expires_in} seconds (${(expires_in / 86400).toFixed(1)} days)`);
    console.log(`🔄 Refresh Token: ${refresh_token ? 'Provided' : 'Not provided'}`);

    // Calculate expiration timestamp
    const expiresAt = Date.now() + (expires_in * 1000);

    // Save tokens with the code to prevent reuse
    await oauthTokenService.storeTokens(email, {
      access_token,
      refresh_token: refresh_token || null,
      expires_in,
      expires_at: expiresAt,
      scope,
      token_type: 'Bearer',
      last_code: code  // Store code to prevent reuse
    }, 'linkedin');

    console.log('💾 Tokens saved to database');
    console.log(`📅 Token expires at: ${new Date(expiresAt).toISOString()}`);
    console.log('💡 Token saved successfully! You can now fetch LinkedIn metrics.');

    return res.json({
      success: true,
      message: 'LinkedIn account connected successfully',
      data: {
        connected: true,
        access_token: access_token, // ✅ Return token for localStorage
        scopes: scope.split(',').map(s => s.trim()),
        expiresIn: expires_in,
        expiresAt: new Date(expiresAt).toISOString()
      }
    });

  } catch (error) {
    console.error('❌ LinkedIn OAuth Error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      const { error: errorCode, error_description } = error.response.data;
      
      const errorMessages = {
        'invalid_request': 'Invalid OAuth request parameters. Please try connecting again.',
        'invalid_client': 'Invalid LinkedIn app credentials. Please contact support.',
        'invalid_grant': 'Authorization code is invalid, expired, or already used. Please try connecting again.',
        'unauthorized_client': 'Client is not authorized for this grant type',
        'unsupported_grant_type': 'Grant type is not supported'
      };

      return res.status(400).json({
        success: false,
        error: errorCode || 'oauth_error',
        message: errorMessages[errorCode] || error_description || 'Failed to exchange authorization code',
        details: error_description
      });
    }

    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'An error occurred during LinkedIn authorization'
    });
  }
});

/**
 * Check if user has connected LinkedIn
 * GET /api/auth/linkedin/status?email=user@example.com
 */
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        connected: false,
        error: 'email_required',
        message: 'Email parameter is required'
      });
    }

    const isConnected = await oauthTokenService.isConnected(email, 'linkedin');
    
    if (!isConnected) {
      return res.json({
        success: false,
        connected: false,
        message: 'LinkedIn account not connected'
      });
    }

    const tokens = await oauthTokenService.getTokens(email, 'linkedin');
    const isExpired = tokens.expires_at ? new Date(tokens.expires_at) < new Date() : false;
    
    return res.json({
      success: true,
      data: {
        connected: true,
        provider: 'linkedin',
        scopes: tokens.scope?.split(',').map(s => s.trim()) || [],
        expiresAt: tokens.expires_at ? new Date(tokens.expires_at).toISOString() : null,
        isExpired: isExpired
      }
    });

  } catch (error) {
    console.error('❌ Error checking LinkedIn status:', error);
    return res.status(500).json({
      success: false,
      connected: false,
      error: 'server_error',
      message: 'Failed to check LinkedIn connection status'
    });
  }
});

/**
 * Disconnect LinkedIn account
 * DELETE /api/auth/linkedin/disconnect?email=user@example.com
 */
router.delete('/disconnect', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'email_required',
        message: 'Email parameter is required'
      });
    }

    console.log(`🔌 Disconnecting LinkedIn account for: ${email}`);
    await oauthTokenService.deleteTokens(email, 'linkedin');
    console.log('✅ LinkedIn account disconnected');

    return res.json({
      success: true,
      message: 'LinkedIn account disconnected successfully'
    });

  } catch (error) {
    console.error('❌ Error disconnecting LinkedIn:', error);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to disconnect LinkedIn account'
    });
  }
});

/**
 * Refresh access token
 * POST /api/auth/linkedin/refresh
 * Body: { email }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'email_required',
        message: 'Email is required'
      });
    }

    const tokens = await oauthTokenService.getTokens(email, 'linkedin');

    if (!tokens || !tokens.refresh_token) {
      return res.status(401).json({
        success: false,
        error: 'no_refresh_token',
        message: 'No refresh token available. Please reconnect your LinkedIn account.'
      });
    }

    console.log('🔄 Refreshing LinkedIn access token...');

    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in, refresh_token } = tokenResponse.data;
    const expiresAt = Date.now() + (expires_in * 1000);

    await oauthTokenService.storeTokens(email, {
      ...tokens,
      access_token,
      refresh_token: refresh_token || tokens.refresh_token,
      expires_in,
      expires_at: expiresAt
    }, 'linkedin');

    console.log('✅ Access token refreshed successfully');

    return res.json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        expiresIn: expires_in,
        expiresAt: new Date(expiresAt).toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error refreshing token:', error.response?.data || error.message);
    
    return res.status(400).json({
      success: false,
      error: 'refresh_failed',
      message: 'Failed to refresh access token. Please reconnect your LinkedIn account.'
    });
  }
});

export default router;