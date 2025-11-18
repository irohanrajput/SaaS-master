import dotenv from 'dotenv';
dotenv.config();

import linkedinCommunityService from './services/linkedinCommunityService.js';

const TEST_EMAIL = 'contact.pawsomeai@gmail.com';

console.log('🧪 Testing LinkedIn Community API');
console.log('=====================================');
console.log('User Email:', TEST_EMAIL);
console.log('=====================================\n');

async function testLinkedInAPI() {
  try {
    console.log('📊 Fetching comprehensive LinkedIn metrics...\n');
    
    const metrics = await linkedinCommunityService.getComprehensiveMetrics(TEST_EMAIL, 'month');
    
    if (metrics.dataAvailable) {
      console.log('✅ SUCCESS! Metrics fetched');
      console.log('=====================================');
      console.log('Company Name:', metrics.companyName);
      console.log('Company URL:', metrics.companyUrl);
      console.log('Followers:', metrics.companyFollowers);
      console.log('Source:', metrics.source);
      console.log('\n📊 Engagement Score:');
      console.log('  Likes:', metrics.engagementScore.likes);
      console.log('  Comments:', metrics.engagementScore.comments);
      console.log('  Shares:', metrics.engagementScore.shares);
      console.log('  Engagement Rate:', metrics.engagementScore.engagementRate + '%');
      console.log('  Reach:', metrics.engagementScore.reach);
      console.log('\n📝 Top Posts:', metrics.topPosts.length);
      console.log('\n📈 Reputation Score:', metrics.reputationBenchmark.score);
      console.log('=====================================');
    } else {
      console.log('❌ No data available');
      console.log('Reason:', metrics.reason);
    }
    
  } catch (error) {
    console.error('❌ ERROR!');
    console.error('=====================================');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('=====================================');
  }
}

testLinkedInAPI();
