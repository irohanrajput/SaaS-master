/**
 * Diagnose LinkedIn OAuth PKCE Configuration
 * 
 * Run this script to check if everything is configured correctly
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 LinkedIn OAuth PKCE Configuration Diagnostic\n');
console.log('='.repeat(70));

// 1. Check Environment Variables
console.log('\n1️⃣ Environment Variables:');
const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

console.log('   LINKEDIN_CLIENT_ID:', clientId ? `✅ ${clientId}` : '❌ MISSING');
console.log('   LINKEDIN_CLIENT_SECRET:', clientSecret ? `✅ ${clientSecret.substring(0, 15)}...` : '❌ MISSING');
console.log('   LINKEDIN_REDIRECT_URI:', redirectUri ? `✅ ${redirectUri}` : '⚠️  Using default: http://localhost:3002/auth/linkedin/callback');

const finalRedirectUri = redirectUri || 'http://localhost:3002/auth/linkedin/callback';

// 2. Validate Redirect URI
console.log('\n2️⃣ Redirect URI Validation:');
try {
  const url = new URL(finalRedirectUri);
  console.log('   Protocol:', url.protocol === 'http:' ? '✅ http:' : '⚠️  ' + url.protocol);
  console.log('   Host:', url.hostname === 'localhost' ? '✅ localhost' : '⚠️  ' + url.hostname);
  console.log('   Port:', url.port === '3002' ? '✅ 3002' : '⚠️  ' + url.port);
  console.log('   Path:', url.pathname === '/auth/linkedin/callback' ? '✅ /auth/linkedin/callback' : '⚠️  ' + url.pathname);
  console.log('   No trailing slash:', !finalRedirectUri.endsWith('/') ? '✅ Correct' : '⚠️  Remove trailing slash');
} catch (error) {
  console.log('   ❌ Invalid URL format:', error.message);
}

// 3. Check Required Scopes
console.log('\n3️⃣ Required OAuth Scopes:');
const requiredScopes = [
  'r_organization_social',
  'r_basicprofile',
  'r_organization_admin'
];

console.log('   Required scopes for organization access:');
requiredScopes.forEach(scope => {
  console.log(`   ✅ ${scope}`);
});

console.log('\n   ❌ DO NOT USE these scopes (for personal profile):');
const wrongScopes = ['openid', 'profile', 'email', 'w_member_social'];
wrongScopes.forEach(scope => {
  console.log(`   ❌ ${scope}`);
});

// 4. PKCE Implementation Check
console.log('\n4️⃣ PKCE Implementation:');
console.log('   Required parameters in authorization URL:');
console.log('   ✅ code_challenge (43-character SHA-256 hash)');
console.log('   ✅ code_challenge_method=S256');
console.log('\n   Required parameter in token exchange:');
console.log('   ✅ code_verifier (43-128 character random string)');

// 5. LinkedIn Developer App Checklist
console.log('\n5️⃣ LinkedIn Developer App Configuration:');
console.log('   Go to: https://www.linkedin.com/developers/apps');
console.log('\n   Auth Tab:');
console.log('   ☐ Redirect URLs includes:', finalRedirectUri);
console.log('   ☐ OAuth 2.0 scopes selected:');
requiredScopes.forEach(scope => {
  console.log(`      ☐ ${scope}`);
});
console.log('\n   Products Tab:');
console.log('   ☐ "Community Management API" - Status: Approved');

// 6. User Requirements
console.log('\n6️⃣ User Requirements:');
console.log('   ☐ You are an admin of a LinkedIn Company Page');
console.log('   ☐ The Company Page is published and active');
console.log('   ☐ You can access: https://www.linkedin.com/company/[your-company]/admin/');

// 7. Testing Endpoints
console.log('\n7️⃣ Testing Endpoints:');
console.log('   Authorization URL:');
const testAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&state=TEST_STATE&scope=${encodeURIComponent(requiredScopes.join(' '))}&code_challenge=TEST_CHALLENGE&code_challenge_method=S256`;
console.log('   ' + testAuthUrl);

console.log('\n   Token Exchange URL:');
console.log('   POST https://www.linkedin.com/oauth/v2/accessToken');
console.log('   Body: grant_type=authorization_code&code=[CODE]&client_id=[ID]&client_secret=[SECRET]&redirect_uri=[URI]&code_verifier=[VERIFIER]');

console.log('\n   Organizations API:');
console.log('   GET https://api.linkedin.com/rest/organizationAcls?q=roleAssignee');
console.log('   Headers: Authorization: Bearer [ACCESS_TOKEN]');

// 8. Common Errors
console.log('\n8️⃣ Common Errors and Solutions:');
console.log('\n   Error: "code verifier does not match"');
console.log('   → Ensure code_verifier is sent in token exchange');
console.log('   → Verify code_challenge was generated from code_verifier using SHA-256');
console.log('   → Check that code_verifier is stored in sessionStorage before redirect');

console.log('\n   Error: "invalid_request - redirect_uri mismatch"');
console.log('   → Redirect URI must match EXACTLY in:');
console.log('      1. LinkedIn Developer App settings');
console.log('      2. Authorization request');
console.log('      3. Token exchange request');
console.log('   → No trailing slashes, correct protocol, port, and path');

console.log('\n   Error: "Access denied - 403"');
console.log('   → Check LinkedIn app has "Community Management API" approved');
console.log('   → Verify you have admin access to a Company Page');
console.log('   → Confirm scopes include r_organization_admin');

console.log('\n   Error: "No organizations found"');
console.log('   → You must be an admin of a LinkedIn Company Page');
console.log('   → Personal profiles do not have organizations');
console.log('   → Check page is published and active');

// 9. File Checks
console.log('\n9️⃣ File Modifications:');
const filesToCheck = [
  'frontend/components/dashboard/SocialDashboard.tsx',
  'frontend/app/auth/linkedin/callback/page.tsx',
  'backend/routes/linkedinAuthRoutes.js'
];

console.log('   Files that should have PKCE implementation:');
filesToCheck.forEach(file => {
  console.log(`   ☐ ${file}`);
});

console.log('\n   Key changes:');
console.log('   ☐ generateCodeVerifier() function added');
console.log('   ☐ generateCodeChallenge() function added');
console.log('   ☐ base64URLEncode() function added');
console.log('   ☐ code_verifier stored in sessionStorage');
console.log('   ☐ code_challenge sent in authorization URL');
console.log('   ☐ code_verifier sent to backend in callback');
console.log('   ☐ code_verifier included in token exchange');

// 10. Next Steps
console.log('\n🎯 Next Steps:');
console.log('   1. Verify all environment variables are set');
console.log('   2. Check LinkedIn Developer App configuration');
console.log('   3. Ensure you have admin access to a Company Page');
console.log('   4. Clear browser sessionStorage and localStorage');
console.log('   5. Test OAuth flow: npm run dev (frontend) and npm start (backend)');
console.log('   6. Click "Connect LinkedIn" in Social Dashboard');
console.log('   7. Check browser console and backend logs');
console.log('   8. Verify organizations endpoint returns data');

console.log('\n' + '='.repeat(70));
console.log('✅ Diagnostic Complete!\n');

// Summary
console.log('📊 Configuration Summary:');
const allGood = clientId && clientSecret;
if (allGood) {
  console.log('   ✅ Environment variables configured');
  console.log('   ⚠️  Verify LinkedIn Developer App settings manually');
  console.log('   ⚠️  Ensure you have admin access to a Company Page');
  console.log('\n   Ready to test! Run: npm run dev (frontend) and npm start (backend)');
} else {
  console.log('   ❌ Missing required environment variables');
  console.log('   → Check backend/.env file');
}

console.log('');
