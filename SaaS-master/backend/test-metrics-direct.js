/**
 * Test LinkedIn metrics fetching directly with token
 */

import axios from 'axios';

const ACCESS_TOKEN = 'AQVYk0zb5tHOfBLacodHb8E6Uwe_HUMTNTBnoYgeXfZ0geaKo1xRhDj5VGXlsXS1xbzoqd8XVtULYzyBk0QkiPYEL0kHVagOdlifj6B1SpZMJH7-aGtEySUWG568Of0P-xZLBS9NQd9ohHA6iZTm-4flaXL-pC5JwJh8qEu4iVHQzQAsjIqkxBEu1ZU4kZOSdE6ak2E1shoZ6lC5a7xTlRWwL3oLUZ8Mtf7t9ORJ6EFePxh-wWqNUollhECygycpc4yGoCNXMjkmWEdt_CBb66IUdmm7aEFD9Jg0Ws_rcygRwlfYjwoTIfzWsh_cWciXYxwHqsM77lzbwhNFMsWQLNs892LIyQ';

console.log('📊 Fetching LinkedIn Metrics for Dashboard\n');
console.log('='.repeat(70));

async function fetchMetrics() {
    try {
        const headers = {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        };

        // Step 1: Get organizations
        console.log('\n1️⃣ Fetching organizations...');
        const orgResponse = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls', {
            params: {
                q: 'roleAssignee',
                projection: '(elements*(organizationalTarget,role,state))'
            },
            headers
        });

        const organizations = orgResponse.data.elements || [];
        const orgUrn = organizations[0].organizationalTarget;
        const orgId = orgUrn.split(':').pop();
        console.log(`✅ Organization: ${orgUrn}`);

        // Step 2: Get organization details
        console.log('\n2️⃣ Fetching organization details...');
        const orgDetailsResponse = await axios.get(`https://api.linkedin.com/v2/organizations/${orgId}`, {
            headers
        });
        const orgDetails = orgDetailsResponse.data;
        console.log(`✅ Company: ${orgDetails.localizedName}`);

        // Step 3: Get posts
        console.log('\n3️⃣ Fetching posts...');
        const postsResponse = await axios.get('https://api.linkedin.com/v2/shares', {
            params: {
                q: 'owners',
                owners: orgUrn,
                count: 50,
                sortBy: 'LAST_MODIFIED'
            },
            headers
        });

        const posts = postsResponse.data.elements || [];
        console.log(`✅ Found ${posts.length} posts`);

        // Format for dashboard
        const dashboardData = {
            success: true,
            dataAvailable: true,
            companyName: orgDetails.localizedName,
            companyUrl: `https://www.linkedin.com/company/${orgDetails.vanityName}`,
            companyFollowers: 0,
            engagementScore: {
                likes: 0,
                comments: 0,
                shares: 0,
                engagementRate: 0,
                reach: 0
            },
            posts: {
                total: posts.length,
                topPerforming: posts.slice(0, 5).map(post => ({
                    format: 'Post',
                    message: post.text?.text?.substring(0, 100) || '',
                    reach: '0',
                    likes: '0',
                    comments: '0',
                    shares: '0'
                }))
            },
            reputationBenchmark: {
                score: 50,
                followers: 0,
                avgEngagementRate: 0,
                sentiment: 'neutral'
            },
            lastUpdated: new Date().toISOString()
        };

        console.log('\n' + '='.repeat(70));
        console.log('\n📊 Dashboard Data:\n');
        console.log(JSON.stringify(dashboardData, null, 2));

        console.log('\n' + '='.repeat(70));
        console.log('\n✅ Metrics ready for dashboard!');
        console.log(`\n💡 Company: ${dashboardData.companyName}`);
        console.log(`   Total Posts: ${dashboardData.posts.total}`);
        console.log(`   Top Posts: ${dashboardData.posts.topPerforming.length}`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

fetchMetrics();
