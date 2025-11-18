// Test Facebook Pages API to explore available endpoints
import axios from 'axios';

const RAPIDAPI_KEY = 'beb04a38acmsh6d3e993c54c2d4fp1a525fjsnecb3ffee9285';
const BASE_URL = 'https://facebook-pages-scraper2.p.rapidapi.com';

async function testFacebookPageInfo() {
  // Test with a known page - Let's try searching for "Engen SA" or getting page by URL
  const pageName = 'EngenSA'; // Facebook page username
  
  console.log('\n📘 TESTING FACEBOOK PAGES API\n');
  console.log('══════════════════════════════════════════\n');
  
  // Try different possible endpoints
  const endpoints = [
    `/page?url=https://www.facebook.com/${pageName}`,
    `/page?username=${pageName}`,
    `/search?query=${pageName}`,
    `/page_info?page=${pageName}`,
    `/${pageName}`,
  ];
  
  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint}`;
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'facebook-pages-scraper2.p.rapidapi.com'
      }
    };

    try {
      console.log(`\n🔍 Trying endpoint: ${endpoint}`);
      const response = await axios(url, options);
      
      console.log('✅ SUCCESS! Response Status:', response.status);
      console.log('\n📊 Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Check for engagement metrics
      const dataStr = JSON.stringify(response.data);
      if (dataStr.includes('followers') || dataStr.includes('likes') || dataStr.includes('posts')) {
        console.log('\n🎯 FOUND ENGAGEMENT DATA!');
      }
      
      return; // Stop on first success
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Failed: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.data) {
          console.log('Error details:', error.response.data);
        }
      } else {
        console.log(`❌ Failed: ${error.message}`);
      }
    }
  }
  
  console.log('\n⚠️ All endpoints failed. Trying video search endpoint...');
}

async function testVideoSearch() {
  // The endpoint from your example
  const url = `${BASE_URL}/search_facebook_watch_videos?query=dog%20playing%20with%20cats`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'facebook-pages-scraper2.p.rapidapi.com'
    }
  };

  try {
    console.log('\n\n🎬 Testing Video Search Endpoint\n');
    const response = await axios(url, options);
    
    console.log('✅ Response Status:', response.status);
    console.log('\n📊 Sample Data (first video):');
    const firstVideo = response.data.data?.videos?.[0];
    if (firstVideo) {
      console.log(JSON.stringify(firstVideo, null, 2));
      console.log('\nOwner info:', JSON.stringify(firstVideo.owner, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testPageSearch() {
  // Based on your sample response, let's test page search
  const pageUrl = 'https://www.facebook.com/EngenSA';
  const url = `${BASE_URL}/page?url=${encodeURIComponent(pageUrl)}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'facebook-pages-scraper2.p.rapidapi.com'
    }
  };

  try {
    console.log('\n\n📄 Testing Page Info Endpoint\n');
    console.log(`Fetching: ${pageUrl}\n`);
    const response = await axios(url, options);
    
    console.log('✅ Response Status:', response.status);
    console.log('\n📊 Page Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Extract key metrics
    if (Array.isArray(response.data) && response.data.length > 0) {
      const page = response.data[0];
      console.log('\n📈 Key Metrics:');
      console.log('  Page Name:', page.title);
      console.log('  Likes:', page.likes_display);
      console.log('  Followers:', page.followers_display);
      console.log('  Rating:', page.rating);
      console.log('  Category:', page.category);
      console.log('  Bio:', page.bio?.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run all tests
console.log('════════════════════════════════════════════');
console.log('   FACEBOOK PAGES API TESTING');
console.log('════════════════════════════════════════════\n');

testPageSearch()
  .then(() => testFacebookPageInfo())
  .then(() => testVideoSearch())
  .catch(err => console.error('Test failed:', err));
