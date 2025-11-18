import axios from 'axios';

const CHANGEDETECTION_URL = 'https://changedetection-competitor.onrender.com';
const API_KEY = '7e9ca5c13eb31b2716fdb8b2c767fe15';

// Test URLs
const MY_URL = 'https://agenticforge.tech/';
const COMPETITOR_URL = 'https://pes.edu/';

class ChangeDetectionTester {
  constructor() {
    this.baseUrl = CHANGEDETECTION_URL;
    this.apiKey = API_KEY;
    this.headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Test 1: Add a watch for your own site
   */
  async addMyWatch(url) {
    console.log('\n📝 TEST 1: Adding watch for MY site...');
    console.log(`URL: ${url}`);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/watch`,
        {
          url: url,
          tag: 'my-site',
          fetch_backend: 'html_requests',
          title: 'My Site Monitor'
        },
        { headers: this.headers, timeout: 15000 }
      );
      
      console.log('✅ Success! Watch added.');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Test 2: Add a watch for competitor site (FIXED)
   */
  async addCompetitorWatch(url) {
    console.log('\n📝 TEST 2: Adding watch for COMPETITOR site...');
    console.log(`URL: ${url}`);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/watch`,
        {
          url: url,
          tag: 'competitor',
          fetch_backend: 'html_requests',
          title: 'Competitor Monitor',
          // FIXED: trigger_text must be an array, not a string
          trigger_text: ['price', 'pricing', 'new', 'feature', 'launch']
        },
        { headers: this.headers, timeout: 15000 }
      );
      
      console.log('✅ Success! Watch added.');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Test 3: List all watches
   */
  async listAllWatches() {
    console.log('\n📝 TEST 3: Listing all watches...');
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/watch`,
        { headers: this.headers, timeout: 15000 }
      );
      
      console.log('✅ Success! Found watches:');
      console.log(`Total watches: ${Object.keys(response.data).length}`);
      
      // Display each watch
      for (const [uuid, watch] of Object.entries(response.data)) {
        console.log(`\n  UUID: ${uuid}`);
        console.log(`  URL: ${watch.url}`);
        console.log(`  Tag: ${watch.tag || 'none'}`);
        console.log(`  Title: ${watch.title || 'untitled'}`);
        console.log(`  Last checked: ${watch.last_checked || 'never'}`);
        console.log(`  Last changed: ${watch.last_changed || 'never'}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Test 4: Get specific watch details
   */
  async getWatchDetails(uuid) {
    console.log(`\n📝 TEST 4: Getting details for watch ${uuid}...`);
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/watch/${uuid}`,
        { headers: this.headers, timeout: 15000 }
      );
      
      console.log('✅ Success! Watch details:');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Test 5: Get change history
   */
  async getHistory(uuid) {
    console.log(`\n📝 TEST 5: Getting change history for ${uuid}...`);
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/watch/${uuid}/history`,
        { headers: this.headers, timeout: 15000 }
      );
      
      console.log('✅ Success! History:');
      console.log(`Total snapshots: ${response.data?.length || 0}`);
      if (response.data && response.data.length > 0) {
        console.log('Recent snapshots:', response.data.slice(0, 3));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Test 6: Update a watch (alternative to trigger)
   */
  async updateWatch(uuid, updates) {
    console.log(`\n📝 TEST 6: Updating watch ${uuid}...`);
    
    try {
      const response = await axios.put(
        `${this.baseUrl}/api/v1/watch/${uuid}`,
        updates,
        { headers: this.headers, timeout: 15000 }
      );
      
      console.log('✅ Success! Watch updated.');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Test 7: Delete a watch
   */
  async deleteWatch(uuid) {
    console.log(`\n📝 TEST 7: Deleting watch ${uuid}...`);
    
    try {
      const response = await axios.delete(
        `${this.baseUrl}/api/v1/watch/${uuid}`,
        { headers: this.headers, timeout: 15000 }
      );
      
      console.log('✅ Success! Watch deleted.');
      return true;
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      return false;
    }
  }
}

// Main test runner
async function runTests() {
  console.log('=================================');
  console.log('ChangeDetection.io API Test Suite');
  console.log('=================================');
  console.log(`Base URL: ${CHANGEDETECTION_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  const tester = new ChangeDetectionTester();
  
  // Test 1: Add your site watch
  const myWatch = await tester.addMyWatch(MY_URL);
  const myUuid = myWatch?.uuid;
  
  // Small delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Add competitor watch (FIXED)
  const competitorWatch = await tester.addCompetitorWatch(COMPETITOR_URL);
  const competitorUuid = competitorWatch?.uuid;
  
  // Small delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: List all watches
  const allWatches = await tester.listAllWatches();
  
  // Use the competitor UUID for remaining tests
  const testUuid = competitorUuid || myUuid || Object.keys(allWatches || {})[0];
  
  if (testUuid) {
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Get watch details
    await tester.getWatchDetails(testUuid);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 5: Get history
    await tester.getHistory(testUuid);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 6: Update watch (e.g., change title)
    await tester.updateWatch(testUuid, {
      title: 'Updated Competitor Monitor',
      paused: false
    });
    
    // Optional: Uncomment to delete test watches after testing
    // console.log('\n⚠️  Cleanup: Deleting test watches...');
    // if (myUuid) await tester.deleteWatch(myUuid);
    // if (competitorUuid) await tester.deleteWatch(competitorUuid);
  }
  
  console.log('\n=================================');
  console.log('✅ All tests completed!');
  console.log('=================================');
  console.log('\n📊 Key Findings:');
  console.log('1. trigger_text must be an ARRAY: ["keyword1", "keyword2"]');
  console.log('2. Watch UUID format: ' + (testUuid || 'N/A'));
  console.log('3. Watches are checked automatically by ChangeDetection.io');
  console.log('4. Use PUT to update watch settings');
  console.log('\nNext steps:');
  console.log('1. Check responses above for structure');
  console.log('2. Visit dashboard: ' + CHANGEDETECTION_URL);
  console.log('3. Integrate into your backend based on these results');
}

// Run the tests
runTests().catch(console.error);
