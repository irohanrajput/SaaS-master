// Test Content Analysis with detailed insights
import contentUpdatesService from './services/contentUpdatesService.js';

async function testDetailedComparison() {
  console.log('\n🔍 DETAILED CONTENT ANALYSIS COMPARISON TEST\n');
  console.log('══════════════════════════════════════════════════\n');

  const userDomain = 'pes.edu';  // Low activity site
  const competitorDomain = 'blog.google';  // High activity site

  try {
    console.log(`📊 Comparing: ${userDomain} (Your Site) vs ${competitorDomain} (Competitor)\n`);
    
    const comparison = await contentUpdatesService.compareContentUpdates(userDomain, competitorDomain);

    // Display comparison summary
    console.log('\n═══════════════ COMPARISON SUMMARY ═══════════════\n');
    
    console.log('📈 YOUR SITE (' + userDomain + '):');
    console.log('   RSS Feed:', comparison.userSite.rss.found ? '✅ Found' : '❌ Not Found');
    console.log('   Total Posts:', comparison.userSite.rss.totalPosts);
    console.log('   Sitemap:', comparison.userSite.sitemap.found ? '✅ Found' : '❌ Not Found');
    console.log('   Total URLs:', comparison.userSite.sitemap.totalUrls);
    console.log('   Content Velocity:', comparison.userSite.contentActivity.contentVelocity);
    console.log('   Update Frequency:', comparison.userSite.contentActivity.updateFrequency);
    console.log('   Posts/Month:', comparison.userSite.contentActivity.averagePostsPerMonth);
    console.log('   Active:', comparison.userSite.contentActivity.isActive ? '✅' : '❌');

    console.log('\n📊 COMPETITOR (' + competitorDomain + '):');
    console.log('   RSS Feed:', comparison.competitorSite.rss.found ? '✅ Found' : '❌ Not Found');
    console.log('   Total Posts:', comparison.competitorSite.rss.totalPosts);
    console.log('   Sitemap:', comparison.competitorSite.sitemap.found ? '✅ Found' : '❌ Not Found');
    console.log('   Total URLs:', comparison.competitorSite.sitemap.totalUrls);
    console.log('   Content Velocity:', comparison.competitorSite.contentActivity.contentVelocity);
    console.log('   Update Frequency:', comparison.competitorSite.contentActivity.updateFrequency);
    console.log('   Posts/Month:', comparison.competitorSite.contentActivity.averagePostsPerMonth);
    console.log('   Active:', comparison.competitorSite.contentActivity.isActive ? '✅' : '❌');

    console.log('\n═══════════════ INSIGHTS & ANALYSIS ═══════════════\n');
    
    console.log('🏆 WINNER:', comparison.insights.moreActive === 'user' ? 'You' : comparison.insights.moreActive === 'competitor' ? 'Competitor' : 'Tie');
    
    console.log('\n📊 CONTENT GAP ANALYSIS:');
    console.log('   Posts/Month Difference:', comparison.insights.contentGap.postsPerMonthDiff);
    console.log('   Recent Activity Difference:', comparison.insights.contentGap.recentActivityDiff);
    console.log('   Velocity Gap:', comparison.insights.contentGap.velocityGap);
    console.log('   Frequency Gap:', comparison.insights.contentGap.frequencyGap);

    console.log('\n💡 MAIN RECOMMENDATION:');
    console.log('   ' + comparison.insights.recommendation);

    console.log('\n📋 DETAILED RECOMMENDATIONS:');
    if (comparison.insights.recommendations && comparison.insights.recommendations.length > 0) {
      comparison.insights.recommendations.forEach((rec, index) => {
        console.log(`\n   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.category}`);
        console.log(`      Issue: ${rec.issue}`);
        console.log(`      Action: ${rec.action}`);
        console.log(`      Impact: ${rec.impact}`);
      });
    } else {
      console.log('   ✅ No critical issues found!');
    }

    console.log('\n🎯 SEO IMPACT ASSESSMENT:');
    if (comparison.insights.seoImpact) {
      console.log(`   Score: ${comparison.insights.seoImpact.score}/100`);
      console.log(`   Level: ${comparison.insights.seoImpact.level.toUpperCase()}`);
      console.log('\n   Factors:');
      comparison.insights.seoImpact.factors.forEach(factor => {
        console.log(`   ${factor}`);
      });
    }

    console.log('\n📝 CONTENT STRATEGY:');
    if (comparison.insights.contentStrategy) {
      console.log('\n   🚀 Quick Wins:');
      comparison.insights.contentStrategy.quickWins.forEach((win, i) => {
        console.log(`      ${i + 1}. ${win}`);
      });

      console.log('\n   🎯 Long-Term Goals:');
      comparison.insights.contentStrategy.longTermGoals.forEach((goal, i) => {
        console.log(`      ${i + 1}. ${goal}`);
      });

      if (comparison.insights.contentStrategy.competitiveAdvantages.length > 0) {
        console.log('\n   ⚡ Competitive Advantages:');
        comparison.insights.contentStrategy.competitiveAdvantages.forEach((adv, i) => {
          console.log(`      ${i + 1}. ${adv}`);
        });
      }

      console.log('\n   📌 Priorities:');
      comparison.insights.contentStrategy.priorities.forEach((pri) => {
        console.log(`      Priority ${pri.priority}: ${pri.task}`);
      });
    }

    console.log('\n══════════════════════════════════════════════════\n');
    console.log('✅ DETAILED COMPARISON TEST COMPLETE!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the detailed comparison test
testDetailedComparison();
