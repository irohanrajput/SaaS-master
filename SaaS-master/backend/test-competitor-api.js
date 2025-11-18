/**
 * Test Competitor Intelligence API
 */

import axios from 'axios';

const RAPIDAPI_KEY = "063de7c06amshea7f01093a04701p10666cjsnffd119d541d6";
const RAPIDAPI_HOST = 'facebook-pages-scraper2.p.rapidapi.com';

async function testCompetitorAPI() {
  console.log('🧪 Testing Competitor Intelligence API\n');
  console.log('='.repeat(60));

  // Test Facebook page URLs
  const testPages = [
    'https://www.facebook.com/pesuniversity/',
    'https://www.facebook.com/EngenSA'
  ];

  console.log('\n📊 Testing Single Competitor Analysis\n');

  for (const pageUrl of testPages) {
    console.log(`\n🔍 Analyzing: ${pageUrl}`);
    
    try {
      const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/get_facebook_pages_details`,
        params: {
          link: pageUrl,
          show_verified_badge: 'false'
        },
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST
        }
      };

      const response = await axios.request(options);

      if (response.data && response.data.length > 0) {
        const pageData = response.data[0];
        
        console.log('✅ Success!');
        console.log(`   Name: ${pageData.title}`);
        console.log(`   Followers: ${pageData.followers_display} (${pageData.followers_count})`);
        console.log(`   Likes: ${pageData.likes_display} (${pageData.likes_count})`);
        console.log(`   Category: ${pageData.category?.join(', ')}`);
        console.log(`   Rating: ${pageData.rating || 'N/A'}`);
        console.log(`   Website: ${pageData.website || 'N/A'}`);
        
        // Calculate engagement rate
        const engagementRate = pageData.followers_count > 0 
          ? ((pageData.likes_count / pageData.followers_count) * 100).toFixed(2)
          : 0;
        console.log(`   Engagement Rate: ${engagementRate}%`);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '-'.repeat(60));
  }

  console.log('\n📊 Testing Backend API Endpoint\n');

  try {
    const testUrl = 'https://www.facebook.com/pesuniversity/';
    console.log(`🔍 Testing: GET /api/competitor/facebook?url=${testUrl}`);
    
    const response = await axios.get(`http://localhost:3010/api/competitor/facebook`, {
      params: { url: testUrl }
    });

    if (response.data.success) {
      console.log('✅ Backend API works!');
      console.log('   Response:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.log('❌ Backend API failed:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Backend API error:', error.message);
    console.log('   Make sure backend server is running on port 3010');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Complete\n');
}

// Run test
testCompetitorAPI()
  .then(() => {
    console.log('✅ All tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
