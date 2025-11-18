/**
 * Test LinkedIn Token Exchange
 * 
 * This script helps diagnose "Client authentication failed" errors
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 LinkedIn Token Exchange Diagnostic\n');
console.log('='.repeat(70));

const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

console.log('\n📋 Configuration:');
console.log('   Client ID:', clientId);
console.log('   Client Secret:', clientSecret);
console.log('   Redirect URI:', redirectUri);

console.log('\n' + '='.repeat(70));
console.log('\n🚨 ERROR: "Client authentication failed"\n');

console.log('This error means LinkedIn cannot verify your app credentials.\n');

console.log('Common Causes:\n');

console.log('1️⃣ WRONG CLIENT SECRET');
console.log('   → The client secret in .env doesn\'t match LinkedIn Developer Portal');
console.log('   → Solution: Copy the EXACT secret from LinkedIn portal\n');

console.log('2️⃣ CLIENT SECRET FORMAT ISSUE');
console.log('   → LinkedIn secrets start with "WPL_AP1." or "WPL_AP0."');
console.log('   → Your secret: ' + clientSecret);
console.log('   → Format looks: ' + (clientSecret?.startsWith('WPL_AP') ? '✅ CORRECT' : '❌ WRONG') + '\n');

console.log('3️⃣ WRONG CLIENT ID');
console.log('   → Client ID must match the app in LinkedIn portal');
console.log('   → Your Client ID: ' + clientId);
console.log('   → Verify this matches in: https://www.linkedin.com/developers/apps\n');

console.log('4️⃣ APP DELETED OR SUSPENDED');
console.log('   → Your app may have been deleted or suspended');
console.log('   → Check: https://www.linkedin.com/developers/apps/' + clientId + '\n');

console.log('5️⃣ USING WRONG TOKEN ENDPOINT');
console.log('   → For OpenID Connect (basic scopes), LinkedIn may require different endpoint');
console.log('   → Standard endpoint: https://www.linkedin.com/oauth/v2/accessToken');
console.log('   → OpenID endpoint: https://www.linkedin.com/oauth/v2/accessToken (same)\n');

console.log('='.repeat(70));
console.log('\n🔧 IMMEDIATE FIX\n');

console.log('Step 1: Verify Client Secret');
console.log('   1. Go to: https://www.linkedin.com/developers/apps');
console.log('   2. Click on your app');
console.log('   3. Go to "Auth" tab');
console.log('   4. Under "Application credentials":');
console.log('      - Client ID: ' + clientId);
console.log('      - Client Secret: Click "Show" to reveal');
console.log('   5. Copy the EXACT secret (including WPL_AP1. prefix)');
console.log('   6. Update backend/.env file\n');

console.log('Step 2: Check Client Secret in .env');
console.log('   Current value in .env:');
console.log('   LINKEDIN_CLIENT_SECRET=' + clientSecret);
console.log('\n   ⚠️  Make sure:');
console.log('   • No extra spaces before or after');
console.log('   • No quotes around the value');
console.log('   • Exact copy from LinkedIn portal');
console.log('   • Includes the WPL_AP1. prefix\n');

console.log('Step 3: Restart Backend Server');
console.log('   After updating .env:');
console.log('   1. Stop backend server (Ctrl+C)');
console.log('   2. Start again: npm start');
console.log('   3. Check logs show correct secret (last 4 chars)\n');

console.log('='.repeat(70));
console.log('\n🧪 TEST TOKEN EXCHANGE MANUALLY\n');

console.log('After you click "Allow" and get redirected, you\'ll see a URL like:');
console.log('http://localhost:3002/auth/linkedin/callback?code=AQT...&state=...\n');

console.log('Copy the "code" parameter and test token exchange:\n');

console.log('curl -X POST "https://www.linkedin.com/oauth/v2/accessToken" \\');
console.log('  -H "Content-Type: application/x-www-form-urlencoded" \\');
console.log('  -d "grant_type=authorization_code" \\');
console.log('  -d "code=YOUR_CODE_HERE" \\');
console.log('  -d "client_id=' + clientId + '" \\');
console.log('  -d "client_secret=' + clientSecret + '" \\');
console.log('  -d "redirect_uri=' + redirectUri + '" \\');
console.log('  -d "code_verifier=YOUR_CODE_VERIFIER_FROM_SESSION"\n');

console.log('Expected Success Response:');
console.log('{');
console.log('  "access_token": "AQV...",');
console.log('  "expires_in": 5184000,');
console.log('  "scope": "openid profile email"');
console.log('}\n');

console.log('Expected Error Response (if secret wrong):');
console.log('{');
console.log('  "error": "invalid_client",');
console.log('  "error_description": "Client authentication failed"');
console.log('}\n');

console.log('='.repeat(70));
console.log('\n📝 ALTERNATIVE: Create New App\n');

console.log('If you can\'t find the correct secret, create a new app:\n');

console.log('1. Go to: https://www.linkedin.com/developers/apps');
console.log('2. Click "Create app"');
console.log('3. Fill in details:');
console.log('   - App name: Saas (or your name)');
console.log('   - LinkedIn Page: Select any page or create one');
console.log('   - App logo: Upload any image');
console.log('   - Legal agreement: Check the box');
console.log('4. Click "Create app"');
console.log('5. Go to "Auth" tab');
console.log('6. Copy Client ID and Client Secret');
console.log('7. Add redirect URI: ' + redirectUri);
console.log('8. Update backend/.env with new credentials\n');

console.log('='.repeat(70));
console.log('\n🔍 VERIFY CURRENT CREDENTIALS\n');

console.log('Let\'s verify your credentials are being read correctly:\n');

console.log('Environment Variables:');
console.log('   LINKEDIN_CLIENT_ID =', clientId || '❌ NOT SET');
console.log('   LINKEDIN_CLIENT_SECRET =', clientSecret || '❌ NOT SET');
console.log('   LINKEDIN_REDIRECT_URI =', redirectUri || '❌ NOT SET');

console.log('\nValidation:');
console.log('   Client ID length:', clientId?.length || 0, 'chars', clientId?.length === 14 ? '✅' : '⚠️  (should be 14)');
console.log('   Client Secret starts with WPL_AP:', clientSecret?.startsWith('WPL_AP') ? '✅' : '❌');
console.log('   Client Secret length:', clientSecret?.length || 0, 'chars', clientSecret?.length > 30 ? '✅' : '⚠️');
console.log('   Redirect URI format:', redirectUri?.startsWith('http://localhost:3002') ? '✅' : '❌');

console.log('\n' + '='.repeat(70));
console.log('\n✅ Diagnostic Complete!\n');

console.log('🎯 Most Likely Issue: Client Secret is incorrect\n');

console.log('Action Items:');
console.log('1. Go to LinkedIn Developer Portal');
console.log('2. Find your app: ' + clientId);
console.log('3. Go to Auth tab → Application credentials');
console.log('4. Click "Show" next to Client Secret');
console.log('5. Copy the EXACT value');
console.log('6. Update backend/.env file');
console.log('7. Restart backend server');
console.log('8. Try OAuth flow again\n');

console.log('If secret is correct but still failing:');
console.log('→ The app may be deleted or suspended');
console.log('→ Create a new app and use new credentials\n');
