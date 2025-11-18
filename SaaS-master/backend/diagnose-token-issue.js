/**
 * Diagnose LinkedIn Token Issue
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 LinkedIn Token Issue Diagnosis\n');
console.log('='.repeat(70));

console.log('\n📋 Current Configuration:');
console.log('   Client ID:', process.env.LINKEDIN_CLIENT_ID);
console.log('   Client Secret:', process.env.LINKEDIN_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('   Redirect URI:', process.env.LINKEDIN_REDIRECT_URI);

console.log('\n🚨 REVOKED_ACCESS_TOKEN Error Analysis:\n');

console.log('This error means LinkedIn is immediately revoking your token.');
console.log('This is NOT a propagation delay issue.\n');

console.log('Common Causes:\n');

console.log('1️⃣ WRONG LINKEDIN APP');
console.log('   → You may be using a different app than the one you configured');
console.log('   → Check: https://www.linkedin.com/developers/apps');
console.log('   → Verify Client ID matches: ' + process.env.LINKEDIN_CLIENT_ID);
console.log('');

console.log('2️⃣ APP WAS DELETED OR SUSPENDED');
console.log('   → Your LinkedIn app may have been deleted');
console.log('   → Or suspended by LinkedIn for policy violations');
console.log('   → Check app status in developer portal');
console.log('');

console.log('3️⃣ REDIRECT URI MISMATCH');
console.log('   → The redirect URI used during OAuth doesn\'t match app settings');
console.log('   → Current: ' + process.env.LINKEDIN_REDIRECT_URI);
console.log('   → Must match EXACTLY in LinkedIn Developer Portal');
console.log('');

console.log('4️⃣ SCOPES NOT APPROVED');
console.log('   → The scopes you\'re requesting are not approved for your app');
console.log('   → Check "Products" tab in LinkedIn Developer Portal');
console.log('   → Community Management API must be "Approved"');
console.log('');

console.log('5️⃣ USING WRONG LINKEDIN ACCOUNT');
console.log('   → You may be logging in with a different LinkedIn account');
console.log('   → Than the one that has admin access to the app');
console.log('');

console.log('6️⃣ TOKEN BEING REVOKED BY LINKEDIN AUTOMATICALLY');
console.log('   → LinkedIn may be detecting suspicious activity');
console.log('   → Or the app is in development mode with restrictions');
console.log('');

console.log('='.repeat(70));
console.log('\n🔧 RECOMMENDED ACTIONS:\n');

console.log('Action 1: Verify App Exists and Is Active');
console.log('   1. Go to: https://www.linkedin.com/developers/apps');
console.log('   2. Find app with Client ID: ' + process.env.LINKEDIN_CLIENT_ID);
console.log('   3. Check if it exists and is not suspended');
console.log('   4. Check "Settings" tab for app status');
console.log('');

console.log('Action 2: Check Products Tab');
console.log('   1. Go to your app → "Products" tab');
console.log('   2. Check "Community Management API" status');
console.log('   3. Must show "Added" or "Approved"');
console.log('   4. If "In Review" or missing, that\'s the problem');
console.log('');

console.log('Action 3: Verify Redirect URI');
console.log('   1. Go to your app → "Auth" tab');
console.log('   2. Check "Redirect URLs" section');
console.log('   3. Must include: ' + process.env.LINKEDIN_REDIRECT_URI);
console.log('   4. Must match EXACTLY (no trailing slash, correct port)');
console.log('');

console.log('Action 4: Try Creating a NEW App');
console.log('   1. Go to: https://www.linkedin.com/developers/apps');
console.log('   2. Click "Create app"');
console.log('   3. Fill in details and create');
console.log('   4. Add redirect URI');
console.log('   5. Request "Community Management API"');
console.log('   6. Update .env with new credentials');
console.log('   7. Test again');
console.log('');

console.log('Action 5: Check LinkedIn Account');
console.log('   1. Make sure you\'re logging in with the correct LinkedIn account');
console.log('   2. The account must have admin access to a Company Page');
console.log('   3. Verify at: https://www.linkedin.com/company/[your-company]/admin/');
console.log('');

console.log('='.repeat(70));
console.log('\n💡 MOST LIKELY ISSUE:\n');

console.log('Based on the immediate revocation, the most likely causes are:');
console.log('   1. ❌ Community Management API is NOT actually approved');
console.log('   2. ❌ App was deleted or suspended');
console.log('   3. ❌ Using wrong Client ID/Secret combination');
console.log('');

console.log('🎯 NEXT STEP:');
console.log('   Go to: https://www.linkedin.com/developers/apps/' + process.env.LINKEDIN_CLIENT_ID);
console.log('   Check if the app loads. If it shows "App not found", the app is deleted.');
console.log('');
