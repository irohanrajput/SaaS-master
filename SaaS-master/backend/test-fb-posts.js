/**
 * Test Facebook Posts API to get engagement metrics
 */

import axios from 'axios';

const RAPIDAPI_KEY = "063de7c06amshea7f01093a04701p10666cjsnffd119d541d6";
const RAPIDAPI_HOST = 'facebook-pages-scraper2.p.rapidapi.com';

async function testFacebookPosts() {
  console.log('🧪 Testing Facebook Posts API\n');
  console.log('='.repeat(60));

  const testPage = 'https://www.facebook.com/pesuniversity/';

  console.log(`\n📊 Fetching posts for: ${testPage}\n`);

  // Try different possible endpoints
  const endpoints = [
    '/get_facebook_page_posts',
    '/get_posts',
    '/posts',
    '/page_posts'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Trying endpoint: ${endpoint}`);
    
    try {
      const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}${endpoint}`,
        params: {
          link: testPage,
          limit: 5
        },
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST
        },
        timeout: 10000
      };

      const response = await axios.request(options);
      
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      // If we got data, analyze it
      if (response.data) {
        console.log('\n📈 Analyzing post structure...');
        if (Array.isArray(response.data)) {
          console.log(`   Found ${response.data.length} posts`);
          if (response.data.length > 0) {
            console.log('   First post structure:', Object.keys(response.data[0]));
          }
        } else if (response.data.posts) {
          console.log(`   Found ${response.data.posts.length} posts`);
          if (response.data.posts.length > 0) {
            console.log('   First post structure:', Object.keys(response.data.posts[0]));
          }
        }
      }
      
      break; // If successful, stop trying other endpoints
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Endpoint not found (404)');
      } else if (error.code === 'ECONNABORTED') {
        console.log('❌ Request timeout');
      } else {
        console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Note: This API may only provide page-level data, not post-level engagement.');
  console.log('   For post engagement, we may need to use estimated values based on page metrics.\n');
}

testFacebookPosts()
  .then(() => {
    console.log('✅ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
