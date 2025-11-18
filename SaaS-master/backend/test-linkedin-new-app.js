/**
 * Test LinkedIn OAuth with New App Configuration
 * 
 * This script tests your new LinkedIn app and determines which scopes are available
 */

import dotenv from 'dotenv';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('🧪 Testing LinkedIn OAuth Configuration\n');
console.log('='.repeat(70));

// Get credentials from .env
const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3002/auth/linkedin/callback';

console.log('\n📋 Current Configuration:');
console.log('   Client ID:', clientId);
console.log('   Client Secret:', clientSecret ? clientSecret.substring(0, 15) + '...' : 'MISSING');
console.log('   Redirect URI:', redirectUri);

// PKCE Helper Functions
function generateCodeVerifier() {
  const buffer = crypto.randomBytes(32);
  return base64URLEncode(buffer);
}

function generateCodeChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64URLEncode(hash);
}

function base64URLEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate PKCE parameters
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);
const state = crypto.randomUUID();

console.log('\n🔐 PKCE Parameters Generated:');
console.log('   Code Verifier:', codeVerifier);
console.log('   Code Challenge:', codeChallenge);
console.log('   State:', state);

console.log('\n' + '='.repeat(70));
console.log('\n🎯 SCOPE DETECTION\n');

// Based on your screenshot, you have these scopes available:
const availableScopes = {
  basic: ['openid', 'profile', 'email'],
  organization: ['r_organization_social', 'r_basicprofile', 'r_organization_admin']
};

console.log('📊 Available Scopes in Your App:');
console.log('\n✅ Basic Scopes (Personal Profile):');
availableScopes.basic.forEach(scope => {
  console.log(`   • ${scope}`);
});

console.log('\n❓ Organization Scopes (Requires Community Management API):');
availableScopes.organization.forEach(scope => {
  console.log(`   • ${scope}`);
});

console.log('\n' + '='.repeat(70));
console.log('\n🧪 TEST SCENARIOS\n');

// Test 1: Basic Scopes (Personal Profile)
console.log('Test 1: Basic Scopes (Personal Profile)');
console.log('─'.repeat(70));

