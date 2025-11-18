/**
 * OAuth Token Service
 * Manages persistent OAuth connections for Google Analytics and Search Console
 * Tokens are stored in database and auto-refreshed when expired
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Validate environment variables (optional for some services)
if (!process.env.SUPABASE_URL) {
  console.warn('⚠️ SUPABASE_URL is not set in environment variables - OAuth features will be limited');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_KEY is not set in environment variables - OAuth features will be limited');
}

console.log('🔍 Supabase Config Check:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 30)}...` : 'MISSING');
console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const oauthTokenService = {
  /**
   * Store OAuth tokens in database
   * @param {string} userEmail - User's email
   * @param {object} tokens - OAuth tokens from provider
   * @param {string} provider - OAuth provider ('google' or 'facebook')
   * @returns {Promise<boolean>} Success status
   */
  async storeTokens(userEmail, tokens, provider = 'google') {
    try {
      console.log(`💾 Storing OAuth tokens for: ${userEmail} (${provider})`);

      const tokenData = {
        user_email: userEmail,
        provider: provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: tokens.expires_at || tokens.expiry_date || null,
        scope: tokens.scope || null,
        updated_at: new Date().toISOString()
      };

      // For Facebook, store additional user info
      if (provider === 'facebook') {
        tokenData.provider_user_id = tokens.user_id || null;
        tokenData.provider_user_name = tokens.user_name || null;
      }

      // Check if user already has tokens for this provider
      const { data: existing } = await supabase
        .from('oauth_tokens')
        .select('id')
        .eq('user_email', userEmail)
        .eq('provider', provider)
        .single();

      if (existing) {
        // Update existing tokens
        const { error } = await supabase
          .from('oauth_tokens')
          .update(tokenData)
          .eq('id', existing.id);

        if (error) throw error;
        console.log(`✅ OAuth tokens updated for: ${userEmail} (${provider})`);
      } else {
        // Insert new tokens
        const { error } = await supabase
          .from('oauth_tokens')
          .insert(tokenData);

        if (error) throw error;
        console.log(`✅ OAuth tokens stored for: ${userEmail} (${provider})`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error storing OAuth tokens:', error);
      return false;
    }
  },

  /**
   * Get stored OAuth tokens for a user
   * @param {string} userEmail - User's email
   * @param {string} provider - OAuth provider ('google' or 'facebook')
   * @returns {Promise<object|null>} OAuth tokens or null
   */
  async getTokens(userEmail, provider = 'google') {
    try {
      console.log(`🔍 Fetching OAuth tokens for: ${userEmail} (${provider})`);

      const { data, error } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('user_email', userEmail)
        .eq('provider', provider)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`📭 No OAuth tokens found for: ${userEmail} (${provider})`);
          return null;
        }
        throw error;
      }

      if (!data) {
        console.log(`📭 No OAuth tokens found for: ${userEmail} (${provider})`);
        return null;
      }

      // Convert to standard OAuth format
      const tokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expires_at,
        expires_at: data.expires_at,
        scope: data.scope,
        token_type: 'Bearer',
        provider: provider
      };

      // Add provider-specific fields
      if (provider === 'facebook') {
        tokens.user_id = data.provider_user_id;
        tokens.user_name = data.provider_user_name;
      }

      console.log(`✅ OAuth tokens retrieved for: ${userEmail} (${provider})`);
      return tokens;
    } catch (error) {
      console.error('❌ Error fetching OAuth tokens:', error);
      return null;
    }
  },

  /**
   * Check if user has valid OAuth connection
   * @param {string} userEmail - User's email
   * @param {string} provider - OAuth provider ('google' or 'facebook')
   * @returns {Promise<boolean>} True if connected
   */
  async isConnected(userEmail, provider = 'google') {
    try {
      const tokens = await this.getTokens(userEmail, provider);
      return tokens !== null && (tokens.access_token || tokens.refresh_token);
    } catch (error) {
      console.error('❌ Error checking connection:', error);
      return false;
    }
  },

  /**
   * Refresh expired access token using refresh token
   * @param {string} userEmail - User's email
   * @returns {Promise<object|null>} New tokens or null
   */
  async refreshTokens(userEmail) {
    try {
      console.log(`🔄 Refreshing OAuth tokens for: ${userEmail}`);

      const tokens = await this.getTokens(userEmail);
      if (!tokens || !tokens.refresh_token) {
        console.log(`❌ No refresh token available for: ${userEmail}`);
        return null;
      }

      // Set credentials and refresh
      oauth2Client.setCredentials(tokens);
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Store new tokens
      await this.storeTokens(userEmail, credentials);

      console.log(`✅ OAuth tokens refreshed for: ${userEmail}`);
      return credentials;
    } catch (error) {
      console.error('❌ Error refreshing OAuth tokens:', error);
      
      // If refresh fails, connection is broken
      if (error.message?.includes('invalid_grant')) {
        console.log(`⚠️ Invalid refresh token, disconnecting: ${userEmail}`);
        await this.disconnect(userEmail);
      }
      
      return null;
    }
  },

  /**
   * Get valid OAuth client (auto-refreshes if needed)
   * @param {string} userEmail - User's email
   * @returns {Promise<OAuth2Client|null>} Configured OAuth client or null
   */
  async getOAuthClient(userEmail) {
    try {
      let tokens = await this.getTokens(userEmail);
      
      if (!tokens) {
        console.log(`📭 No OAuth connection for: ${userEmail}`);
        return null;
      }

      // Check if token is expired
      const now = Date.now();
      const expiryDate = tokens.expiry_date || 0;

      if (expiryDate && expiryDate < now) {
        console.log(`⏰ Token expired, refreshing for: ${userEmail}`);
        tokens = await this.refreshTokens(userEmail);
        
        if (!tokens) {
          console.log(`❌ Failed to refresh token for: ${userEmail}`);
          return null;
        }
      }

      // Create and configure OAuth client
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      
      client.setCredentials(tokens);
      
      console.log(`✅ OAuth client ready for: ${userEmail}`);
      return client;
    } catch (error) {
      console.error('❌ Error getting OAuth client:', error);
      return null;
    }
  },

  /**
   * Disconnect user's OAuth connection
   * @param {string} userEmail - User's email
   * @param {string} provider - OAuth provider ('google' or 'facebook')
   * @returns {Promise<boolean>} Success status
   */
  async disconnect(userEmail, provider = 'google') {
    try {
      console.log(`🔌 Disconnecting OAuth for: ${userEmail} (${provider})`);

      // Revoke tokens with provider
      const tokens = await this.getTokens(userEmail, provider);
      if (tokens?.access_token) {
        try {
          if (provider === 'google') {
            await oauth2Client.revokeToken(tokens.access_token);
            console.log(`✅ Token revoked with Google`);
          }
          // Facebook doesn't require explicit token revocation
        } catch (error) {
          console.warn(`⚠️ Failed to revoke token with ${provider}:`, error.message);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('user_email', userEmail)
        .eq('provider', provider);

      if (error) throw error;

      console.log(`✅ OAuth disconnected for: ${userEmail} (${provider})`);
      return true;
    } catch (error) {
      console.error('❌ Error disconnecting OAuth:', error);
      return false;
    }
  },

  /**
   * Delete tokens from database (alias for disconnect)
   * @param {string} userEmail - User's email
   * @param {string} provider - OAuth provider ('google' or 'facebook')
   * @returns {Promise<boolean>} Success status
   */
  async deleteTokens(userEmail, provider = 'google') {
    return this.disconnect(userEmail, provider);
  },

  /**
   * Get connection status with details
   * @param {string} userEmail - User's email
   * @returns {Promise<object>} Connection status details
   */
  async getConnectionStatus(userEmail) {
    try {
      const tokens = await this.getTokens(userEmail);
      
      if (!tokens) {
        return {
          connected: false,
          message: 'Not connected to Google'
        };
      }

      const now = Date.now();
      const expiryDate = tokens.expiry_date || 0;
      const isExpired = expiryDate && expiryDate < now;

      return {
        connected: true,
        hasRefreshToken: !!tokens.refresh_token,
        isExpired: isExpired,
        expiresAt: expiryDate ? new Date(expiryDate).toISOString() : null,
        scopes: tokens.scope?.split(' ') || [],
        message: isExpired 
          ? 'Token expired, will auto-refresh on next request'
          : 'Connected and active'
      };
    } catch (error) {
      console.error('❌ Error getting connection status:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }
};

export default oauthTokenService;
