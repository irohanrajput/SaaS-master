/**
 * Simple LinkedIn API Test with Hardcoded Token
 * 
 * 1. Connect LinkedIn in dashboard
 * 2. Copy access token from backend logs
 * 3. Paste it below
 * 4. Run: node backend/test-linkedin-simple.js
 */

import axios from 'axios';

// ⚠️ PASTE YOUR ACCESS TOKEN HERE
// Get it from backend logs after connecting LinkedIn
const ACCESS_TOKEN = 'AQVYk0zb5tHOfBLacodHb8E6Uwe_HUMTNTBnoYgeXfZ0geaKo1xRhDj5VGXlsXS1xbzoqd8XVtULYzyBk0QkiPYEL0kHVagOdlifj6B1SpZMJH7-aGtEySUWG568Of0P-xZLBS9NQd9ohHA6iZTm-4flaXL-pC5JwJh8qEu4iVHQzQAsjIqkxBEu1ZU4kZOSdE6ak2E1shoZ6lC5a7xTlRWwL3oLUZ8Mtf7t9ORJ6EFePxh-wWqNUollhECygycpc4yGoCNXMjkmWEdt_CBb66IUdmm7aEFD9Jg0Ws_rcygRwlfYjwoTIfzWsh_cWciXYxwHqsM77lzbwhNFMsWQLNs892LIyQ';

console.log('🧪 Simple LinkedIn API Test\n');
console.log('='.repeat(70));

async function testLinkedIn() {
    if (ACCESS_TOKEN === 'PASTE_YOUR_TOKEN_HERE') {
        console.log('\n❌ Please paste your access token first!');
        console.log('\n📝 Steps:');
        console.log('   1. Go to: http://localhost:3002/dashboard/social');
        console.log('   2. Click "Connect LinkedIn"');
        console.log('   3. Complete OAuth');
        console.log('   4. Check backend console for: "🔑 Access Token: ..."');
        console.log('   5. Copy the full token');
        console.log('   6. Paste it in this file at line 13');
        console.log('   7. Run: node backend/test-linkedin-simple.js');
        return;
    }

    console.log('\n✅ Token provided:', ACCESS_TOKEN.substring(0, 30) + '...');

    try {
        // Step 0: Test basic profile first (simpler endpoint)
        console.log('\n📋 Step 0: Testing token with basic profile...');
        console.log('⏳ Waiting 15 seconds for token to propagate...');
        await new Promise(resolve => setTimeout(resolve, 15000));

        try {
            const meResponse = await axios.get('https://api.linkedin.com/v2/me', {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Token works! User ID:', meResponse.data.id);
        } catch (meError) {
            console.log('❌ Basic profile test failed:', meError.response?.data || meError.message);
            console.log('\n💡 Token is not working at all. This could mean:');
            console.log('   1. Token was revoked by LinkedIn');
            console.log('   2. App credentials are wrong');
            console.log('   3. Scopes are not approved');
            throw meError;
        }

        // Step 1: Get organizations
        console.log('\n📋 Step 1: Fetching organizations...');

        // Try v2 API first (older, more stable)
        console.log('   Trying v2 API endpoint...');
        const orgResponse = await axios.get('https://api.linkedin.com/v2/organizationAcls', {
            params: {
                q: 'roleAssignee',
                projection: '(elements*(organizationalTarget~,roleAssignee,state))'
            },
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const organizations = orgResponse.data.elements || [];
        console.log(`\n✅ Found ${organizations.length} organization(s):\n`);

        if (organizations.length === 0) {
            console.log('❌ No organizations found!');
            console.log('   Make sure you are an admin of a LinkedIn Company Page');
            return;
        }

        organizations.forEach((org, index) => {
            const orgData = org['organizationalTarget~'];
            const orgUrn = org.organizationalTarget;
            const orgId = orgUrn.split(':').pop();

            console.log(`${index + 1}. ${orgData?.localizedName || 'Unknown'}`);
            console.log(`   URN: ${orgUrn}`);
            console.log(`   ID: ${orgId}`);
            console.log(`   Role: ${org.roleAssignee?.role || 'N/A'}`);
            console.log('');
        });

        // Step 2: Get page statistics
        const firstOrg = organizations[0];
        const orgUrn = firstOrg.organizationalTarget;
        const orgName = firstOrg['organizationalTarget~']?.localizedName || 'Unknown';

        console.log('\n📋 Step 2: Fetching page statistics...');
        console.log(`   Organization: ${orgName}`);

        const statsResponse = await axios.get('https://api.linkedin.com/rest/organizationPageStatistics', {
            params: {
                q: 'organization',
                organization: orgUrn
            },
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'LinkedIn-Version': '202410',
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ Page Statistics:\n');
        console.log(JSON.stringify(statsResponse.data, null, 2));

        // Step 3: Get posts
        console.log('\n📋 Step 3: Fetching organization posts...');

        const postsResponse = await axios.get('https://api.linkedin.com/rest/posts', {
            params: {
                author: orgUrn,
                q: 'author',
                count: 10
            },
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'LinkedIn-Version': '202410',
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
            }
        });

        const posts = postsResponse.data.elements || [];
        console.log(`\n✅ Found ${posts.length} posts:\n`);

        posts.forEach((post, index) => {
            console.log(`${index + 1}. Post ID: ${post.id}`);
            console.log(`   Created: ${new Date(post.createdAt).toISOString()}`);
            console.log(`   Commentary: ${post.commentary?.substring(0, 100) || 'N/A'}...`);
            console.log('');
        });

        console.log('\n' + '='.repeat(70));
        console.log('\n✅ All tests passed!');
        console.log('\n💡 Your LinkedIn integration is working!');
        console.log('   - Organizations: ✅');
        console.log('   - Page Statistics: ✅');
        console.log('   - Posts: ✅');

    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.response) {
            console.error('\n📋 Details:');
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 401) {
                console.log('\n💡 Token expired or invalid');
                console.log('   Get a fresh token by reconnecting LinkedIn');
            }
        }
    }
}

testLinkedIn();
