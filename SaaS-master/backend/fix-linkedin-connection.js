/**
 * Fix LinkedIn Connection - Complete Reset
 * 
 * This script helps you completely reset your LinkedIn connection
 * and start fresh to avoid token revocation issues.
 */

import oauthTokenService from './services/oauthTokenService.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

console.log('🔧 LinkedIn Connection Fix Tool\n');
console.log('='.repeat(70));
console.log('\nThis tool will help you fix the "token revoked" issue by:');
console.log('1. Disconnecting your current LinkedIn connection');
console.log('2. Clearing all stored tokens');
console.log('3. Providing steps to reconnect properly\n');
console.log('='.repeat(70));

async function fixConnection() {
  try {
    // Get user email
    const email = await question('\n📧 Enter your email address: ');
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address');
      rl.close();
      return;
    }
    
    console.log('\n1️⃣ Checking current LinkedIn connection...\n');
    
    const tokens = await oauthTokenService.getTokens(email, 'linkedin');
    
    if (!tokens) {
      console.log('✅ No LinkedIn connection found');
      console.log('   You can proceed to connect LinkedIn in the dashboard');
      rl.close();
      return;
    }
    
    console.log('📋 Current Connection Details:');
    console.log('   Access Token:', tokens.access_token ? tokens.access_token.substring(0, 40) + '...' : 'N/A');
    console.log('   Scopes:', tokens.scope || 'N/A');
    console.log('   Expires At:', tokens.expires_at ? new Date(tokens.expires_at).toISOString() : 'N/A');
    
    // Check if token is expired or revoked
    if (tokens.expires_at) {
      const isExpired = new Date(tokens.expires_at) < new Date();
      console.log('   Status:', isExpired ? '❌ EXPIRED' : '✅ Valid (but may be revoked)');
    }
    
    const confirm = await question('\n⚠️  Do you want to disconnect and reset? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Operation cancelled');
      rl.close();
      return;
    }
    
    console.log('\n2️⃣ Disconnecting LinkedIn...\n');
    
    await oauthTokenService.deleteTokens(email, 'linkedin');
    
    console.log('✅ LinkedIn connection removed');
    console.log('✅ All tokens deleted from database');
    
    console.log('\n3️⃣ Next Steps:\n');
    console.log('📋 To reconnect LinkedIn properly:');
    console.log('');
    console.log('1. Clear your browser data:');
    console.log('   - Open DevTools (F12)');
    console.log('   - Go to Application tab');
    console.log('   - Clear Storage → Clear site data');
    console.log('   - Or run in console: sessionStorage.clear(); localStorage.clear();');
    console.log('');
    console.log('2. Close ALL browser tabs with localhost:3002');
    console.log('');
    console.log('3. Open a fresh tab and go to:');
    console.log('   http://localhost:3002/dashboard/social');
    console.log('');
    console.log('4. Select "LinkedIn" from the dropdown');
    console.log('');
    console.log('5. Click "Connect LinkedIn"');
    console.log('');
    console.log('6. Complete the OAuth flow WITHOUT:');
    console.log('   ❌ Refreshing the page');
    console.log('   ❌ Going back in browser');
    console.log('   ❌ Opening multiple tabs');
    console.log('');
    console.log('7. Wait for automatic redirect to dashboard');
    console.log('');
    console.log('8. Verify connection:');
    console.log('   node backend/diagnose-token-revocation.js');
    console.log('');
    console.log('='.repeat(70));
    console.log('\n✅ Reset complete! Follow the steps above to reconnect.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

fixConnection();
