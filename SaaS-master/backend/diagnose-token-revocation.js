/**
 * Diagnose LinkedIn Token Revocation Issue
 * 
 * This script helps identify why tokens are being revoked immediately after connection
 */

import oauthTokenService from './services/oauthTokenService.js';

const userEmail = 'test@example.com'; // Replace with your email

console.log('🔍 LinkedIn Token Revocation Diagnostic\n');
console.log('='.repeat(70));

async function diagnose() {
    try {
        console.log('\n1️⃣ Checking stored LinkedIn tokens...\n');
        
        const tokens = await oauthTokenService.getTokens(userEmail, 'linkedin');
        
        if (!tokens) {
            console.log('❌ No LinkedIn tokens found for:', userEmail);
            console.log('\n💡 This means:');
            console.log('   - You haven\'t connected LinkedIn yet, OR');
            console.log('   - The tokens were deleted');
            return;
        }
        
        console.log('✅ LinkedIn tokens found!');
        console.log('\n📋 Token Details:');
        console.log('   Access Token (first 40 chars):', tokens.access_token?.substring(0, 40) + '...');
        console.log('   Refresh Token:', tokens.refresh_token ? 'Present' : 'Not provided');
        console.log('   Scopes:', tokens.scope || 'N/A');
        console.log('   Expires At:', tokens.expires_at ? new Date(tokens.expires_at).toISOString() : 'N/A');
        console.log('   Last Code Used:', tokens.last_code ? tokens.last_code.substring(0, 20) + '...' : 'N/A');
        
        // Check if token is expired
        if (tokens.expires_at) {
            const expiresAt = new Date(tokens.expires_at);
            const now = new Date();
            const isExpired = expiresAt < now;
            
            console.log('\n⏰ Token Expiration:');
            console.log('   Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
            console.log('   Expires:', expiresAt.toISOString());
            console.log('   Current Time:', now.toISOString());
            
            if (!isExpired) {
                const hoursRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
                const daysRemaining = hoursRemaining / 24;
                console.log('   Time Remaining:', `${daysRemaining.toFixed(1)} days (${hoursRemaining.toFixed(1)} hours)`);
            }
        }
        
        console.log('\n2️⃣ Testing token with LinkedIn API...\n');
        
        // Test the token by calling LinkedIn's /me endpoint
        const axios = (await import('axios')).default;
        
        try {
            const response = await axios.get('https://api.linkedin.com/v2/me', {
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Token is VALID and working!');
            console.log('   User ID:', response.data.id);
            console.log('   Name:', `${response.data.localizedFirstName} ${response.data.localizedLastName}`);
            
        } catch (error) {
            console.log('❌ Token is INVALID or REVOKED');
            
            if (error.response) {
                console.log('\n📋 LinkedIn API Response:');
                console.log('   Status:', error.response.status);
                console.log('   Error:', JSON.stringify(error.response.data, null, 2));
                
                if (error.response.status === 401) {
                    const errorData = error.response.data;
                    
                    if (errorData.code === 'REVOKED_ACCESS_TOKEN') {
                        console.log('\n🚨 TOKEN WAS REVOKED BY LINKEDIN');
                        console.log('\n💡 Common reasons for token revocation:');
                        console.log('   1. Authorization code was used multiple times');
                        console.log('   2. User manually revoked access in LinkedIn settings');
                        console.log('   3. LinkedIn detected suspicious activity');
                        console.log('   4. App credentials were changed');
                        console.log('   5. Scopes were modified after token was issued');
                        
                        console.log('\n🔧 How to fix:');
                        console.log('   1. Disconnect LinkedIn in your dashboard');
                        console.log('   2. Clear browser cache and sessionStorage');
                        console.log('   3. Reconnect LinkedIn (get a fresh authorization code)');
                        console.log('   4. Make sure the authorization code is only used ONCE');
                        
                    } else if (errorData.serviceErrorCode === 65601) {
                        console.log('\n🚨 TOKEN IS EXPIRED OR INVALID');
                        console.log('\n🔧 How to fix:');
                        console.log('   1. Reconnect LinkedIn to get a new token');
                    }
                }
            }
        }
        
        console.log('\n3️⃣ Checking for duplicate authorization code usage...\n');
        
        if (tokens.last_code) {
            console.log('⚠️  Authorization code tracking is enabled');
            console.log('   Last code used:', tokens.last_code.substring(0, 20) + '...');
            console.log('\n💡 If you see "code_already_used" errors:');
            console.log('   - The callback page might be called twice');
            console.log('   - Browser might be auto-refreshing the callback URL');
            console.log('   - Multiple tabs might be processing the same code');
        } else {
            console.log('✅ No authorization code tracking found');
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('\n📊 Summary:');
        console.log('   Token stored:', tokens ? '✅' : '❌');
        console.log('   Token expired:', tokens.expires_at && new Date(tokens.expires_at) < new Date() ? '❌' : '✅');
        console.log('   Token works with API:', '(tested above)');
        
    } catch (error) {
        console.error('\n❌ Error during diagnosis:', error.message);
        console.error(error);
    }
}

diagnose();
