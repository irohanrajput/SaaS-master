import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:3001';

async function testReportGeneration() {
  console.log('🧪 Testing Report Generation...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/api/reports/health`);
    console.log('✅ Health check passed:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: SEO Report
  console.log('\n2️⃣ Testing SEO Report Generation...');
  try {
    const response = await axios.post(
      `${API_URL}/api/reports/seo-performance`,
      {
        email: 'test@example.com',
        domain: 'example.com'
      },
      {
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    if (response.data && response.data.byteLength > 0) {
      fs.writeFileSync('test-seo-report.pdf', Buffer.from(response.data));
      console.log('✅ SEO Report generated successfully!');
      console.log(`   File size: ${(response.data.byteLength / 1024).toFixed(2)} KB`);
      console.log('   Saved as: test-seo-report.pdf');
    } else {
      console.error('❌ Empty response received');
    }
  } catch (error) {
    console.error('❌ SEO Report failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data?.toString());
    }
  }

  // Test 3: Comprehensive Report
  console.log('\n3️⃣ Testing Comprehensive Report Generation...');
  try {
    const response = await axios.post(
      `${API_URL}/api/reports/comprehensive`,
      {
        email: 'test@example.com',
        domain: 'example.com'
      },
      {
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    if (response.data && response.data.byteLength > 0) {
      fs.writeFileSync('test-comprehensive-report.pdf', Buffer.from(response.data));
      console.log('✅ Comprehensive Report generated successfully!');
      console.log(`   File size: ${(response.data.byteLength / 1024).toFixed(2)} KB`);
      console.log('   Saved as: test-comprehensive-report.pdf');
    } else {
      console.error('❌ Empty response received');
    }
  } catch (error) {
    console.error('❌ Comprehensive Report failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data?.toString());
    }
  }

  console.log('\n✨ Test completed!');
}

testReportGeneration();