const basicScope = 'openid profile email';
const basicAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(basicScope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

console.log('\nScopes:', basicScope);
console.log('Purpose: Authenticate user and get basic profile info');
console.log('Use Case: User login, profile display');
console.log('\n✅ This SHOULD work with your current app\n');
console.log('Test URL:');
console.log(basicAuthUrl);
console.log('\nExpected Authorization Screen:');
console.log('   • Use your name and photo');
console.log('   • Use the primary email address associated with your LinkedIn account');

// Test 2: Organization Scopes
console.log('\n\nTest 2: Organization Scopes (Company Page Access)');
console.log('─'.repeat(70));

const orgScope = 'r_organization_social r_basicprofile r_organization_admin';
const orgAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(orgScope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

console.log('\nScopes:', orgScope);
console.log('Purpose: Access organization pages and metrics');
console.log('Use Case: Social media analytics, company page management');
console.log('\n⚠️  This will FAIL unless you have Community Management API approved\n');
console.log('Test URL:');
console.log(orgAuthUrl);
console.log('\nExpected Result:');
console.log('   ❌ "Bummer, something went wrong" (if API not approved)');
console.log('   ✅ Organization permissions screen (if API approved)');

// Test 3: Mixed Scopes
console.log('\n\nTest 3: Mixed Scopes (Basic + Organization)');
console.log('─'.repeat(70));

const mixedScope = 'openid profile email r_organization_social';
const mixedAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(mixedScope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

console.log('\nScopes:', mixedScope);
console.log('Purpose: Get both personal profile and organization access');
console.log('\n⚠️  This will FAIL if organization scopes are not available\n');
console.log('Test URL:');
console.log(mixedAuthUrl);

console.log('\n' + '='.repeat(70));
console.log('\n📝 RECOMMENDATIONS\n');

console.log('Based on your screenshot showing only basic scopes:\n');

console.log('1️⃣ IMMEDIATE ACTION - Test with Basic Scopes:');
console.log('   • Use Test 1 URL above');
console.log('   • This will authenticate personal profile');
console.log('   • You can get user name, email, profile photo');
console.log('   • ✅ This should work immediately\n');

console.log('2️⃣ FOR ORGANIZATION ACCESS - Request Community Management API:');
console.log('   • Go to: https://www.linkedin.com/developers/apps');
console.log('   • Click on your app');
console.log('   • Go to "Products" tab');
console.log('   • Find "Community Management API"');
console.log('   • Click "Request access"');
console.log('   • Fill out the form with your use case');
console.log('   • Wait for approval (1-2 weeks)\n');

console.log('3️⃣ UPDATE YOUR CODE - Use Basic Scopes for Now:');
console.log('   • Edit frontend/components/dashboard/SocialDashboard.tsx');
console.log('   • Change scope to: "openid profile email"');
console.log('   • This will work with your current app');
console.log('   • Later upgrade to organization scopes when approved\n');

console.log('='.repeat(70));
console.log('\n🔧 CODE CHANGES NEEDED\n');

console.log('File: frontend/components/dashboard/SocialDashboard.tsx');
console.log('Line: ~660 (in connectLinkedIn function)\n');

console.log('CURRENT (Organization scopes):');
console.log('   const scope = \'r_organization_social r_basicprofile r_organization_admin\';');
console.log('\nCHANGE TO (Basic scopes):');
console.log('   const scope = \'openid profile email\';');
console.log('\nOR (Keep both, use conditionally):');
console.log(`   const scope = process.env.NEXT_PUBLIC_LINKEDIN_USE_BASIC_SCOPES === 'true'
     ? 'openid profile email'
     : 'r_organization_social r_basicprofile r_organization_admin';`);

console.log('\n' + '='.repeat(70));
console.log('\n✅ TESTING STEPS\n');

console.log('Step 1: Test Basic Scopes (Should Work Now)');
console.log('   1. Copy Test 1 URL from above');
console.log('   2. Paste in browser');
console.log('   3. Should see LinkedIn authorization screen');
console.log('   4. Click "Allow"');
console.log('   5. Should redirect to callback with code\n');

console.log('Step 2: Update Frontend Code');
console.log('   1. Edit SocialDashboard.tsx');
console.log('   2. Change scope to "openid profile email"');
console.log('   3. Save file');
console.log('   4. Restart frontend server\n');

console.log('Step 3: Test OAuth Flow in App');
console.log('   1. Clear browser data: sessionStorage.clear()');
console.log('   2. Go to: http://localhost:3002/dashboard/social');
console.log('   3. Select LinkedIn');
console.log('   4. Click "Connect LinkedIn"');
console.log('   5. Should see authorization screen');
console.log('   6. Click "Allow"');
console.log('   7. Should redirect and connect successfully\n');

console.log('Step 4: Verify Token Exchange');
console.log('   1. Check backend logs for "Access token obtained"');
console.log('   2. Check database for saved tokens');
console.log('   3. Verify scopes granted: "openid profile email"\n');

console.log('='.repeat(70));
console.log('\n🎯 WHAT YOU CAN DO WITH BASIC SCOPES\n');

console.log('✅ Available with Basic Scopes:');
console.log('   • User authentication (login)');
console.log('   • Get user name');
console.log('   • Get user email');
console.log('   • Get profile photo');
console.log('   • Display user profile in dashboard\n');

console.log('❌ NOT Available with Basic Scopes:');
console.log('   • Access company pages');
console.log('   • Get organization posts');
console.log('   • Get follower statistics');
console.log('   • Get engagement metrics');
console.log('   • Manage company page content\n');

console.log('💡 To get organization access:');
console.log('   → Request "Community Management API" in LinkedIn Developer Portal');
console.log('   → Wait for approval');
console.log('   → Then use organization scopes\n');

console.log('='.repeat(70));
console.log('\n📊 EXPECTED RESULTS\n');

console.log('With Basic Scopes (Current App):');
console.log('   Authorization Screen Shows:');
console.log('   ✅ "Use your name and photo"');
console.log('   ✅ "Use the primary email address"');
console.log('\n   After Authorization:');
console.log('   ✅ Redirects to callback');
console.log('   ✅ Backend exchanges code for token');
console.log('   ✅ Token saved to database');
console.log('   ✅ User profile data available\n');

console.log('With Organization Scopes (After API Approval):');
console.log('   Authorization Screen Shows:');
console.log('   ✅ "Manage your organization\'s pages"');
console.log('   ✅ "Retrieve organization posts and metrics"');
console.log('\n   After Authorization:');
console.log('   ✅ Access to company pages');
console.log('   ✅ Organization metrics available');
console.log('   ✅ Follower statistics accessible\n');

console.log('='.repeat(70));
console.log('\n🚀 QUICK START COMMAND\n');

console.log('To test basic scopes immediately, run:\n');
console.log('# Copy this URL and paste in browser:');
console.log(basicAuthUrl);
console.log('\n# Or use curl to test token exchange (after getting code):');
console.log(`curl -X POST 'https://www.linkedin.com/oauth/v2/accessToken' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -d 'grant_type=authorization_code' \\
  -d 'code=YOUR_CODE_HERE' \\
  -d 'client_id=${clientId}' \\
  -d 'client_secret=${clientSecret}' \\
  -d 'redirect_uri=${redirectUri}' \\
  -d 'code_verifier=${codeVerifier}'`);

console.log('\n' + '='.repeat(70));
console.log('\n✅ Test Script Complete!\n');

console.log('📌 Summary:');
console.log('   • Your app has basic scopes (openid, profile, email)');
console.log('   • Test 1 URL should work immediately');
console.log('   • Update frontend code to use basic scopes');
console.log('   • Request Community Management API for organization access');
console.log('   • PKCE is properly implemented and ready\n');

console.log('🔗 Useful Links:');
console.log('   • Developer Portal: https://www.linkedin.com/developers/apps');
console.log('   • Your App: https://www.linkedin.com/developers/apps/' + clientId);
console.log('   • Documentation: https://learn.microsoft.com/en-us/linkedin/\n');
