/**
 * Test Lienv from 'dotenv';

dotenv.config();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3002/auth/linkedin/callback';

// Test authorization code (you'll need to replace this with a fresh one)
const TEST_CODE = 'PASTE_YOUR_CODE_HERE';

console.log('🧪 Testing LinkedIn Token Exchange');
console.log('=====================================');
console.log('Client ID:', LINKEDIN_CLIENT_ID);
console.log('Client Secret:', LINKEDIN_CLIENT_SECRET ? '***' + LINKEDIN_CLIENT_SECRET.slice(-4) : 'MISSING');
console.log('Redirect URI:', REDIRECT_URI);
console.log('Code:', TEST_CODE);
console.log('=====================================\n');

async function testTokenExchange() {
  try {
    console.log('🔄 Attempting token exchange...\n');
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: TEST_CODE,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    });

    console.log('📋 Request parameters:');
    console.log(params.toString());
    console.log('\n');

    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('=====================================');
    console.log('Access Token:', response.data.access_token ? '***' + response.data.access_token.slice(-10) : 'MISSING');
    console.log('Expires In:', response.data.expires_in, 'seconds');
    console.log('Scope:', response.data.scope);
    console.log('=====================================');

  } catch (error) {
    console.error('❌ ERROR!');
    console.error('=====================================');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Code:', error.response.data.error);
      console.error('Error Description:', error.response.data.error_description);
      console.error('\nFull Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    
    console.error('=====================================');
  }
}

testTokenExchange();
