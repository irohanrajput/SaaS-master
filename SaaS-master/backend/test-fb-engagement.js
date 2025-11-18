/**
 * Test Facebook Engagement Metrics using RapidAPI
 * This script tests the correct endpoint for Facebook page metrics
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = "063de7c06amshea7f01093a04701p10666cjsnffd119d541d6";
const RAPIDAPI_HOST = 'facebook-pages-scraper2.p.rapidapi.com';

/**
 * Test fetching Facebook page details using the correct endpoint
 */
async function testFacebookEngagement() {
  console.log('🧪 Testing Facebook Engagement Metrics via RapidAPI\n');
  console.log('='.repeat(60));

  // Test with multiple public Facebook pages
  const testPages = [
    // 'https://www.facebook.com/Meta',
    'https://www.facebook.com/pesuniversity/'
    // 'https://www.facebook.com/EngenSA'
  ];

  for (const pageUrl of testPages) {
    console.log(`\n📊 Fetching data for: ${pageUrl}`);
    console.log(`   Using RapidAPI Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);

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

      console.log('✅ Success! Page Details:');
      console.log(JSON.stringify(response.data, null, 2));

      // Extract and display key metrics
      if (response.data && response.data.length > 0) {
        const pageData = response.data[0];
        console.log('\n📈 Key Metrics:');
        console.log(`  - Title: ${pageData.title || 'N/A'}`);
        console.log(`  - Likes: ${pageData.likes_display || pageData.likes_count || 'N/A'}`);
        console.log(`  - Followers: ${pageData.followers_display || pageData.followers_count || 'N/A'}`);
        console.log(`  - Category: ${pageData.category ? pageData.category.join(', ') : 'N/A'}`);
        console.log(`  - Rating: ${pageData.rating || 'N/A'}`);
        console.log(`  - Creation Date: ${pageData.creation_date || 'N/A'}`);
        console.log(`  - Website: ${pageData.website || 'N/A'}`);
        console.log(`  - Phone: ${pageData.phone || 'N/A'}`);
        console.log(`  - Email: ${pageData.email || 'N/A'}`);
        console.log(`  - Ad Status: ${pageData.ad_status || 'N/A'}`);
      }

    } catch (error) {
      console.error('❌ Error fetching page data:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data || error.message);
    }

    console.log('\n' + '-'.repeat(60));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Complete\n');
}

// Run test
console.log('🚀 Starting Facebook RapidAPI Test...\n');

testFacebookEngagement()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
