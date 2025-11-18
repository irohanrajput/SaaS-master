/**
 * Test the complete flow: Token -> Metrics -> Display
 */

import axios from 'axios';

const ACCESS_TOKEN = 'AQXZmGQsJi8YK5QbkDxcvyq7HqbwGNAs_Oc-0aC55IVY97jcx7AtqRU_1ooAiKL7a-Z-PF4d6FD2CgopyJQr1BCJvuFqVufYZZXliS2opA8-uq_d17JmVy7KJDugsAAdAss-z3dqfuhEP7xLqhITCapc2rwBzCmedwGMzGVKOSsgMvq7ElVmKDE8Hg35QQyqHQ9hTVJTyf1SdreNFHcWEkeXB11UXvxTRhNZoXTp8AmmtglvQ6ulXtpEk_BWJFSgJPVmZh3EeoCO3fBMXlZ9CN1fs0GLE3Izt2UxOqHhBf52TRySIXMfM2bV-lgo__foFG5gFXyVKOuwYBhPaXzIoeBvnyTATw';
const USER_EMAIL = 'contact.pawsomeai@gmail.com';

console.log('🧪 Testing Complete Flow\n');
console.log('='.repeat(70));

async function testCompleteFlow() {
    try {
        console.log('\n1️⃣ Testing backend endpoint with token...\n');
        
        const response = await axios.get('http://localhost:3010/api/linkedin/metrics', {
            params: {
                email: USER_EMAIL
            },
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        
        console.log('✅ Backend Response:\n');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.success && response.data.dataAvailable) {
            console.log('\n' + '='.repeat(70));
            console.log('\n✅ SUCCESS! Data ready for frontend:\n');
            console.log(`📊 Company: ${response.data.companyName}`);
            console.log(`   URL: ${response.data.companyUrl}`);
            console.log(`   Posts: ${response.data.posts.total}`);
            console.log(`   Likes: ${response.data.engagementScore.likes}`);
            console.log(`   Comments: ${response.data.engagementScore.comments}`);
            console.log(`   Total Reactions: ${response.data.engagementScore.totalReactions}`);
            console.log(`   Engagement Rate: ${response.data.engagementScore.engagementRate}%`);
            
            if (response.data.posts.topPerforming.length > 0) {
                console.log('\n📝 Top Post:');
                const post = response.data.posts.topPerforming[0];
                console.log(`   Message: ${post.message}`);
                console.log(`   Likes: ${post.likes}`);
                console.log(`   Comments: ${post.comments}`);
            }
            
            console.log('\n💡 This data should now display on your dashboard!');
            console.log('   Go to: http://localhost:3002/dashboard/social');
            console.log('   Select: LinkedIn');
        } else {
            console.log('\n⚠️  No data available');
            console.log('   Reason:', response.data.message || response.data.reason);
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCompleteFlow();
