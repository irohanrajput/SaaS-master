// Test Content Updates in Competitor Analysis API
import fetch from 'node-fetch';

async function testCompetitorAnalysisAPI() {
  console.log('\n🔍 TESTING COMPETITOR ANALYSIS API WITH CONTENT UPDATES\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    console.log('📡 Making API request to: http://localhost:5000/api/competitor-analysis');
    console.log('📊 Payload: { yourDomain: "techcrunch.com", competitorDomain: "bbc.com" }\n');

    const response = await fetch('http://localhost:5000/api/competitor-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yourDomain: 'techcrunch.com',
        competitorDomain: 'bbc.com'
      })
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.log('❌ API request failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ API Response received successfully');

    // Check if content updates are present
    const hasContentUpdates = !!(data.comparison?.contentUpdates);
    console.log(`\n📝 Content Updates Present: ${hasContentUpdates ? '✅' : '❌'}`);

    if (hasContentUpdates) {
      console.log('\n📊 CONTENT UPDATES DATA:');

      console.log('\n🏠 YOUR SITE (techcrunch.com):');
      const yourContent = data.comparison.contentUpdates.your;
      console.log(`   RSS Feed: ${yourContent.hasRSS ? '✅' : '❌'}`);
      console.log(`   Sitemap: ${yourContent.hasSitemap ? '✅' : '❌'}`);
      console.log(`   Recent Posts: ${yourContent.recentPosts}`);
      console.log(`   Total Posts: ${yourContent.totalPosts}`);
      console.log(`   Update Frequency: ${yourContent.updateFrequency}`);
      console.log(`   Average Posts/Month: ${yourContent.averagePostsPerMonth}`);
      console.log(`   Is Active: ${yourContent.isActive ? '✅' : '❌'}`);
      console.log(`   Content Velocity: ${yourContent.contentVelocity}`);
      console.log(`   Last Updated: ${yourContent.lastUpdated}`);

      console.log('\n🏢 COMPETITOR (bbc.com):');
      const compContent = data.comparison.contentUpdates.competitor;
      console.log(`   RSS Feed: ${compContent.hasRSS ? '✅' : '❌'}`);
      console.log(`   Sitemap: ${compContent.hasSitemap ? '✅' : '❌'}`);
      console.log(`   Recent Posts: ${compContent.recentPosts}`);
      console.log(`   Total Posts: ${compContent.totalPosts}`);
      console.log(`   Update Frequency: ${compContent.updateFrequency}`);
      console.log(`   Average Posts/Month: ${compContent.averagePostsPerMonth}`);
      console.log(`   Is Active: ${compContent.isActive ? '✅' : '❌'}`);
      console.log(`   Content Velocity: ${compContent.contentVelocity}`);
      console.log(`   Last Updated: ${compContent.lastUpdated}`);

      console.log(`\n🏆 WINNER: ${data.comparison.contentUpdates.winner}`);

      console.log('\n📋 SUMMARY COMPARISON:');
      console.log(`   Your posts/month: ${yourContent.averagePostsPerMonth}`);
      console.log(`   Competitor posts/month: ${compContent.averagePostsPerMonth}`);
      console.log(`   Difference: ${compContent.averagePostsPerMonth - yourContent.averagePostsPerMonth} posts/month`);

    } else {
      console.log('\n❌ Content updates data is missing from API response');
      console.log('Available data keys:', Object.keys(data.comparison || {}));
    }

    // Check individual site data
    console.log('\n🔍 INDIVIDUAL SITE DATA:');
    console.log(`   Your site contentUpdates: ${!!data.yourSite?.contentUpdates}`);
    console.log(`   Competitor site contentUpdates: ${!!data.competitorSite?.contentUpdates}`);

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('Stack:', error.stack);
  }
}

// Run the test
testCompetitorAnalysisAPI();