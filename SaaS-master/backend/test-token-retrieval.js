/**
 * Test token retrieval from database
 */

import oauthTokenService from './services/oauthTokenService.js';

const userEmail = 'contact.pawsomeai@gmail.com';

console.log('🔍 Testing Token Retrieval\n');
console.log('='.repeat(70));

async function testRetrieval() {
    try {
        console.log(`\n📊 Fetching tokens for: ${userEmail}\n`);
        
        const tokens = await oauthTokenService.getTokens(userEmail, 'linkedin');
        
        if (tokens) {
            console.log('✅ Tokens found!\n');
            console.log('Access Token (first 40 chars):', tokens.access_token?.substring(0, 40) + '...');
            console.log('Refresh Token:', tokens.refresh_token ? 'Present' : 'Not provided');
            console.log('Expires At:', tokens.expires_at ? new Date(tokens.expires_at).toISOString() : 'N/A');
            console.log('Scopes:', tokens.scope || 'N/A');
            
            // Check if expired
            if (tokens.expires_at) {
                const isExpired = new Date(tokens.expires_at) < new Date();
                console.log('Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
            }
        } else {
            console.log('❌ No tokens found in database');
            console.log('\n💡 This could mean:');
            console.log('   1. Tokens were not stored properly');
            console.log('   2. Supabase connection issue');
            console.log('   3. Wrong email address');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    }
}

testRetrieval();
