import facebookEngagementService from './services/facebookEngagementService.js';

console.log('\n════════════════════════════════════════════');
console.log('   TESTING FACEBOOK ENGAGEMENT SERVICE');
console.log('════════════════════════════════════════════\n');

async function testFacebookService() {
    try {
        // Test with EngenSA page
        const pageUsername = 'EngenSA';
        
        console.log(`Testing with Facebook page: ${pageUsername}\n`);
        
        // Get full engagement analysis
        const analysis = await facebookEngagementService.getFullEngagementAnalysis(pageUsername);
        
        console.log('\n═══════════════════════════════════════════════════');
        console.log('   COMPLETE ANALYSIS RESULT');
        console.log('═══════════════════════════════════════════════════\n');
        
        console.log('📊 PROFILE INFORMATION:');
        console.log('─────────────────────────────────────────────────');
        console.log('Name:', analysis.profile.name);
        console.log('Username:', analysis.profile.username);
        console.log('Category:', analysis.profile.category);
        console.log('Bio:', analysis.profile.bio);
        console.log('Address:', analysis.profile.address);
        console.log('Phone:', analysis.profile.phone);
        console.log('Email:', analysis.profile.email);
        console.log('Website:', analysis.profile.website);
        console.log('Link:', analysis.profile.link);
        
        console.log('\n📈 ENGAGEMENT METRICS:');
        console.log('─────────────────────────────────────────────────');
        console.log('Followers:', analysis.metrics.followers.toLocaleString());
        console.log('Page Likes:', analysis.metrics.likes.toLocaleString());
        console.log('Talking About:', analysis.metrics.talkingAbout.toLocaleString());
        console.log('Engagement Rate:', analysis.metrics.engagementRate + '%');
        console.log('Activity Level:', analysis.metrics.activityLevel);
        console.log('Est. Posts/Week:', analysis.metrics.estimatedPostsPerWeek);
        console.log('Est. Posts/Month:', analysis.metrics.estimatedPostsPerMonth);
        
        console.log('\n⭐ RATING:');
        console.log('─────────────────────────────────────────────────');
        console.log('Rating:', analysis.profile.rating, '/ 5 stars');
        console.log('Recommend:', analysis.profile.ratingPercent + '%');
        console.log('Total Reviews:', analysis.profile.ratingCount);
        
        console.log('\n💡 ANALYSIS:');
        console.log('─────────────────────────────────────────────────');
        console.log(analysis.analysis.summary);
        console.log('\nActivity Level:', analysis.analysis.activityLevel);
        console.log('Rating:', analysis.analysis.rating);
        if (analysis.analysis.note) {
            console.log('Note:', analysis.analysis.note);
        }
        
        console.log('\n════════════════════════════════════════════');
        console.log('   ✅ TEST SUCCESSFUL!');
        console.log('════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        console.log('');
    }
}

// Run the test
testFacebookService();