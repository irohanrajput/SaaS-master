import 'dotenv/config';
import instagramMetricsService from './services/instagramMetricsService.js';

/**
 * Test Instagram Metrics Service
 * This script tests the Instagram Graph API integration
 */

// ============================================================
// ENVIRONMENT CHECKS & DEBUGGING
// ============================================================
console.log('🔧 Environment Checks');
console.log('='.repeat(60));

// Check if dotenv loaded
console.log('📦 dotenv status:', 'Loaded ✅');

// Check token
const token = process.env.INSTAGRAM_ACCESS_TOKEN;
console.log('\n🔑 Token Validation:');
console.log('  - Token exists:', token ? '✅ YES' : '❌ NO');

if (token) {
  console.log('  - Token length:', token.length, 'characters');
  console.log('  - First 30 chars:', token.substring(0, 30) + '...');
  console.log('  - Last 20 chars:', '...' + token.substring(token.length - 20));
  console.log('  - Contains spaces:', token.includes(' ') ? '⚠️ YES (PROBLEM!)' : '✅ NO');
  console.log('  - Contains newlines:', token.includes('\n') ? '⚠️ YES (PROBLEM!)' : '✅ NO');
  console.log('  - Token format:', token.startsWith('IGAA') ? '✅ Valid Instagram token' : 
                                    token.startsWith('EAAA') ? '✅ Valid Facebook token' : 
                                    '⚠️ Unknown format');
  
  // Validate token structure
  const validChars = /^[A-Za-z0-9_-]+$/.test(token);
  console.log('  - Valid characters:', validChars ? '✅ YES' : '⚠️ NO (contains invalid chars)');
} else {
  console.log('\n❌ ERROR: INSTAGRAM_ACCESS_TOKEN not found in environment');
  console.log('\n📝 Troubleshooting steps:');
  console.log('   1. Make sure .env file exists in project root');
  console.log('   2. Check .env file contains: INSTAGRAM_ACCESS_TOKEN=your_token');
  console.log('   3. Make sure there are no quotes around the token');
  console.log('   4. Make sure there are no spaces or newlines in the token');
  console.log('   5. Restart your terminal/IDE after creating .env file\n');
  process.exit(1);
}

// Check other environment variables (if any)
console.log('\n🌍 Other Environment Variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  - Working directory:', process.cwd());

console.log('\n' + '='.repeat(60) + '\n');

// ============================================================
// TEST FUNCTIONS
// ============================================================

