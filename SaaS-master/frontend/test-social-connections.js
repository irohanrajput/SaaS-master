#!/usr/bin/env node

// Test script for Social Media Connections API
const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Social Media Connections API...\n');

  try {
    // Test 1: Facebook Metrics API
    console.log('📱 Test 1: Facebook Metrics API');
    const fbResult = await makeRequest('GET', '/api/facebook/metrics?email=test@example.com&period=week');
    console.log(`Status: ${fbResult.status}`);
    console.log(`Success: ${fbResult.data.success}`);
    console.log(`Followers: ${fbResult.data.data.followers}`);
    console.log(`Engagement: ${fbResult.data.data.engagement}%\n`);

    // Test 2: Instagram Metrics API
    console.log('📷 Test 2: Instagram Metrics API');
    const igResult = await makeRequest('GET', '/api/instagram/metrics?email=test@example.com&period=week');
    console.log(`Status: ${igResult.status}`);
    console.log(`Success: ${igResult.data.success}`);
    console.log(`Followers: ${igResult.data.data.followers}`);
    console.log(`Engagement: ${igResult.data.data.engagement}%\n`);

    // Test 3: Connect Facebook
    console.log('🔗 Test 3: Connect Facebook');
    const connectResult = await makeRequest('POST', '/api/social/connect', { platform: 'Facebook' });
    console.log(`Status: ${connectResult.status}`);
    console.log(`Success: ${connectResult.data.success}`);
    console.log(`Message: ${connectResult.data.message}`);
    console.log(`Username: ${connectResult.data.profileInfo.username}\n`);

    // Test 4: Disconnect Facebook
    console.log('🔓 Test 4: Disconnect Facebook');
    const disconnectResult = await makeRequest('DELETE', '/api/social/connect', { platform: 'Facebook' });
    console.log(`Status: ${disconnectResult.status}`);
    if (typeof disconnectResult.data === 'object' && disconnectResult.data.success) {
      console.log(`Success: ${disconnectResult.data.success}`);
      console.log(`Message: ${disconnectResult.data.message}`);
    } else {
      console.log(`Response: ${JSON.stringify(disconnectResult.data)}`);
    }

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
