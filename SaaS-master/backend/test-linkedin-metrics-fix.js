/**
 * Test LinkedIn Metrics Endpoint
 * 
 * This script tests the LinkedIn metrics endpoint to verify:
 * 1. Data structure matches frontend expectations
 * 2. All required fields are present
 * 3. Data types are correct
 */

const testEmail = process.argv[2] || 'test@example.com';
const baseURL = 'http://localhost:3010';

console.log('🧪 Testing LinkedIn Metrics Endpoint');
console.log(`📧 Email: ${testEmail}\n`);

async function testMetricsEndpoint() {
  try {
    // Step 1: Check connection status
    console.log('1️⃣ Checking LinkedIn connection status...');
    const statusResponse = await fetch(
      `${baseURL}/api/auth/linkedin/status?email=${encodeURIComponent(testEmail)}`
    );
    const statusData = await statusResponse.json();
    
    if (!statusData.connected) {
      console.log('❌ LinkedIn not connected for this user');
      console.log('   Please connect LinkedIn first via OAuth');
      console.log(`   Visit: ${baseURL}/api/auth/linkedin?email=${encodeURIComponent(testEmail)}`);
      process.exit(1);
    }
    
    console.log('✅ LinkedIn connected');
    console.log(`   Provider: ${statusData.provider}`);
    if (statusData.profile) {
      console.log(`   Name: ${statusData.profile.name}`);
    }
    console.log('');

    // Step 2: Fetch metrics
    console.log('2️⃣ Fetching LinkedIn metrics...');
    const metricsResponse = await fetch(
      `${baseURL}/api/linkedin/metrics?email=${encodeURIComponent(testEmail)}&period=month`
    );
    
    if (!metricsResponse.ok) {
      console.log(`❌ HTTP Error: ${metricsResponse.status} ${metricsResponse.statusText}`);
      const errorData = await metricsResponse.json();
      console.log('   Error details:', errorData);
      process.exit(1);
    }
    
    const metricsData = await metricsResponse.json();
    console.log('✅ Metrics fetched successfully\n');

    // Step 3: Validate data structure
    console.log('3️⃣ Validating data structure...');
    
    const requiredFields = [
      'success',
      'dataAvailable',
      'companyName',
      'companyFollowers',
      'engagementScore',
      'topPosts',
      'followerGrowth',
      'reputationBenchmark',
      'lastUpdated'
    ];
    
    const missingFields = [];
    requiredFields.forEach(field => {
      if (!(field in metricsData)) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields.join(', '));
      process.exit(1);
    }
    
    console.log('✅ All required fields present\n');

    // Step 4: Validate engagementScore structure
    console.log('4️⃣ Validating engagement score...');
    const engagementFields = ['likes', 'comments', 'shares', 'engagementRate', 'reach'];
    const missingEngagementFields = [];
    
    engagementFields.forEach(field => {
      if (!(field in metricsData.engagementScore)) {
        missingEngagementFields.push(field);
      }
    });
    
    if (missingEngagementFields.length > 0) {
      console.log('❌ Missing engagement fields:', missingEngagementFields.join(', '));
      process.exit(1);
    }
    
    console.log('✅ Engagement score structure valid');
    console.log(`   Likes: ${metricsData.engagementScore.likes}`);
    console.log(`   Comments: ${metricsData.engagementScore.comments}`);
    console.log(`   Shares: ${metricsData.engagementScore.shares}`);
    console.log(`   Engagement Rate: ${metricsData.engagementScore.engagementRate}%`);
    console.log(`   Reach: ${metricsData.engagementScore.reach}\n`);

    // Step 5: Validate reputationBenchmark
    console.log('5️⃣ Validating reputation benchmark...');
    const reputationFields = ['score', 'followers', 'avgEngagementRate', 'sentiment'];
    const missingReputationFields = [];
    
    reputationFields.forEach(field => {
      if (!(field in metricsData.reputationBenchmark)) {
        missingReputationFields.push(field);
      }
    });
    
    if (missingReputationFields.length > 0) {
      console.log('❌ Missing reputation fields:', missingReputationFields.join(', '));
      process.exit(1);
    }
    
    console.log('✅ Reputation benchmark valid');
    console.log(`   Score: ${metricsData.reputationBenchmark.score}/100`);
    console.log(`   Followers: ${metricsData.reputationBenchmark.followers}`);
    console.log(`   Avg Engagement Rate: ${metricsData.reputationBenchmark.avgEngagementRate}%`);
    console.log(`   Sentiment: ${metricsData.reputationBenchmark.sentiment}\n`);

    // Step 6: Validate topPosts
    console.log('6️⃣ Validating top posts...');
    if (!Array.isArray(metricsData.topPosts)) {
      console.log('❌ topPosts is not an array');
      process.exit(1);
    }
    
    console.log(`✅ Top posts array valid (${metricsData.topPosts.length} posts)`);
    
    if (metricsData.topPosts.length > 0) {
      const firstPost = metricsData.topPosts[0];
      const postFields = ['format', 'reach', 'likes', 'comments', 'shares', 'message'];
      const missingPostFields = [];
      
      postFields.forEach(field => {
        if (!(field in firstPost)) {
          missingPostFields.push(field);
        }
      });
      
      if (missingPostFields.length > 0) {
        console.log('⚠️ Warning: First post missing fields:', missingPostFields.join(', '));
      } else {
        console.log('   Sample post:');
        console.log(`   - Format: ${firstPost.format}`);
        console.log(`   - Reach: ${firstPost.reach}`);
        console.log(`   - Likes: ${firstPost.likes}`);
        console.log(`   - Comments: ${firstPost.comments}`);
        console.log(`   - Shares: ${firstPost.shares}`);
        console.log(`   - Message: ${firstPost.message.substring(0, 50)}...`);
      }
    }
    console.log('');

    // Step 7: Validate followerGrowth
    console.log('7️⃣ Validating follower growth...');
    if (!Array.isArray(metricsData.followerGrowth)) {
      console.log('❌ followerGrowth is not an array');
      process.exit(1);
    }
    
    console.log(`✅ Follower growth array valid (${metricsData.followerGrowth.length} data points)`);
    
    if (metricsData.followerGrowth.length > 0) {
      const firstPoint = metricsData.followerGrowth[0];
      const lastPoint = metricsData.followerGrowth[metricsData.followerGrowth.length - 1];
      
      console.log(`   Start date: ${firstPoint.date} (${firstPoint.followers} followers)`);
      console.log(`   End date: ${lastPoint.date} (${lastPoint.followers} followers)`);
      console.log(`   Net growth: ${lastPoint.followers - firstPoint.followers} followers`);
    }
    console.log('');

    // Final summary
    console.log('✅ ALL TESTS PASSED!');
    console.log('\n📊 Data Summary:');
    console.log(`   Company: ${metricsData.companyName}`);
    console.log(`   Followers: ${metricsData.companyFollowers}`);
    console.log(`   Engagement Rate: ${metricsData.engagementScore.engagementRate}%`);
    console.log(`   Top Posts: ${metricsData.topPosts.length}`);
    console.log(`   Reputation Score: ${metricsData.reputationBenchmark.score}/100`);
    console.log(`   Last Updated: ${new Date(metricsData.lastUpdated).toLocaleString()}`);
    
    return true;

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testMetricsEndpoint()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