async function testInstagramMetrics() {
  console.log('🧪 Testing Instagram Metrics Service\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Get Instagram Account
    console.log('\n📸 Test 1: Get Instagram Account');
    console.log('-'.repeat(60));
    console.log('⏳ Fetching account details...\n');
    
    const account = await instagramMetricsService.getInstagramAccount();
    
    if (account.success) {
      console.log('\n✅ Account retrieved successfully');
      console.log('📊 Account Details:');
      console.log(`   Username: @${account.username}`);
      console.log(`   Name: ${account.name}`);
      console.log(`   Followers: ${account.followers.toLocaleString()}`);
      console.log(`   Following: ${account.following.toLocaleString()}`);
      console.log(`   Posts: ${account.mediaCount}`);
      console.log(`   Account ID: ${account.id}`);
    } else {
      console.log('❌ Failed to get account');
      return;
    }

    // Test 2: Get Engagement Metrics
    console.log('\n📊 Test 2: Get Engagement Metrics (Last 30 days)');
    console.log('-'.repeat(60));
    console.log('⏳ Fetching engagement data...\n');
    
    const engagement = await instagramMetricsService.getEngagementMetrics('month');
    
    if (engagement.dataAvailable) {
      console.log('\n✅ Engagement metrics retrieved');
      console.log('📈 Metrics Summary:');
      console.log(`   Impressions: ${engagement.engagement.impressions.toLocaleString()}`);
      console.log(`   Reach: ${engagement.engagement.reach.toLocaleString()}`);
      console.log(`   Profile Views: ${engagement.engagement.profileViews.toLocaleString()}`);
      console.log(`   Likes: ${engagement.engagement.likes.toLocaleString()}`);
      console.log(`   Comments: ${engagement.engagement.comments.toLocaleString()}`);
      console.log(`   Total Engagement: ${engagement.engagement.totalEngagement.toLocaleString()}`);
      console.log(`   Engagement Rate: ${engagement.engagement.engagementRate}%`);
    } else {
      console.log('⚠️ Engagement metrics not available');
    }

    // Test 3: Get Top Posts
    console.log('\n📝 Test 3: Get Top Posts (Top 5)');
    console.log('-'.repeat(60));
    console.log('⏳ Fetching top posts...\n');
    
    const topPosts = await instagramMetricsService.getTopPosts(5);
    
    if (topPosts.length > 0) {
      console.log(`\n✅ Retrieved ${topPosts.length} top posts`);
      topPosts.forEach((post, index) => {
        console.log(`\n   📄 Post ${index + 1}:`);
        console.log(`      Type: ${post.type}`);
        console.log(`      Caption: ${post.caption.substring(0, 60)}...`);
        console.log(`      Posted: ${new Date(post.timestamp).toLocaleDateString()}`);
        console.log(`      Likes: ${post.engagement.likes.toLocaleString()}`);
        console.log(`      Comments: ${post.engagement.comments.toLocaleString()}`);
        console.log(`      Saves: ${post.engagement.saves.toLocaleString()}`);
        console.log(`      Reach: ${post.engagement.reach.toLocaleString()}`);
        console.log(`      Impressions: ${post.engagement.impressions.toLocaleString()}`);
        console.log(`      Total Engagement: ${post.engagement.total.toLocaleString()}`);
        console.log(`      URL: ${post.permalink}`);
      });
    } else {
      console.log('⚠️ No posts found');
    }

    // Test 4: Get Follower Growth
    console.log('\n📈 Test 4: Get Follower Growth (Last 30 days)');
    console.log('-'.repeat(60));
    console.log('⏳ Fetching follower growth data...\n');
    
    const followerGrowth = await instagramMetricsService.getFollowerGrowth(30);
    
    if (followerGrowth.length > 0) {
      console.log(`\n✅ Retrieved ${followerGrowth.length} days of follower data`);
      const latest = followerGrowth[followerGrowth.length - 1];
      const oldest = followerGrowth[0];
      const totalGrowth = latest.followers - oldest.followers;
      
      console.log('📊 Growth Summary:');
      console.log(`   Period: ${oldest.date} to ${latest.date}`);
      console.log(`   Starting followers: ${oldest.followers.toLocaleString()}`);
      console.log(`   Current followers: ${latest.followers.toLocaleString()}`);
      console.log(`   Net growth: ${totalGrowth >= 0 ? '+' : ''}${totalGrowth.toLocaleString()}`);
      console.log(`   Average daily change: ${(totalGrowth / followerGrowth.length).toFixed(1)}`);
      
      // Show last 5 days
      console.log('\n   Last 5 days:');
      followerGrowth.slice(-5).forEach(day => {
        console.log(`      ${day.date}: ${day.followers.toLocaleString()} (${day.net >= 0 ? '+' : ''}${day.net})`);
      });
    } else {
      console.log('⚠️ No follower growth data available');
    }

    // Test 5: Get Comprehensive Metrics
    console.log('\n🎯 Test 5: Get Comprehensive Metrics');
    console.log('-'.repeat(60));
    console.log('⏳ Fetching comprehensive metrics...\n');
    
    const comprehensive = await instagramMetricsService.getComprehensiveMetrics('month');
    
    if (comprehensive.dataAvailable) {
      console.log('\n✅ Comprehensive metrics retrieved');
      console.log('📊 Complete Report:');
      console.log(`   Username: @${comprehensive.username}`);
      console.log(`   Account ID: ${comprehensive.accountId}`);
      console.log(`   Name: ${comprehensive.name}`);
      console.log(`\n   🏆 Reputation Benchmark:`);
      console.log(`      Score: ${comprehensive.reputationBenchmark.score}/100`);
      console.log(`      Sentiment: ${comprehensive.reputationBenchmark.sentiment}`);
      console.log(`      Followers: ${comprehensive.reputationBenchmark.followers.toLocaleString()}`);
      console.log(`      Avg Engagement Rate: ${comprehensive.reputationBenchmark.avgEngagementRate}%`);
      console.log(`\n   📈 Engagement:`);
      console.log(`      Likes: ${comprehensive.engagementScore.likes.toLocaleString()}`);
      console.log(`      Comments: ${comprehensive.engagementScore.comments.toLocaleString()}`);
      console.log(`      Saves: ${comprehensive.engagementScore.saves.toLocaleString()}`);
      console.log(`      Reach: ${comprehensive.engagementScore.reach.toLocaleString()}`);
      console.log(`      Impressions: ${comprehensive.engagementScore.impressions.toLocaleString()}`);
      console.log(`\n   📝 Content:`);
      console.log(`      Top Posts: ${comprehensive.topPosts.length}`);
      console.log(`      Follower Growth Days: ${comprehensive.followerGrowth.length}`);
      console.log(`\n   🕐 Last Updated: ${new Date(comprehensive.lastUpdated).toLocaleString()}`);
    } else {
      console.log('❌ Failed to get comprehensive metrics');
      console.log(`   Reason: ${comprehensive.reason}`);
      if (comprehensive.error) {
        console.log(`   Error: ${JSON.stringify(comprehensive.error, null, 2)}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('\n📋 Error Details:');
    console.error('   Message:', error.message);
    console.error('   Status:', error.response?.status || 'N/A');
    console.error('   Status Text:', error.response?.statusText || 'N/A');
    
    if (error.response?.data) {
      console.error('\n   API Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('\n   Stack:', error.stack);
    
    console.log('\n💡 Common Issues:');
    console.log('   - Token expired: Generate a new token from Facebook Developer Dashboard');
    console.log('   - No Facebook Page connected: Link an Instagram Business account to a Facebook Page');
    console.log('   - Missing permissions: Ensure token has instagram_basic, instagram_manage_insights');
    console.log('   - Account not Business/Creator: Convert Instagram account to Business or Creator type\n');
  }
}

// ============================================================
// RUN TESTS
// ============================================================
console.log('🚀 Starting Instagram API Tests...\n');
testInstagramMetrics();
