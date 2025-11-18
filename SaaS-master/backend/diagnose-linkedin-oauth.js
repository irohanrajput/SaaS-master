/**
 * LinkedIn OAuth Redirect URI Diagnostic
 * Run this to verify your redirect URI configuration
 */

console.log('\n🔍 LinkedIn OAuth Redirect URI Diagnostic\n');
console.log('=' .repeat(70));

// What the frontend sends to LinkedIn
const frontendRedirectUri = 'http://localhost:3002/auth/linkedin/callback';
const frontendRedirectUriEncoded = encodeURIComponent(frontendRedirectUri);

console.log('\n1️⃣ FRONTEND (Initial OAuth Request)');
console.log('   Raw URI:', frontendRedirectUri);
console.log('   URL-Encoded:', frontendRedirectUriEncoded);
console.log('   Full Auth URL:');
const clientId = '86x2hsbgbwfqsd';
const scope = 'r_organization_social w_organization_social rw_organization_admin';
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${frontendRedirectUriEncoded}&scope=${encodeURIComponent(scope)}`;
console.log('   ', authUrl);

// What the backend sends to LinkedIn for token exchange
const backendRedirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3002/auth/linkedin/callback';

console.log('\n2️⃣ BACKEND (Token Exchange Request)');
console.log('   From .env:', process.env.LINKEDIN_REDIRECT_URI);
console.log('   Used in request:', backendRedirectUri);
console.log('   Should NOT be URL-encoded in token exchange');

// Comparison
console.log('\n3️⃣ COMPARISON');
console.log('   Frontend URI:', frontendRedirectUri);
console.log('   Backend URI: ', backendRedirectUri);
console.log('   Match:', frontendRedirectUri === backendRedirectUri ? '✅ YES' : '❌ NO');

// What should be in LinkedIn Developer Portal
console.log('\n4️⃣ LINKEDIN DEVELOPER PORTAL CONFIGURATION');
console.log('   Go to: https://www.linkedin.com/developers/apps/' + clientId);
console.log('   Navigate to: Auth tab > OAuth 2.0 settings');
console.log('   Add this EXACT URI to "Redirect URLs":');
console.log('   📋', frontendRedirectUri);
console.log('   ⚠️  IMPORTANT: No trailing slash, exact match required!');

console.log('\n5️⃣ COMMON MISTAKES');
console.log('   ❌ http://localhost:3002/auth/linkedin/callback/ (trailing slash)');
console.log('   ❌ https://localhost:3002/auth/linkedin/callback (https instead of http)');
console.log('   ❌ http://127.0.0.1:3002/auth/linkedin/callback (127.0.0.1 instead of localhost)');
console.log('   ✅ http://localhost:3002/auth/linkedin/callback (correct!)');

console.log('\n6️⃣ REQUIRED SCOPES IN LINKEDIN APP');
console.log('   Go to: Products tab');
console.log('   Request: "Community Management API"');
console.log('   Enable these scopes:');
console.log('   ✅ r_organization_social');
console.log('   ✅ w_organization_social');
console.log('   ✅ rw_organization_admin');

console.log('\n7️⃣ TROUBLESHOOTING STEPS');
console.log('   1. Open LinkedIn Developer Portal');
console.log('   2. Select your app (ID: ' + clientId + ')');
console.log('   3. Go to Auth tab');
console.log('   4. Under "Redirect URLs", verify:');
console.log('      ' + frontendRedirectUri);
console.log('   5. Save changes if modified');
console.log('   6. Wait 5 minutes for changes to propagate');
console.log('   7. Clear browser cache and try again');

console.log('\n' + '='.repeat(70));
console.log('\n✅ Configuration Summary:');
console.log('   Client ID:', clientId);
console.log('   Redirect URI:', frontendRedirectUri);
console.log('   Scopes:', scope);
console.log('\n💡 Copy the redirect URI above and paste it EXACTLY in LinkedIn Developer Portal\n');
