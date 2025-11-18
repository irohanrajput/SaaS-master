/**
 * Test LinkedIn Organization Page Statistics
 * 
 * This script fetches organization page statistics using your saved access token
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🧪 Testing LinkedIn Organization Page Statistics\n');
console.log('='.repeat(70));

// Your email
const userEmail = 'contact.pawsomeai@gmail.com';

async function testLinkedInPageStats() {
  try {
    // Step 1: Get saved access token from database
    console.log('\n📋 Step 1: Fetching saved access token...');
    
    const { data: tokens, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('email', userEmail)
      .eq('provider', 'linkedin')
      .single();

    if (error || !tokens) {
      console.error('❌ No LinkedIn token found for:', userEmail);
      console.log('\n💡 Please connect your LinkedIn account first:');
      console.log('   1. Go to: http://localhost:3002/dashboard/social');
      console.log('   2. Select LinkedIn');
      console.log('   3. Click "Connect LinkedIn"');
      console.log('   4. Complete OAuth flow');
      console.log('   5. Run this script again');
      return;
    }

    console.log('✅ Token found!');
    console.log('   Access Token:', tokens.access_token.substring(0, 30) + '...');
    console.log('   Scopes:', tokens.scope);
    console.log('   Expires:', new Date(tokens.expires_at).toISOString());

    const accessToken = "AQRBMk8xG8aTqOwj6-d6cy_3x4X1lpt7zAbc5McabcMF2FVcqoUX3rg86_KE1XiEheBfWvTQTBihf1TL-ZXGXXyb369aEU3hyNa1qC1fVyVXkBRa_JJgLYAFhIx9AcYUGbO7hUKrkzyH6LpCEL9uT9hFwkR40_UAV31SsNvtyHB-Ub7dI_cX2q6mYxnu-diHzakj8bs0kaE1kQAn5HY";

  
    // Step 2: Get organizations you have admin access to
    console.log('\n📋 Step 2: Fetching your organizations...');
    console.log('⏳ Waiting 3 seconds for token to propagate...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const orgResponse = await axios.get('https://api.linkedin.com/rest/organizationAcls', {
      params: {
        q: 'roleAssignee',
        projection: '(elements*(organizationalTarget~,roleAssignee,state))'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'LinkedIn-Version': '202410',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      }
    });

    const organizations = orgResponse.data.elements || [];
    console.log(`✅ Found ${organizations.length} organization(s):\n`);

    if (organizations.length === 0) {
      console.log('❌ No organizations found!');
      console.log('\n💡 This means:');
      console.log('   1. You are not an admin of any LinkedIn Company Page');
      console.log('   2. Or the rw_organization_admin scope was not granted');
      console.log('\n📝 To fix:');
      console.log('   1. Go to LinkedIn and verify you have admin access to a Company Page');
      console.log('   2. Disconnect and reconnect LinkedIn in the dashboard');
      console.log('   3. Make sure to approve all requested permissions');
      return;
    }

    // Display organizations
    organizations.forEach((org, index) => {
      const orgData = org['organizationalTarget~'];
      const orgUrn = org.organizationalTarget;
      const orgId = orgUrn.split(':').pop();

      console.log(`${index + 1}. ${orgData?.localizedName || 'Unknown'}`);
      console.log(`   Organization URN: ${orgUrn}`);
      console.log(`   Organization ID: ${orgId}`);
      console.log(`   Role: ${org.roleAssignee?.role || 'N/A'}`);
      console.log(`   State: ${org.state || 'N/A'}`);
      console.log(`   Vanity Name: ${orgData?.vanityName || 'N/A'}`);
      console.log('');
    });

    // Step 3: Fetch page statistics for the first organization
    const firstOrg = organizations[0];
    const orgUrn = firstOrg.organizationalTarget;
    const orgName = firstOrg['organizationalTarget~']?.localizedName || 'Unknown';

    console.log('\n📋 Step 3: Fetching page statistics...');
    console.log(`   Organization: ${orgName}`);
    console.log(`   URN: ${orgUrn}`);

    const statsResponse = await axios.get('https://api.linkedin.com/rest/organizationPageStatistics', {
      params: {
        q: 'organization',
        organization: orgUrn
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'LinkedIn-Version': '202410',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Page Statistics Retrieved!\n');
    console.log('📊 RAW RESPONSE:');
    console.log(JSON.stringify(statsResponse.data, null, 2));

    // Parse and display key metrics
    const stats = statsResponse.data;
    
    console.log('\n📈 KEY METRICS:');
    console.log('='.repeat(70));
    
    if (stats.elements && stats.elements.length > 0) {
      const element = stats.elements[0];
      
      console.log('\n👥 Follower Statistics:');
      if (element.totalFollowersCount !== undefined) {
        console.log(`   Total Followers: ${element.totalFollowersCount.toLocaleString()}`);
      }
      if (element.organicFollowersGainedCount !== undefined) {
        console.log(`   Organic Followers Gained: ${element.organicFollowersGainedCount}`);
      }
      if (element.paidFollowersGainedCount !== undefined) {
        console.log(`   Paid Followers Gained: ${element.paidFollowersGainedCount}`);
      }

      console.log('\n📊 Page Views:');
      if (element.pageViews !== undefined) {
        console.log(`   Total Page Views: ${element.pageViews.toLocaleString()}`);
      }
      if (element.uniquePageViews !== undefined) {
        console.log(`   Unique Page Views: ${element.uniquePageViews.toLocaleString()}`);
      }

      console.log('\n🔍 Search Appearances:');
      if (element.searchAppearances !== undefined) {
        console.log(`   Search Appearances: ${element.searchAppearances.toLocaleString()}`);
      }

      console.log('\n📅 Time Range:');
      if (element.timeRange) {
        console.log(`   Start: ${new Date(element.timeRange.start).toISOString()}`);
        console.log(`   End: ${new Date(element.timeRange.end).toISOString()}`);
      }
    } else {
      console.log('⚠️  No statistics data available in response');
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Test Complete!');
    console.log('\n💡 Next Steps:');
    console.log('   1. If you see statistics above, your token is working!');
    console.log('   2. We can now fetch posts, engagement metrics, etc.');
    console.log('   3. The dashboard should be able to display this data');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.response) {
      console.error('\n📋 Error Details:');
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 401) {
        console.log('\n💡 Token Error - Try this:');
        console.log('   1. Disconnect LinkedIn in dashboard');
        console.log('   2. Wait 10 seconds');
        console.log('   3. Reconnect LinkedIn');
        console.log('   4. Wait 30 seconds for token to propagate');
        console.log('   5. Run this script again');
      } else if (error.response.status === 403) {
        console.log('\n💡 Permission Error - Check:');
        console.log('   1. You have admin access to the LinkedIn Company Page');
        console.log('   2. The rw_organization_admin scope was granted');
        console.log('   3. Your LinkedIn app has Community Management API approved');
      }
    }
  }
}

// Run the test
testLinkedInPageStats();
