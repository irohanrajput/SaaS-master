/**
 * Verify LinkedIn App Configuration
 * 
 * This script helps diagnose LinkedIn OAuth "Bummer, something went wrong" errors
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 LinkedIn App Configuration Verification\n');
console.log('='.repeat(70));

const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3002/auth/linkedin/callback';

console.log('\n📋 Current Configuration:');
console.log('   Client ID:', clientId);
console.log('   Client Secret:', clientSecret ? clientSecret.substring(0, 15) + '...' : 'MISSING');
console.log('   Redirect URI:', redirectUri);

console.log('\n🚨 "Bummer, something went wrong" Error Causes:\n');

console.log('1️⃣ INVALID CLIENT ID');
console.log('   → Your app may have been deleted or client ID is wrong');
console.log('   → Verify at: https://www.linkedin.com/developers/apps');
console.log('   → Check that app exists and client ID matches\n');

console.log('2️⃣ REDIRECT URI NOT REGISTERED');
console.log('   → LinkedIn requires EXACT match of redirect URI');
console.log('   → Go to: https://www.linkedin.com/developers/apps/[YOUR_APP_ID]/auth');
console.log('   → Under "Redirect URLs", add:');
console.log('      ' + redirectUri);
console.log('   → Must match EXACTLY (no trailing slash, correct protocol/port)\n');

console.log('3️⃣ SCOPES NOT APPROVED');
console.log('   → The scopes you\'re requesting may not be available');
console.log('   → Go to: https://www.linkedin.com/developers/apps/[YOUR_APP_ID]/auth');
console.log('   → Under "OAuth 2.0 scopes", verify these are checked:');
console.log('      ☐ r_organization_social');
console.log('      ☐ r_basicprofile');
console.log('      ☐ r_organization_admin');
console.log('   → Note: Some scopes require product approval\n');

console.log('4️⃣ COMMUNITY MANAGEMENT API NOT APPROVED');
console.log('   → Go to: https://www.linkedin.com/developers/apps/[YOUR_APP_ID]/products');
console.log('   → Check "Community Management API" status');
console.log('   → If not approved, you may need to:');
console.log('      a) Request access');
console.log('      b) Provide use case description');
console.log('      c) Wait for LinkedIn approval (1-2 weeks)\n');

console.log('5️⃣ APP IN DRAFT STATE');
console.log('   → Your app may not be published/verified');
console.log('   → Check app status in developer portal');
console.log('   → Some features require app verification\n');

console.log('='.repeat(70));
console.log('\n🔧 IMMEDIATE ACTIONS TO TAKE:\n');

console.log('Step 1: Verify App Exists');
console.log('   → Go to: https://www.linkedin.com/developers/apps');
console.log('   → Find your app: "Claryx Comm" or similar');
console.log('   → Click on it to open settings\n');

console.log('Step 2: Check Client ID');
console.log('   → In app settings, go to "Auth" tab');
console.log('   → Copy "Client ID" and compare with .env:');
console.log('      .env has: ' + clientId);
console.log('   → If different, update .env file\n');

console.log('Step 3: Add Redirect URI');
console.log('   → In "Auth" tab, scroll to "Redirect URLs"');
console.log('   → Click "Add redirect URL"');
console.log('   → Enter EXACTLY: ' + redirectUri);
console.log('   → Click "Update"');
console.log('   → ⚠️  Must match exactly - no trailing slash!\n');

console.log('Step 4: Check Available Scopes');
console.log('   → In "Auth" tab, scroll to "OAuth 2.0 scopes"');
console.log('   → You should see these scopes available:');
console.log('      • r_basicprofile (usually available by default)');
console.log('      • r_emailaddress (usually available by default)');
console.log('   → For organization scopes, you need "Community Management API"\n');

console.log('Step 5: Request Community Management API');
console.log('   → Go to "Products" tab');
console.log('   → Find "Community Management API"');
console.log('   → If not added, click "Request access"');
console.log('   → Fill out the form with your use case');
console.log('   → Wait for approval (can take 1-2 weeks)\n');

console.log('='.repeat(70));
console.log('\n🎯 ALTERNATIVE: Test with Basic Scopes First\n');

console.log('If Community Management API is not approved yet, test with basic scopes:');
console.log('   Scopes: r_basicprofile r_emailaddress');
console.log('   This will authenticate personal profile (not organization)');
console.log('   Useful for testing OAuth flow works\n');

const testUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=TEST_STATE&scope=${encodeURIComponent('r_basicprofile r_emailaddress')}`;

console.log('Test URL with basic scopes:');
console.log(testUrl);
console.log('\n⚠️  This will only work if:');
console.log('   1. Client ID is valid');
console.log('   2. Redirect URI is registered');
console.log('   3. App is not deleted\n');

console.log('='.repeat(70));
console.log('\n📞 LinkedIn Support Resources:\n');

console.log('Developer Portal: https://www.linkedin.com/developers/apps');
console.log('Documentation: https://learn.microsoft.com/en-us/linkedin/');
console.log('Community Forum: https://www.linkedin.com/help/linkedin/forum');
console.log('Support: https://www.linkedin.com/help/linkedin/ask/api\n');

console.log('='.repeat(70));
console.log('\n✅ Next Steps:\n');

console.log('1. Go to LinkedIn Developer Portal');
console.log('2. Verify your app exists and is active');
console.log('3. Check Client ID matches .env file');
console.log('4. Add redirect URI to "Redirect URLs" list');
console.log('5. Request "Community Management API" if not approved');
console.log('6. Test with basic scopes first (r_basicprofile r_emailaddress)');
console.log('7. Once working, upgrade to organization scopes\n');

console.log('🔍 Diagnostic Complete!\n');
