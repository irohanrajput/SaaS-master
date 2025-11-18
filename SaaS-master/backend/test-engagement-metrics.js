/**
 * Test LinkedIn Engagement Metrics Fetching
 */

import axios from 'axios';

// Your latest active token from the logs
const ACCESS_TOKEN = 'AQXZmGQsJi8YK5QbkDxcvyq7HqbwGNAs_Oc-0aC55IVY97jcx7AtqRU_1ooAiKL7a-Z-PF4d6FD2CgopyJQr1BCJvuFqVufYZZXliS2opA8-uq_d17JmVy7KJDugsAAdAss-z3dqfuhEP7xLqhITCapc2rwBzCmedwGMzGVKOSsgMvq7ElVmKDE8Hg35QQyqHQ9hTVJTyf1SdreNFHcWEkeXB11UXvxTRhNZoXTp8AmmtglvQ6ulXtpEk_BWJFSgJPVmZh3EeoCO3fBMXlZ9CN1fs0GLE3Izt2UxOqHhBf52TRySIXMfM2bV-lgo__foFG5gFXyVKOuwYBhPaXzIoeBvnyTATw';

console.log('📊 Testing LinkedIn Engagement Metrics\n');
console.log('='.repeat(70));

async function testEngagement() {
    try {
        const headers = {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        };

        // Step 1: Get organization
        console.log('\n1️⃣ Getting organization...');
        const orgResponse = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls', {
            params: {
                q: 'roleAssignee',
                projection: '(elements*(organizationalTarget,role,state))'
            },
            headers
        });

        const orgUrn = orgResponse.data.elements[0].organizationalTarget;
        console.log(`✅ Organization: ${orgUrn}`);

        // Step 2: Get posts
        console.log('\n2️⃣ Getting posts...');
        const postsResponse = await axios.get('https://api.linkedin.com/v2/shares', {
            params: {
                q: 'owners',
                owners: orgUrn,
                count: 10,
                sortBy: 'LAST_MODIFIED'
            },
            headers
        });

        const posts = postsResponse.data.elements || [];
        console.log(`✅ Found ${posts.length} posts`);

        if (posts.length === 0) {
            console.log('\n⚠️  No posts found!');
            return;
        }

        // Step 3: Get engagement for first post
        const firstPost = posts[0];
        const postId = firstPost.id;
        const postUrn = `urn:li:share:${postId}`; // Convert to URN format
        
        console.log(`\n3️⃣ Getting engagement for post:`);
        console.log(`   Post ID: ${postId}`);
        console.log(`   Post URN: ${postUrn}`);
        console.log(`   Post text: ${firstPost.text?.text?.substring(0, 60)}...`);

        const encodedUrn = encodeURIComponent(postUrn);
        const engagementResponse = await axios.get(
            `https://api.linkedin.com/v2/socialMetadata/${encodedUrn}`,
            { headers }
        );

        const metrics = engagementResponse.data;
        
        console.log('\n✅ Engagement Metrics:\n');
        console.log(JSON.stringify(metrics, null, 2));

        // Parse metrics
        const reactionSummaries = metrics.reactionSummaries || {};
        const reactions = Object.entries(reactionSummaries).map(([type, data]) => ({
            reactionType: type,
            count: data.count || 0
        }));
        
        const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
        const likes = reactionSummaries.LIKE?.count || 0;
        const comments = metrics.commentSummary?.count || 0;

        console.log('\n' + '='.repeat(70));
        console.log('\n📊 Summary:');
        console.log(`   👍 Likes: ${likes}`);
        console.log(`   💬 Comments: ${comments}`);
        console.log(`   ❤️  Total Reactions: ${totalReactions}`);
        console.log(`   🎯 Total Engagement: ${totalReactions + comments}`);

        if (reactions.length > 0) {
            console.log('\n   Reaction Breakdown:');
            reactions.forEach(r => {
                const emoji = {
                    'LIKE': '👍',
                    'PRAISE': '🎉',
                    'EMPATHY': '❤️',
                    'INTEREST': '💡',
                    'APPRECIATION': '🙌',
                    'MAYBE': '🤔'
                }[r.reactionType] || '✨';
                console.log(`      ${emoji} ${r.reactionType}: ${r.count}`);
            });
        }

        console.log('\n' + '='.repeat(70));
        console.log('\n✅ Engagement metrics fetched successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testEngagement();
