import 'dotenv/config';
import axios from 'axios';

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const baseURL = 'https://graph.facebook.com/v21.0';

console.log('🧪 Simple Instagram API Test\n');
console.log('='.repeat(60));

// Check token
console.log('\n🔑 Token Check:');
console.log('  Length:', token?.length || 0);
console.log('  First 30:', token?.substring(0, 30) + '...');
console.log('  Valid:', token ? '✅' : '❌');

if (!token) {
  console.log('\n❌ No token found in .env file!');
  process.exit(1);
}

// Test 1: Get Facebook Pages
console.log('\n📄 Test 1: Get Facebook Pages');
console.log('-'.repeat(60));
try {
  const response = await axios.get(`${baseURL}/me/accounts`, {
    params: {
      access_token: token,
      fields: 'id,name,access_token'
    }
  });

  const pages = response.data.data || [];
  console.log(`✅ Found ${pages.length} page(s)`);

  if (pages.length === 0) {
    console.log('\n❌ No pages found!');
    console.log('⚠️  Token needs page access. Regenerate with pages_show_list permission');
    process.exit(1);
  }

  pages.forEach((page, index) => {
    console.log(`\n   Page ${index + 1}:`);
    console.log(`   Name: ${page.name}`);
    console.log(`   ID: ${page.id}`);
  });

  // Use first page for next test
  const pageId = pages[0].id;
  const pageName = pages[0].name;

  // Test 2: Get Instagram Account
  console.log('\n\n📸 Test 2: Get Instagram Account from Page');
  console.log('-'.repeat(60));
  console.log(`Checking page: ${pageName} (${pageId})`);

  const igResponse = await axios.get(`${baseURL}/${pageId}`, {
    params: {
      access_token: token,
      fields: 'instagram_business_account'
    }
  });

  const igAccountId = igResponse.data.instagram_business_account?.id;

  if (!igAccountId) {
    console.log('\n❌ No Instagram Business Account linked to this page!');
    console.log('⚠️  Go to your Facebook Page → Settings → Instagram → Connect Account');
    process.exit(1);
  }

  console.log(`✅ Found Instagram Account ID: ${igAccountId}`);

  // Test 3: Get Instagram Profile
  console.log('\n\n👤 Test 3: Get Instagram Profile Details');
  console.log('-'.repeat(60));

  const profileResponse = await axios.get(`${baseURL}/${igAccountId}`, {
    params: {
      access_token: token,
      fields: 'username,name,followers_count,media_count,profile_picture_url'
    }
  });

  const profile = profileResponse.data;
  console.log('✅ Profile retrieved successfully!');
  console.log(`\n   Username: @${profile.username}`);
  console.log(`   Name: ${profile.name || 'N/A'}`);
  console.log(`   Followers: ${profile.followers_count?.toLocaleString() || 0}`);
  console.log(`   Posts: ${profile.media_count || 0}`);

  // Test 4: Get Recent Media
  console.log('\n\n📷 Test 4: Get Recent Posts');
  console.log('-'.repeat(60));

  const mediaResponse = await axios.get(`${baseURL}/${igAccountId}/media`, {
    params: {
      access_token: token,
      fields: 'id,caption,media_type,like_count,comments_count,timestamp',
      limit: 5
    }
  });

  const media = mediaResponse.data.data || [];
  console.log(`✅ Found ${media.length} recent post(s)`);

  media.forEach((post, index) => {
    console.log(`\n   Post ${index + 1}:`);
    console.log(`   Type: ${post.media_type}`);
    console.log(`   Caption: ${post.caption?.substring(0, 50) || 'No caption'}...`);
    console.log(`   Likes: ${post.like_count || 0}`);
    console.log(`   Comments: ${post.comments_count || 0}`);
    console.log(`   Date: ${new Date(post.timestamp).toLocaleDateString()}`);
  });

  // Success!
  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL TESTS PASSED! Your Instagram API is working! 🎉');
  console.log('='.repeat(60));
  console.log('\nYou can now use the full instagramMetricsService.js');

} catch (error) {
  console.log('\n❌ ERROR:', error.message);

  if (error.response?.data) {
    console.log('\n📋 API Response:');
    console.log(JSON.stringify(error.response.data, null, 2));
  }

  if (error.response?.status === 400) {
    console.log('\n💡 Possible causes:');
    console.log('   - Token is invalid or malformed'); cd
    console.log('   - Token doesn\'t have required permissions');
    console.log('   - Token has expired (expires in 1 hour by default)');
  }

  if (error.response?.status === 190) {
    console.log('\n💡 Token issue - try:');
    console.log('   1. Generate new token in Graph API Explorer');
    console.log('   2. Make sure to select your Facebook Page when authorizing');
    console.log('   3. Copy the ENTIRE token to .env file');
  }

  console.log('\n   Error details:', error.response?.status, error.response?.statusText);
}
