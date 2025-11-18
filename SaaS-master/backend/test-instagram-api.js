// Test Instagram API to find username to CID conversion
import axios from 'axios';

async function testInstagramUserInfo() {
  const username = 'instagram'; // Test with Instagram's official account
  
  // Try different possible endpoints
  const endpoints = [
    `/info?username=${username}`,
    `/profile?username=${username}`,
    `/statistics/user?username=${username}`,
    `/user/info?username=${username}`,
    `/?username=${username}`
  ];
  
  for (const endpoint of endpoints) {
    const url = `https://instagram-statistics-api.p.rapidapi.com${endpoint}`;
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'beb04a38acmsh6d3e993c54c2d4fp1a525fjsnecb3ffee9285',
        'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com'
      }
    };

    try {
      console.log(`\n🔍 Trying endpoint: ${endpoint}`);
      const response = await axios(url, options);
      
      console.log('✅ SUCCESS! Response Status:', response.status);
      console.log('\n📊 Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Check for CID
      const dataStr = JSON.stringify(response.data);
      if (dataStr.includes('INST:') || dataStr.includes('cid') || dataStr.includes('creator_id')) {
        console.log('\n🎯 FOUND POTENTIAL CID FIELD!');
      }
      
      return; // Stop on first success
      
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status || error.message}`);
    }
  }
  
  console.log('\n⚠️ All endpoints failed. Trying alternative API...');
}

// Also test getting activity with a known CID
async function testInstagramActivity() {
  const cid = 'INST:17841400005463628'; // Example CID
  const url = `https://instagram-statistics-api.p.rapidapi.com/statistics/activity?cid=${encodeURIComponent(cid)}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'beb04a38acmsh6d3e993c54c2d4fp1a525fjsnecb3ffee9285',
      'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com'
    }
  };

  try {
    console.log(`\n\n🔍 Testing Instagram Activity API with CID: ${cid}\n`);
    const response = await axios(url, options);
    
    console.log('✅ Response Status:', response.status);
    console.log('\n📊 Sample Activity Data:');
    const sampleData = response.data.data?.slice(0, 3);
    console.log(JSON.stringify(sampleData, null, 2));
    console.log(`\nTotal data points: ${response.data.data?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Test the service
async function testInstagramService() {
  const instagramService = (await import('./services/instagramEngagementService.js')).default;
  
  console.log('\n\n📱 TESTING INSTAGRAM SERVICE\n');
  console.log('══════════════════════════════════════════\n');
  
  // Test with The Rock's Instagram
  const username = 'therock';
  
  const result = await instagramService.getCompleteEngagementMetrics(username);
  
  if (result.success) {
    console.log('\n✅ Instagram Engagement Analysis Complete!\n');
    console.log('Profile Info:');
    console.log('  Username:', result.profile.username);
    console.log('  Name:', result.profile.name);
    console.log('  Followers:', result.profile.followers.toLocaleString());
    console.log('  Verified:', result.profile.verified);
    console.log('  Avg Engagement Rate:', (result.profile.avgEngagementRate * 100).toFixed(2) + '%');
    console.log('  Quality Score:', (result.profile.qualityScore * 100).toFixed(1) + '%');
    
    console.log('\nEngagement Metrics:');
    console.log('  Avg Interactions/Post:', result.engagement.summary.avgInteractionsPerPost.toLocaleString());
    console.log('  Avg Likes/Post:', result.engagement.summary.avgLikesPerPost.toLocaleString());
    console.log('  Avg Comments/Post:', result.engagement.summary.avgCommentsPerPost.toLocaleString());
    console.log('  Consistency:', result.engagement.summary.consistency);
    
    console.log('\nBest Posting Days:');
    result.engagement.postingPattern.bestDays.forEach((day, i) => {
      console.log(`  ${i + 1}. ${day.day} - ${day.avgInteractions.toLocaleString()} avg interactions`);
    });
    
    console.log('\nBest Posting Hours:');
    result.engagement.postingPattern.bestHours.forEach((hour, i) => {
      console.log(`  ${i + 1}. ${hour.hour} - ${hour.avgInteractions.toLocaleString()} avg interactions`);
    });
  } else {
    console.error('\n❌ Failed:', result.error);
  }
}

// Run tests
console.log('════════════════════════════════════════════');
console.log('   INSTAGRAM API TESTING');
console.log('════════════════════════════════════════════\n');

testInstagramService()
  .catch(err => console.error('Test failed:', err));
