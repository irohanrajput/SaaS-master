import seoCacheService from './services/seoCacheService.js';

/**
 * Test competitor cache functionality
 */
async function testCompetitorCache() {
  const testEmail = 'test@example.com';
  const yourSite = 'example.com';
  const competitorSite = 'competitor.com';

  console.log('🧪 Testing Competitor Cache System');
  console.log('=====================================');

  try {
    // 1. Test user lookup
    console.log('\n1️⃣ Testing user lookup...');
    const userId = await seoCacheService.getUserIdByEmail(testEmail);
    console.log('User ID:', userId);

    if (!userId) {
      console.log('⚠️ No user found with email:', testEmail);
      console.log('💡 Make sure you have a user with this email in users_table');
      return;
    }

    // 2. Test cache retrieval (should be empty initially)
    console.log('\n2️⃣ Testing cache retrieval (should be empty)...');
    const cachedData = await seoCacheService.getCompetitorCache(testEmail, yourSite, competitorSite);
    console.log('Cached data:', cachedData ? 'FOUND' : 'NOT FOUND');

    // 3. Test cache saving
    console.log('\n3️⃣ Testing cache saving...');
    const mockCompetitorData = {
      success: true,
      yourSite: {
        domain: yourSite,
        lighthouse: { performance: 85 },
        puppeteer: { 
          technology: {
            cms: null,
            frameworks: ['React'],
            analytics: ['Google Analytics'],
            thirdPartyScripts: ['example.com']
          }
        }
      },
      competitorSite: {
        domain: competitorSite,
        lighthouse: { performance: 75 },
        puppeteer: { 
          technology: {
            cms: 'WordPress',
            frameworks: ['jQuery'],
            analytics: ['Google Analytics', 'Google Tag Manager'],
            thirdPartyScripts: ['googletagmanager.com']
          }
        }
      },
      comparison: {
        performance: { yours: 85, competitor: 75, winner: 'yours' }
      },
      timestamp: new Date().toISOString()
    };

    const saveResult = await seoCacheService.saveCompetitorCache(
      testEmail, 
      yourSite, 
      competitorSite, 
      mockCompetitorData, 
      7
    );
    console.log('Save result:', saveResult ? 'SUCCESS' : 'FAILED');

    // 4. Test cache retrieval again (should find data now)
    console.log('\n4️⃣ Testing cache retrieval (should find data now)...');
    const cachedDataAfterSave = await seoCacheService.getCompetitorCache(testEmail, yourSite, competitorSite);
    console.log('Cached data after save:', cachedDataAfterSave ? 'FOUND' : 'NOT FOUND');
    
    if (cachedDataAfterSave) {
      console.log('✅ Cache working! Found data:');
      console.log('  - Competitor domain:', cachedDataAfterSave.competitorSite?.domain);
      console.log('  - Technology detected:', !!cachedDataAfterSave.competitorSite?.puppeteer?.technology);
      console.log('  - Frameworks:', cachedDataAfterSave.competitorSite?.puppeteer?.technology?.frameworks);
      console.log('  - Analytics:', cachedDataAfterSave.competitorSite?.puppeteer?.technology?.analytics);
      console.log('  - Cache age:', cachedDataAfterSave.cacheAge, 'hours');
    }

    // 5. Test cache cleanup
    console.log('\n5️⃣ Testing cache cleanup...');
    const cleanupResult = await seoCacheService.clearExpiredCompetitorCache();
    console.log('Cleanup result:', cleanupResult, 'entries removed');

    console.log('\n✅ Competitor cache test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCompetitorCache();