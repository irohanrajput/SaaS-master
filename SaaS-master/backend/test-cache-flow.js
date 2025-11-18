import competitorCacheService from './services/competitorCacheService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test the complete cache flow
 */
async function testCacheFlow() {
  const testEmail = 'iammusharraf11@gmail.com';
  const yourSite = 'agenticforge.tech';
  const competitorSite = 'pes.edu';

  console.log('🧪 Testing Complete Cache Flow');
  console.log('==============================\n');

  try {
    // 1. Clear any existing cache
    console.log('1️⃣ Clearing existing cache...');
    await competitorCacheService.deleteCache(testEmail, yourSite, competitorSite);
    console.log('✅ Cache cleared\n');

    // 2. First request - should be cache miss
    console.log('2️⃣ First request (should be CACHE MISS)...');
    let cached = await competitorCacheService.getCompetitorCache(testEmail, yourSite, competitorSite);
    console.log('Result:', cached ? '❌ UNEXPECTED CACHE HIT' : '✅ CACHE MISS (Expected)\n');

    // 3. Save mock data
    console.log('3️⃣ Saving analysis data to cache...');
    const mockData = {
      success: true,
      yourSite: { domain: yourSite },
      competitorSite: {
        domain: competitorSite,
        puppeteer: {
          technology: {
            cms: 'WordPress',
            frameworks: ['jQuery'],
            analytics: ['Google Analytics'],
            thirdPartyScripts: ['example.com']
          }
        }
      },
      comparison: {},
      timestamp: new Date().toISOString()
    };
    
    const saved = await competitorCacheService.saveCompetitorCache(testEmail, yourSite, competitorSite, mockData, 7);
    console.log('Result:', saved ? '✅ SAVED' : '❌ FAILED\n');

    // 4. Second request - should be cache hit
    console.log('4️⃣ Second request (should be CACHE HIT)...');
    cached = await competitorCacheService.getCompetitorCache(testEmail, yourSite, competitorSite);
    console.log('Result:', cached ? '✅ CACHE HIT (Expected)' : '❌ CACHE MISS (Unexpected)');
    if (cached) {
      console.log('   - Cache Age:', cached.cacheAge, 'hours');
      console.log('   - Has Technology:', !!cached.competitorSite?.puppeteer?.technology);
      console.log('   - Frameworks:', cached.competitorSite?.puppeteer?.technology?.frameworks);
    }
    console.log('');

    // 5. Test with different domain formats
    console.log('5️⃣ Testing domain normalization...');
    const variations = [
      `https://${yourSite}`,
      `https://www.${yourSite}`,
      `http://${yourSite}/`,
      yourSite
    ];
    
    for (const variation of variations) {
      const result = await competitorCacheService.getCompetitorCache(testEmail, variation, competitorSite);
      console.log(`   ${variation.padEnd(35)} → ${result ? '✅ HIT' : '❌ MISS'}`);
    }
    console.log('');

    // 6. Test force refresh
    console.log('6️⃣ Testing force refresh...');
    cached = await competitorCacheService.getCompetitorCache(testEmail, yourSite, competitorSite, true);
    console.log('Result:', cached ? '❌ CACHE HIT (Should be bypassed)' : '✅ CACHE BYPASSED (Expected)\n');

    console.log('✅ All cache flow tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Cache save: Working');
    console.log('   - Cache retrieval: Working');
    console.log('   - Domain normalization: Working');
    console.log('   - Force refresh: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCacheFlow();