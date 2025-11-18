// Test ChangeDetection.io API key
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.CHANGEDETECTION_API_KEY;
const BASE_URL = 'https://changedetection-competitor.onrender.com';

console.log('🔧 Testing ChangeDetection.io API');
console.log('API Key:', API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT SET');
console.log('Base URL:', BASE_URL);
console.log('');

async function testAPI() {
  try {
    console.log('📋 Testing: List all watches...');
    const response = await axios.get(
      `${BASE_URL}/api/v1/watch`,
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ API Response Status:', response.status);
    console.log('✅ Found', Object.keys(response.data).length, 'watches');
    console.log('');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPI();
