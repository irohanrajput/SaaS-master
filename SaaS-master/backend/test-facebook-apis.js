import axios from 'axios';

// RapidAPI Configuration
const RAPIDAPI_KEY = 'beb04a38acmsh6d3e993c54c2d4fp1a525fjsnecb3ffee9285';

console.log('\n════════════════════════════════════════════');
console.log('   TESTING FACEBOOK APIS ON RAPIDAPI');
console.log('════════════════════════════════════════════\n');

// Test different Facebook APIs available on RapidAPI
const apis = [
    {
        name: 'Facebook Pages Scraper',
        host: 'facebook-pages-scraper.p.rapidapi.com',
        endpoint: '/page-info',
        params: { page_id: 'EngenSA' }
    },
    {
        name: 'Facebook Page Scraper',
        host: 'facebook-page-scraper.p.rapidapi.com',
        endpoint: '/page',
        params: { username: 'EngenSA' }
    },
    {
        name: 'Social Media Data TT',
        host: 'social-media-data-tt.p.rapidapi.com',
        endpoint: '/facebook/page',
        params: { page: 'EngenSA' }
    },
    {
        name: 'Facebook Data1',
        host: 'facebook-data1.p.rapidapi.com',
        endpoint: '/page',
        params: { page: 'EngenSA' }
    },
    {
        name: 'Facebook Search and Scraper',
        host: 'facebook-search-and-scraper.p.rapidapi.com',
        endpoint: '/page',
        params: { page: 'EngenSA' }
    },
    {
        name: 'Facebook API',
        host: 'facebook-api11.p.rapidapi.com',
        endpoint: '/page',
        params: { username: 'EngenSA' }
    }
];

async function testAPI(api) {
    console.log(`\n📘 Testing: ${api.name}`);
    console.log(`Host: ${api.host}`);
    console.log(`Endpoint: ${api.endpoint}`);
    console.log('══════════════════════════════════════════\n');
    
    const options = {
        method: 'GET',
        url: `https://${api.host}${api.endpoint}`,
        params: api.params,
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': api.host
        },
        timeout: 10000
    };
    
    try {
        const response = await axios.request(options);
        console.log('✅ Success! Status:', response.status);
        console.log('\n📊 Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Check for useful metrics
        const data = response.data;
        const hasEngagement = data && (
            data.followers || data.likes || data.followers_count || 
            data.likes_count || data.posts || data.engagement || 
            data.fan_count || data.talking_about_count
        );
        
        if (hasEngagement) {
            console.log('\n🎯 FOUND ENGAGEMENT METRICS!');
            console.log('Available metrics:', Object.keys(data));
        }
        
        return { success: true, data: response.data, api };
    } catch (error) {
        const status = error.response?.status || 'Network Error';
        const message = error.response?.data?.message || error.message;
        
        console.log(`❌ Failed: ${status}`);
        console.log(`Error: ${message}`);
        
        return { success: false, error: message };
    }
}

// Run all tests
(async () => {
    console.log('Starting comprehensive Facebook API testing...\n');
    console.log('Testing Page: EngenSA\n');
    
    let workingAPI = null;
    
    // Test each API
    for (const api of apis) {
        const result = await testAPI(api);
        
        if (result.success) {
            workingAPI = result;
            console.log('\n✅ FOUND WORKING API!\n');
            console.log(`API: ${result.api.name}`);
            console.log(`Host: ${result.api.host}`);
            console.log(`Endpoint: ${result.api.endpoint}`);
            break; // Stop if we find a working API
        }
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('\n\n════════════════════════════════════════════');
    console.log('   TESTING COMPLETE');
    console.log('════════════════════════════════════════════\n');
    
    if (workingAPI) {
        console.log('✅ Working API Found!');
        console.log(`   Use: ${workingAPI.api.host}`);
        console.log(`   Endpoint: ${workingAPI.api.endpoint}\n`);
    } else {
        console.log('❌ No working Facebook APIs found.');
        console.log('\n💡 Alternative Solutions:');
        console.log('   1. Use official Facebook Graph API (requires app + token)');
        console.log('   2. Use web scraping (may violate ToS)');
        console.log('   3. Use paid services like Phantombuster or Apify');
        console.log('   4. Skip Facebook metrics and focus on Instagram only\n');
    }
})();