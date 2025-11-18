// Test LinkedIn RapidAPI - Company Posts
import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'd67449dc75msha394daa5d291066p15b1b1jsn494656560ede';

async function testLinkedInAPI(username) {
  console.log(`\n🧪 Testing LinkedIn RapidAPI for: ${username}\n`);
  console.log('='.repeat(60));

  const options = {
    method: 'GET',
    url: 'https://linkedin-data-api.p.rapidapi.com/get-company-posts',
    params: {
      username: username,
      start: '0'
    },
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com'
    }
  };

  try {
    console.log(`📡 Fetching posts for: ${username}...`);
    const response = await axios.request(options);
    const data = response.data;

    console.log('\n✅ API Response received!\n');
    console.log('Success:', data.success);
    console.log('Message:', data.message || 'None');
    console.log('Total Posts:', data.data?.length || 0);

    if (data.success && data.data && data.data.length > 0) {
      console.log('\n📊 Sample Post Structure:');
      console.log('='.repeat(60));
      
      const post = data.data[0];
      console.log('\nPost Details:');
      console.log('  Text:', post.text?.substring(0, 100) + '...');
      console.log('  Posted At:', post.postedAt);
      console.log('  Posted Date:', post.postedDate);
      console.log('  URL:', post.postUrl);
      
      console.log('\nEngagement:');
      console.log('  Total Reactions:', post.totalReactionCount);
      console.log('  Likes:', post.likeCount);
      console.log('  Comments:', post.commentsCount);
      console.log('  Reposts:', post.repostsCount);
      
      console.log('\nAuthor/Company:');
      console.log('  Name:', post.author?.company?.name);
      console.log('  Username:', post.author?.company?.username);
      console.log('  URL:', post.author?.company?.url);
      console.log('  URN:', post.author?.company?.urn);
      
      console.log('\nContent Type:');
      console.log('  Type:', post.contentType);
      if (post.article) {
        console.log('  Article Title:', post.article.title);
        console.log('  Article Link:', post.article.link);
      }

      // Calculate metrics
      console.log('\n📈 Calculated Metrics:');
      console.log('='.repeat(60));
      
      const totalEngagement = data.data.reduce((sum, p) => 
        sum + (p.totalReactionCount || 0) + (p.commentsCount || 0) + (p.repostsCount || 0), 0
      );
      const avgEngagement = totalEngagement / data.data.length;
      
      const totalLikes = data.data.reduce((sum, p) => sum + (p.likeCount || 0), 0);
      const totalComments = data.data.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
      const totalReposts = data.data.reduce((sum, p) => sum + (p.repostsCount || 0), 0);
      
      console.log('  Total Engagement:', totalEngagement);
      console.log('  Avg Engagement/Post:', avgEngagement.toFixed(1));
      console.log('  Total Likes:', totalLikes);
      console.log('  Total Comments:', totalComments);
      console.log('  Total Reposts:', totalReposts);
      
      console.log('\n✅ Test completed successfully!');
      
      return {
        success: true,
        companyName: post.author?.company?.name,
        username: post.author?.company?.username,
        postsCount: data.data.length,
        totalEngagement,
        avgEngagement,
        totalLikes,
        totalComments,
        totalReposts,
        posts: data.data
      };
    } else {
      console.log('\n⚠️ No posts found or API returned error');
      return { success: false, error: 'No posts found' };
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Test with multiple companies
async function runTests() {
  const testCompanies = ['google', 'microsoft', 'rvcengineering', 'pesuniversity'];
  
  for (const company of testCompanies) {
    await testLinkedInAPI(company);
    console.log('\n' + '='.repeat(60) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between requests
  }
}

runTests();
