// Quick test of SimilarWeb API to see actual response format
import axios from 'axios';

async function testSimilarWebAPI() {
  const domain = 'pes.edu';
  const url = `https://similarweb-traffic.p.rapidapi.com/traffic?domain=${domain}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'beb04a38acmsh6d3e993c54c2d4fp1a525fjsnecb3ffee9285',
      'x-rapidapi-host': 'similarweb-traffic.p.rapidapi.com'
    }
  };

  try {
    console.log(`\n🔍 Testing SimilarWeb API for: ${domain}\n`);
    const response = await axios(url, options);
    
    console.log('✅ Response Status:', response.status);
    console.log('\n📊 Response Data Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📋 Available Fields:');
    console.log('Keys:', Object.keys(response.data));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testSimilarWebAPI();
