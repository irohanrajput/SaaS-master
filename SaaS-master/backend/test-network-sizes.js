import axios from 'axios';

const ACCESS_TOKEN = 'AQWS-e3WUlEKPyWNRl0LLyW3t2SbY0QVkmcRtiaUI_x10e8franUD2bIyjzpyLnLyL7Yxr8InUido3wF0e4TVdvS-RRGHi6qILI9w1_oXPPh1k08a33pPUQ6UQb0YonUFHs6MNO_xOYy-ZxlTxjR-ipDQ4Q27hXrLPTMAnZ4AEMV_hLmeOEh-NHHstyaoPGlpvGzWUscgMfPyGXsCMJT6pn4cGpgbc268Tes7E1ks0wYQLQTiZG5YAqy2PjeFMSSJCZH6SjBOX70rdD0Q2eIoKt8-kDVHgYorOS3X5m0pygxaSEnfGijUumSuik0_BPyb2O52WJerAQP1NoUUoB21JysUqnIZw';
const ORG_URN = 'urn:li:organization:108126466';

console.log('🔍 Testing LinkedIn Network Sizes API\n');
console.log('='.repeat(60));

/**
 * Test different variations of the networkSizes endpoint
 */
async function testNetworkSizes() {
  const tests = [
    {
      name: 'Method 1: v2 with encoded URN in path',
      url: `https://api.linkedin.com/v2/networkSizes/${encodeURIComponent(ORG_URN)}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202410'
      }
    },
    {
      name: 'Method 2: v2 without encoding URN',
      url: `https://api.linkedin.com/v2/networkSizes/${ORG_URN}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202410'
      }
    },
    {
      name: 'Method 3: REST with CompanyFollowedByMember',
      url: `https://api.linkedin.com/rest/networkSizes/${ORG_URN}?edgeType=CompanyFollowedByMember`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202510',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    },
    {
      name: 'Method 4: REST with COMPANY_FOLLOWED_BY_MEMBER',
      url: `https://api.linkedin.com/rest/networkSizes/${ORG_URN}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202510',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    },
    {
      name: 'Method 5: Organizations endpoint followerCount',
      url: `https://api.linkedin.com/v2/organizations/${ORG_URN.split(':').pop()}`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202410'
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n📊 Testing: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    try {
      const response = await axios.get(test.url, { headers: test.headers });
      
      console.log('   ✅ SUCCESS!');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      
      // Extract follower count
      if (response.data.firstDegreeSize) {
        console.log(`   👥 Followers: ${response.data.firstDegreeSize.toLocaleString()}`);
      } else if (response.data.followerCount) {
        console.log(`   👥 Followers: ${response.data.followerCount.toLocaleString()}`);
      }
      
      console.log('   🎉 THIS METHOD WORKS! Use this in your code.');
      return; // Stop after first success
      
    } catch (error) {
      console.log('   ❌ FAILED');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
      if (error.response?.data?.code) {
        console.log('   Code:', error.response.data.code);
      }
    }
  }
  
  console.log('\n❌ All methods failed! The token might not have the required scopes.');
}

testNetworkSizes().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!');
}).catch(console.error);
