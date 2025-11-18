import axios from 'axios';
import oauthTokenService from './services/oauthTokenService.js';

/**
 * Test script to fetch LinkedIn analytics data
 * Run with: node test-linkedin-analytics.js <email>
 */

const testLinkedInAnalytics = async (email) => {
  try {
    console.log('🔍 Testing LinkedIn Analytics API');
    console.log('📧 Email:', email);
    console.log('='.repeat(60));

    // Get access token from database
    const tokens = await oauthTokenService.getTokens(email, 'linkedin');
    
    if (!tokens || !tokens.access_token) {
      console.error('❌ No LinkedIn token found for this email');
      process.exit(1);
    }

    console.log('✅ Access token found');
    console.log('🔑 Token (first 20 chars):', tokens.access_token.substring(0, 20) + '...');
    console.log('');

    const headers = {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json'
    };

    // Step 1: Get organizations
    console.log('1️⃣ Fetching organizations...');
    const orgResponse = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls', {
      params: {
        q: 'roleAssignee',
        projection: '(elements*(organizationalTarget,role,state))'
      },
      headers
    });

    console.log('📊 Response:', JSON.stringify(orgResponse.data, null, 2));
    console.log('');

    const organizations = orgResponse.data.elements || [];
    
    if (organizations.length === 0) {
      console.error('❌ No LinkedIn organizations found');
      process.exit(1);
    }

    const orgUrn = organizations[0].organizationalTarget;
    console.log('✅ Organization URN:', orgUrn);
    console.log('');

    // Step 2: Get organization details
    console.log('2️⃣ Fetching organization details...');
    const orgId = orgUrn.split(':').pop();
    const orgDetailsResponse = await axios.get(`https://api.linkedin.com/v2/organizations/${orgId}`, {
      headers
    });

    console.log('📊 Organization Details:', JSON.stringify(orgDetailsResponse.data, null, 2));
    console.log('');

    // Step 3: Get posts
    console.log('3️⃣ Fetching posts...');
    const postsResponse = await axios.get('https://api.linkedin.com/v2/shares', {
      params: {
        q: 'owners',
        owners: orgUrn,
        sortBy: 'LAST_MODIFIED',
        count: 5
      },
      headers
    });

    console.log('📊 Posts Response:', JSON.stringify(postsResponse.data, null, 2));
    const posts = postsResponse.data.elements || [];
    console.log(`✅ Found ${posts.length} posts`);
    console.log('');

    if (posts.length === 0) {
      console.log('⚠️  No posts found');
      process.exit(0);
    }

    // Step 4: Test each API for the first post
    const firstPost = posts[0];
    const postId = firstPost.id;
    const postUrn = `urn:li:share:${postId}`;
    const encodedUrn = encodeURIComponent(postUrn);

    console.log('4️⃣ Testing APIs for first post:', postId);
    console.log('');

    // Test A: Social Metadata API (reactions, comments)
    console.log('🔸 A) Testing Social Metadata API...');
    try {
      const socialMetadataResponse = await axios.get(
        `https://api.linkedin.com/v2/socialMetadata/${encodedUrn}`,
        { headers }
      );
      console.log('✅ Social Metadata Response:', JSON.stringify(socialMetadataResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Social Metadata API failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test B: Share Statistics API (impressions, clicks)
    console.log('🔸 B) Testing Share Statistics API...');
    try {
      const statsResponse = await axios.get(
        `https://api.linkedin.com/v2/organizationalEntityShareStatistics`,
        {
          params: {
            q: 'organizationalEntity',
            organizationalEntity: orgUrn,
            shares: `List(${postUrn})`
          },
          headers
        }
      );
      console.log('✅ Share Statistics Response:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Share Statistics API failed:', error.response?.data || error.message);
      console.log('');
      console.log('💡 This is expected if you don\'t have analytics permissions');
      console.log('   Required scope: r_organization_social or rw_organization_admin');
    }
    console.log('');

    // Test C: Organization Social Actions (alternative analytics)
    console.log('🔸 C) Testing Organization Social Actions API...');
    try {
      const socialActionsResponse = await axios.get(
        `https://api.linkedin.com/v2/organizationSocialActions`,
        {
          params: {
            q: 'organization',
            organization: orgUrn,
            count: 5
          },
          headers
        }
      );
      console.log('✅ Social Actions Response:', JSON.stringify(socialActionsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Social Actions API failed:', error.response?.data || error.message);
    }
    console.log('');

    // Test D: Analytics Finder API
    console.log('🔸 D) Testing Analytics Finder API...');
    try {
      const analyticsResponse = await axios.get(
        `https://api.linkedin.com/v2/organizationalEntityShareStatistics`,
        {
          params: {
            q: 'organizationalEntity',
            organizationalEntity: orgUrn
          },
          headers
        }
      );
      console.log('✅ Analytics Finder Response:', JSON.stringify(analyticsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Analytics Finder API failed:', error.response?.data || error.message);
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ Test Complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`  - Organization: ${orgDetailsResponse.data.localizedName}`);
    console.log(`  - Total Posts: ${posts.length}`);
    console.log('');
    console.log('💡 Next Steps:');
    console.log('  1. Review the API responses above');
    console.log('  2. Check which APIs returned data successfully');
    console.log('  3. Update the engagement rate calculation accordingly');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('');
      console.error('💡 Token might be expired. Try reconnecting LinkedIn.');
    }
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Email required');
  console.error('Usage: node test-linkedin-analytics.js <email>');
  process.exit(1);
}

testLinkedInAnalytics(email);
