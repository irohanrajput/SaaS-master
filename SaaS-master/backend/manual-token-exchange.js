/**
 * Manual Token Exchange Test
 * Use this to manually exchange an authorization code for a token
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// PASTE YOUR CODE HERE (from the URL)
const authCode = 'AQRBMk8xG8aTqOwj6-d6cy_3x4X1lpt7zAbc5McabcMF2FVcqoUX3rg86_KE1XiEheBfWvTQTBihf1TL-ZXGXXyb369aEU3hyNa1qC1fVyVXkBRa_JJgLYAFhIx9AcYUGbO7hUKrkzyH6LpCEL9uT9hFwkR40_UAV31SsNvtyHB-Ub7dI_cX2q6mYxnu-diHzakj8bs0kaE1kQAn5HY';

const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

console.log('🔄 Manual Token Exchange Test\n');
console.log('='.repeat(70));
console.log('\n📋 Configuration:');
console.log('   Client ID:', clientId);
console.log('   Client Secret:', clientSecret ? clientSecret.substring(0, 15) + '...' : 'MISSING');
console.log('   Redirect URI:', redirectUri);
console.log('   Auth Code:', authCode.substring(0, 30) + '...');

async function exchangeToken() {
  try {
    console.log('\n🔄 Exchanging authorization code for access token...');

    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('\n✅ SUCCESS! Token obtained:\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));

    const { access_token, expires_in, scope } = response.data;

    console.log('\n🔑 Access Token:', access_token);
    console.log('📊 Scopes:', scope);
    console.log('⏰ Expires in:', expires_in, 'seconds (', (expires_in / 86400).toFixed(1), 'days)');

    console.log('\n✅ Token is valid! You can now:');
    console.log('   1. Save this token to database manually');
    console.log('   2. Or reconnect LinkedIn in the dashboard');
    console.log('   3. The token should work for API calls');

  } catch (error) {
    console.error('\n❌ Error exchanging token:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', JSON.stringify(error.response.data, null, 2));

      if (error.response.data.error === 'invalid_grant') {
        console.log('\n💡 Authorization code expired or already used');
        console.log('   Solution: Get a new code by connecting LinkedIn again');
      } else if (error.response.data.error === 'invalid_client') {
        console.log('\n💡 Client credentials are wrong');
        console.log('   Solution: Check LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env');
      }
    } else {
      console.error('   Message:', error.message);
    }
  }
}

exchangeToken();
