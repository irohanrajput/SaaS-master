/**
 * Test Facebook Engagement Data
 */

console.log('🧪 Testing Facebook Engagement Data\n');

// Test the API directly
fetch('http://localhost:3010/api/facebook/metrics?email=contact.pawsomeai@gmail.com&period=month')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Facebook API Response:\n');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n📊 Engagement Score Details:');
    console.log('Likes:', data.engagementScore?.likes);
    console.log('Comments:', data.engagementScore?.comments);
    console.log('Shares:', data.engagementScore?.shares);
    console.log('Reach:', data.engagementScore?.reach);
    console.log('Engagement Rate:', data.engagementScore?.engagementRate);
    
    const totalInteractions = (data.engagementScore?.likes || 0) + 
                             (data.engagementScore?.comments || 0) + 
                             (data.engagementScore?.shares || 0);
    
    console.log('\n🔢 Calculated:');
    console.log('Total Interactions:', totalInteractions);
    
    if (data.engagementScore?.reach && data.engagementScore.reach > 0) {
      const rate = (totalInteractions / data.engagementScore.reach) * 100;
      console.log('Engagement Rate (calculated):', rate.toFixed(2) + '%');
    } else {
      console.log('⚠️ Reach is 0 or missing!');
      console.log('Fallback score:', Math.min(100, totalInteractions * 2) + '%');
    }
    
    console.log('\n📝 Top Posts:');
    data.topPosts?.forEach((post, i) => {
      console.log(`\nPost ${i + 1}:`);
      console.log('  Reach:', post.reach);
      console.log('  Likes:', post.likes);
      console.log('  Comments:', post.comments);
      console.log('  Shares:', post.shares);
    });
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
