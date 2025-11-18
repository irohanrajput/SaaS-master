// Test Content Updates API - Test RSS feeds and sitemaps
import contentUpdatesService from './services/contentUpdatesService.js';

async function testContentUpdates() {
  console.log('\n📝 TESTING CONTENT UPDATES API\n');
  console.log('══════════════════════════════════════════\n');

  // Test domains with known RSS feeds and sitemaps
  const testDomains = [
    'techcrunch.com',           // Should have RSS feed
    'blog.google',              // Should have RSS feed
    'wordpress.com',            // Should have RSS feed
    'github.com',               // May have sitemap
    'stackoverflow.com',        // Should have sitemap
    'cnn.com',                  // News site with RSS
    'bbc.com',                  // News site with RSS
    'nytimes.com',              // News site with RSS
    'example.com',              // Basic site (may not have RSS/sitemap)
    'httpbin.org'               // Test site
  ];

  for (const domain of testDomains) {
    console.log(`\n🔍 Testing domain: ${domain}`);
    console.log('─'.repeat(50));

    try {
      const startTime = Date.now();
      const result = await contentUpdatesService.getContentUpdates(domain);
      const duration = Date.now() - startTime;

      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Domain: ${result.domain}`);
      console.log(`🕒 Timestamp: ${result.timestamp}`);

      // RSS Feed Results
      console.log('\n📰 RSS FEED RESULTS:');
      console.log(`   Found: ${result.rss.found ? '✅' : '❌'}`);
      if (result.rss.found) {
        console.log(`   URL: ${result.rss.url}`);
        console.log(`   Format: ${result.rss.format}`);
        console.log(`   Total Posts: ${result.rss.totalPosts}`);
        console.log(`   Recent Posts: ${result.rss.recentPosts.length}`);
        console.log(`   Last Updated: ${result.rss.lastUpdated || 'N/A'}`);

        if (result.rss.recentPosts.length > 0) {
          console.log('\n   📋 RECENT POSTS:');
          result.rss.recentPosts.slice(0, 3).forEach((post, index) => {
            console.log(`     ${index + 1}. ${post.title || 'No title'}`);
            console.log(`        Date: ${post.parsedDate ? post.parsedDate.toISOString().split('T')[0] : 'N/A'}`);
            console.log(`        Days ago: ${post.daysAgo || 'N/A'}`);
            console.log(`        Link: ${post.link || 'N/A'}`);
          });
        }
      }

      // Sitemap Results
      console.log('\n🗺️  SITEMAP RESULTS:');
      console.log(`   Found: ${result.sitemap.found ? '✅' : '❌'}`);
      if (result.sitemap.found) {
        console.log(`   URL: ${result.sitemap.url}`);
        console.log(`   Total URLs: ${result.sitemap.totalUrls}`);
        console.log(`   Recently Modified: ${result.sitemap.recentlyModified.length}`);
        console.log(`   Last Modified: ${result.sitemap.lastModified || 'N/A'}`);

        if (result.sitemap.recentlyModified.length > 0) {
          console.log('\n   📋 RECENTLY MODIFIED:');
          result.sitemap.recentlyModified.slice(0, 3).forEach((url, index) => {
            console.log(`     ${index + 1}. ${url.loc}`);
            console.log(`        Last Modified: ${url.lastmod || 'N/A'}`);
            console.log(`        Priority: ${url.priority || 'N/A'}`);
          });
        }
      }

      // Content Activity Analysis
      console.log('\n📈 CONTENT ACTIVITY:');
      console.log(`   Update Frequency: ${result.contentActivity.updateFrequency}`);
      console.log(`   Last Content Date: ${result.contentActivity.lastContentDate || 'N/A'}`);
      console.log(`   Average Posts/Month: ${result.contentActivity.averagePostsPerMonth}`);
      console.log(`   Is Active: ${result.contentActivity.isActive ? '✅' : '❌'}`);

      if (result.error) {
        console.log(`\n❌ ERROR: ${result.error}`);
      }

      // Summary
      const hasRSS = result.rss.found;
      const hasSitemap = result.sitemap.found;
      const isActive = result.contentActivity.isActive;

      console.log('\n📋 SUMMARY:');
      console.log(`   RSS Feed: ${hasRSS ? '✅' : '❌'}`);
      console.log(`   Sitemap: ${hasSitemap ? '✅' : '❌'}`);
      console.log(`   Content Active: ${isActive ? '✅' : '❌'}`);
      console.log(`   Overall Success: ${(hasRSS || hasSitemap) ? '✅' : '❌'}`);

    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }

    // Add delay between tests to be respectful
    console.log('\n⏳ Waiting 2 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 CONTENT UPDATES TESTING COMPLETE!\n');
}

// Test comparison functionality
async function testContentComparison() {
  console.log('\n🔄 TESTING CONTENT COMPARISON\n');
  console.log('══════════════════════════════════════════\n');

  const userDomain = 'techcrunch.com';
  const competitorDomain = 'bbc.com';

  try {
    console.log(`Comparing: ${userDomain} vs ${competitorDomain}`);
    const comparison = await contentUpdatesService.compareContentUpdates(userDomain, competitorDomain);

    console.log('\n📊 COMPARISON RESULTS:');
    console.log(`Your Site (${userDomain}):`);
    console.log(`   RSS Found: ${comparison.userSite.rss.found}`);
    console.log(`   Posts: ${comparison.userSite.rss.totalPosts}`);
    console.log(`   Last Update: ${comparison.userSite.rss.lastUpdated || 'N/A'}`);
    console.log(`   Activity: ${comparison.userSite.contentActivity.updateFrequency}`);

    console.log(`\nCompetitor (${competitorDomain}):`);
    console.log(`   RSS Found: ${comparison.competitorSite.rss.found}`);
    console.log(`   Posts: ${comparison.competitorSite.rss.totalPosts}`);
    console.log(`   Last Update: ${comparison.competitorSite.rss.lastUpdated || 'N/A'}`);
    console.log(`   Activity: ${comparison.competitorSite.contentActivity.updateFrequency}`);

    console.log(`\n🏆 INSIGHTS:`);
    console.log(`   More Active: ${comparison.insights.moreActive}`);
    console.log(`   Content Gap: ${JSON.stringify(comparison.insights.contentGap, null, 2)}`);
    console.log(`   Recommendation: ${comparison.insights.recommendation}`);

  } catch (error) {
    console.log(`❌ Comparison failed: ${error.message}`);
  }
}

// Run tests
async function runAllTests() {
  try {
    await testContentUpdates();
    await testContentComparison();
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Allow running specific tests from command line
const args = process.argv.slice(2);
if (args.includes('--compare')) {
  testContentComparison();
} else if (args.includes('--single')) {
  const domain = args[args.indexOf('--single') + 1] || 'techcrunch.com';
  console.log(`Testing single domain: ${domain}`);
  contentUpdatesService.getContentUpdates(domain)
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(error => console.error('Error:', error));
} else {
  runAllTests();
}