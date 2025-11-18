/**
 * Direct LinkedIn API Test - No Supabase
 * Just use the active token to test endpoints
 */

import axios from 'axios';

// Your ACTIVE token
const ACCESS_TOKEN = 'AQVYk0zb5tHOfBLacodHb8E6Uwe_HUMTNTBnoYgeXfZ0geaKo1xRhDj5VGXlsXS1xbzoqd8XVtULYzyBk0QkiPYEL0kHVagOdlifj6B1SpZMJH7-aGtEySUWG568Of0P-xZLBS9NQd9ohHA6iZTm-4flaXL-pC5JwJh8qEu4iVHQzQAsjIqkxBEu1ZU4kZOSdE6ak2E1shoZ6lC5a7xTlRWwL3oLUZ8Mtf7t9ORJ6EFePxh-wWqNUollhECygycpc4yGoCNXMjkmWEdt_CBb66IUdmm7aEFD9Jg0Ws_rcygRwlfYjwoTIfzWsh_cWciXYxwHqsM77lzbwhNFMsWQLNs892LIyQ';

console.log('🧪 Direct LinkedIn API Test\n');
console.log('='.repeat(70));

async function testLinkedInAPI() {
    try {
        // Step 1: Test basic profile
        console.log('\n1️⃣ Testing /v2/me endpoint...\n');
        
        const meResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Profile fetched:');
        console.log(JSON.stringify(meResponse.data, null, 2));

        // Step 2: Get organizations (using v2 API)
        console.log('\n2️⃣ Testing /v2/organizationalEntityAcls endpoint...\n');
        
        const orgResponse = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls', {
            params: {
                q: 'roleAssignee',
                projection: '(elements*(organizationalTarget,role,state))'
            },
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Organizations fetched:');
        console.log(JSON.stringify(orgResponse.data, null, 2));
        
        const organizations = orgResponse.data.elements || [];
        if (organizations.length === 0) {
            console.log('\n⚠️  No organizations found with ADMINISTRATOR role!');
            console.log('   You need to be an admin of a LinkedIn Company Page');
            return;
        }
        
        const firstOrg = organizations[0];
        const orgUrn = firstOrg.organizationalTarget || firstOrg.organization;
        
        if (!orgUrn) {
            console.log('\n⚠️  No organization URN found in response');
            console.log('   Response:', JSON.stringify(firstOrg, null, 2));
            return;
        }
        
        const orgId = orgUrn.split(':').pop();
        
        console.log(`\n✅ Using organization URN: ${orgUrn}`);
        console.log(`   ID: ${orgId}`);

        // Step 3: Get organization details
        console.log('\n3️⃣ Testing /v2/organizations/{id} endpoint...\n');
        
        const orgDetailsResponse = await axios.get(`https://api.linkedin.com/v2/organizations/${orgId}`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Organization Details:');
        console.log(JSON.stringify(orgDetailsResponse.data, null, 2));

        // Step 4: Get shares/posts
        console.log('\n4️⃣ Testing /v2/shares endpoint...\n');
        
        const postsResponse = await axios.get('https://api.linkedin.com/v2/shares', {
            params: {
                q: 'owners',
                owners: orgUrn,
                count: 10,
                sortBy: 'LAST_MODIFIED'
            },
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Posts fetched:');
        console.log(JSON.stringify(postsResponse.data, null, 2));
        
        const posts = postsResponse.data.elements || [];
        console.log(`\n📊 Found ${posts.length} posts`);
        
        if (posts.length > 0) {
            console.log('\n📝 Post details:');
            posts.forEach((post, index) => {
                console.log(`\n   Post ${index + 1}:`);
                console.log(`   ID: ${post.id}`);
                console.log(`   Created: ${new Date(post.created.time).toISOString()}`);
                console.log(`   Text: ${post.text?.text?.substring(0, 100) || 'N/A'}...`);
                console.log(`   Activity URN: ${post.activity}`);
            });
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('\n✅ All API tests passed!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testLinkedInAPI();
