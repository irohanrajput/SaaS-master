/**
 * Test LinkedIn Metrics Fetching
 * 
 * This script tests fetching LinkedIn metrics using the stored token
 */

import linkedinCommunityService from './services/linkedinCommunityService.js';

const userEmail = 'test@example.com'; // Replace with your email

console.log('📊 Testing LinkedIn Metrics Fetching\n');
console.log('='.repeat(70));
console.log(`\n📧 User: ${userEmail}\n`);

async function testMetrics() {
    try {
        console.log('1️⃣ Fetching comprehensive LinkedIn metrics...\n');
        
        const metrics = await linkedinCommunityService.getComprehensiveMetrics(userEmail, 'month');
        
        console.log('\n' + '='.repeat(70));
        console.log('\n📊 RESULTS:\n');
        
        if (!metrics.success) {
            console.log('❌ Failed to fetch metrics');
            console.log('   Error:', metrics.error);
            console.log('   Message:', metrics.message);
            return;
        }
        
        if (!metrics.dataAvailable) {
            console.log('⚠️  No data available');
            console.log('   Reason:', metrics.message);
            return;
        }
        
        console.log('✅ Metrics fetched successfully!\n');
        
        // Organization Info
        console.log('🏢 Organization:');
        console.log(`   Name: ${metrics.organization.name}`);
        console.log(`   ID: ${metrics.organization.id}`);
        console.log(`   Vanity Name: ${metrics.organization.vanityName || 'N/A'}`);
        
        // Followers
        console.log('\n👥 Followers:');
        console.log(`   Total: ${metrics.followers.total.toLocaleString()}`);
        
        // Engagement
        console.log('\n💬 Engagement:');
        console.log(`   Likes: ${metrics.engagement.likes.toLocaleString()}`);
        console.log(`   Comments: ${metrics.engagement.comments.toLocaleString()}`);
        console.log(`   Shares: ${metrics.engagement.shares.toLocaleString()}`);
        console.log(`   Total: ${metrics.engagement.total.toLocaleString()}`);
        console.log(`   Rate: ${metrics.engagement.engagementRate}`);
        
        // Posts
        console.log('\n📝 Posts:');
        console.log(`   Total: ${metrics.posts.total}`);
        console.log(`   Top Performing: ${metrics.posts.topPerforming.length}`);
        
        if (metrics.posts.topPerforming.length > 0) {
            console.log('\n🏆 Top 3 Posts:');
            metrics.posts.topPerforming.slice(0, 3).forEach((post, index) => {
                console.log(`\n   ${index + 1}. ${post.message.substring(0, 60)}...`);
                console.log(`      Likes: ${post.likes} | Comments: ${post.comments} | Shares: ${post.shares}`);
                console.log(`      Reach: ${post.reach}`);
            });
        }
        
        // Summary
        console.log('\n📈 Averages:');
        console.log(`   Likes per post: ${metrics.summary.averageLikesPerPost}`);
        console.log(`   Comments per post: ${metrics.summary.averageCommentsPerPost}`);
        console.log(`   Shares per post: ${metrics.summary.averageSharesPerPost}`);
        
        console.log('\n' + '='.repeat(70));
        console.log('\n✅ All metrics fetched successfully!');
        console.log('\n💡 This data will be displayed on your dashboard at:');
        console.log('   http://localhost:3002/dashboard/social');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    }
}

testMetrics();
