/**
 * Test script for Social Media Metrics APIs
 * Tests both Instagram and Facebook metrics endpoints
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3010';
const TEST_EMAIL = 'test@example.com'; // Replace with your actual email

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Test Instagram Metrics
 */
async function testInstagramMetrics() {
  logSection('TESTING INSTAGRAM METRICS');

  try {
    const url = `${BASE_URL}/api/instagram/metrics?email=${encodeURIComponent(TEST_EMAIL)}&period=month`;
    logInfo(`Fetching: ${url}`);

    const response = await axios.get(url);
    const data = response.data;

    logSuccess('Instagram API Response received');
    console.log('\n📊 Response Structure:');
    console.log(JSON.stringify(data, null, 2));

    if (data.dataAvailable) {
      logSuccess('Data is available');

      // Check engagement score
      if (data.engagementScore) {
        console.log('\n💬 Engagement Score:');
        console.log(`   Likes: ${data.engagementScore.likes}`);
        console.log(`   Comments: ${data.engagementScore.comments}`);
        console.log(`   Shares: ${data.engagementScore.shares || 0}`);
        console.log(`   Saves: ${data.engagementScore.saves || 0}`);
        console.log(`   Engagement Rate: ${data.engagementScore.engagementRate}%`);
        console.log(`   Reach: ${data.engagementScore.reach}`);
        console.log(`   Impressions: ${data.engagementScore.impressions}`);
      } else {
        logWarning('No engagement score data');
      }

      // Check top posts
      if (data.topPosts && data.topPosts.length > 0) {
        console.log(`\n📝 Top Posts (${data.topPosts.length} posts):`);
        data.topPosts.forEach((post, index) => {
          console.log(`\n   Post ${index + 1}:`);
          console.log(`      Format: ${post.format}`);
          console.log(`      Reach: ${post.reach}`);
          console.log(`      Likes: ${post.likes}`);
          console.log(`      Comments: ${post.comments}`);
          console.log(`      Shares: ${post.shares}`);
          if (post.caption) {
            console.log(`      Caption: ${post.caption.substring(0, 50)}...`);
          }
          if (post.url) {
            console.log(`      URL: ${post.url}`);
          }
        });
      } else {
        logWarning('No top posts data');
      }

      // Check follower growth
      if (data.followerGrowth && data.followerGrowth.length > 0) {
        console.log(`\n📈 Follower Growth (${data.followerGrowth.length} data points):`);
        const latest = data.followerGrowth[data.followerGrowth.length - 1];
        console.log(`   Latest: ${latest.followers} followers on ${latest.date}`);
        console.log(`   Net change: ${latest.net >= 0 ? '+' : ''}${latest.net}`);
      } else {
        logWarning('No follower growth data');
      }

      // Check reputation benchmark
      if (data.reputationBenchmark) {
        console.log('\n⭐ Reputation Benchmark:');
        console.log(`   Score: ${data.reputationBenchmark.score}/100`);
        console.log(`   Sentiment: ${data.reputationBenchmark.sentiment}`);
        console.log(`   Followers: ${data.reputationBenchmark.followers}`);
        console.log(`   Avg Engagement Rate: ${data.reputationBenchmark.avgEngagementRate}%`);
      } else {
        logWarning('No reputation benchmark data');
      }

    } else {
      logError('Data not available');
      if (data.reason) {
        logInfo(`Reason: ${data.reason}`);
      }
    }

  } catch (error) {
    logError('Instagram API test failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

/**
 * Test Facebook Metrics
 */
async function testFacebookMetrics() {
  logSection('TESTING FACEBOOK METRICS');

  try {
    const url = `${BASE_URL}/api/facebook/metrics?email=${encodeURIComponent(TEST_EMAIL)}&period=month`;
    logInfo(`Fetching: ${url}`);

    const response = await axios.get(url);
    const data = response.data;

    logSuccess('Facebook API Response received');
    console.log('\n📊 Response Structure:');
    console.log(JSON.stringify(data, null, 2));

    if (data.dataAvailable) {
      logSuccess('Data is available');

      // Check engagement score
      if (data.engagementScore) {
        console.log('\n💬 Engagement Score:');
        console.log(`   Likes: ${data.engagementScore.likes}`);
        console.log(`   Comments: ${data.engagementScore.comments}`);
        console.log(`   Shares: ${data.engagementScore.shares || 0}`);
        console.log(`   Engagement Rate: ${data.engagementScore.engagementRate}%`);
        console.log(`   Reach: ${data.engagementScore.reach}`);
      } else {
        logWarning('No engagement score data');
      }

      // Check top posts
      if (data.topPosts && data.topPosts.length > 0) {
        console.log(`\n📝 Top Posts (${data.topPosts.length} posts):`);
        data.topPosts.forEach((post, index) => {
          console.log(`\n   Post ${index + 1}:`);
          console.log(`      Format: ${post.format}`);
          console.log(`      Reach: ${post.reach}`);
          console.log(`      Likes: ${post.likes}`);
          console.log(`      Comments: ${post.comments}`);
          console.log(`      Shares: ${post.shares}`);
          if (post.message) {
            console.log(`      Message: ${post.message.substring(0, 50)}...`);
          }
          if (post.url) {
            console.log(`      URL: ${post.url}`);
          }
        });
      } else {
        logWarning('No top posts data');
      }

      // Check follower growth
      if (data.followerGrowth && data.followerGrowth.length > 0) {
        console.log(`\n📈 Follower Growth (${data.followerGrowth.length} data points):`);
        const latest = data.followerGrowth[data.followerGrowth.length - 1];
        console.log(`   Latest: ${latest.followers} followers on ${latest.date}`);
        console.log(`   Net change: ${latest.net >= 0 ? '+' : ''}${latest.net}`);
      } else {
        logWarning('No follower growth data');
      }

      // Check reputation benchmark
      if (data.reputationBenchmark) {
        console.log('\n⭐ Reputation Benchmark:');
        console.log(`   Score: ${data.reputationBenchmark.score}/100`);
        console.log(`   Sentiment: ${data.reputationBenchmark.sentiment}`);
        console.log(`   Followers: ${data.reputationBenchmark.followers}`);
        console.log(`   Avg Engagement Rate: ${data.reputationBenchmark.avgEngagementRate}%`);
      } else {
        logWarning('No reputation benchmark data');
      }

    } else {
      logError('Data not available');
      if (data.reason) {
        logInfo(`Reason: ${data.reason}`);
      }
    }

  } catch (error) {
    logError('Facebook API test failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

/**
 * Test Instagram Connection Status
 */
async function testInstagramStatus() {
  logSection('TESTING INSTAGRAM CONNECTION STATUS');

  try {
    const url = `${BASE_URL}/api/instagram/status?email=${encodeURIComponent(TEST_EMAIL)}`;
    logInfo(`Fetching: ${url}`);

    const response = await axios.get(url);
    const data = response.data;

    if (data.connected) {
      logSuccess(`Instagram connected: @${data.username}`);
      console.log(`   Followers: ${data.followers}`);
    } else {
      logWarning('Instagram not connected');
      if (data.error) {
        console.log(`   Error: ${data.error}`);
      }
    }

  } catch (error) {
    logError('Instagram status check failed');
    console.log(`   Error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n🚀 Starting Social Media Metrics API Tests', 'bright');
  log(`📧 Test Email: ${TEST_EMAIL}`, 'cyan');
  log(`🌐 Base URL: ${BASE_URL}`, 'cyan');

  // Test Instagram
  await testInstagramStatus();
  await testInstagramMetrics();

  // Test Facebook
  await testFacebookMetrics();

  logSection('TESTS COMPLETED');
  log('Check the output above for any errors or warnings', 'yellow');
  log('\nIf you see "No access token found" errors, make sure to:', 'yellow');
  log('1. Connect your Instagram/Facebook account via the OAuth flow', 'yellow');
  log('2. Use the correct email address in TEST_EMAIL variable', 'yellow');
}

// Run the tests
runTests().catch(error => {
  logError('Test runner failed');
  console.error(error);
  process.exit(1);
});
