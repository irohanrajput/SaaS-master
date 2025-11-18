import competitorCacheService from './services/competitorCacheService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test the new competitor cache service
 */
async function testNewCompetitorCache() {
  // Use a real email from your users_table
  const testEmail = 'iammusharraf11@gmail.com'; // This email exists in your users_table
  const yourSite = 'agenticforge.tech';
  const competitorSite = 'pes.edu';

  console.log('🧪 Testing New Competitor Cache Service');
  console.log('=======================================');

  try {
    // 1. Test user lookup
    console.log('\n1️⃣ Testing user lookup...');
    const userId = await competitorCacheService.getUserIdByEmail(testEmail);
    console.log('User ID:', userId);

    if (!userId) {
      console.log('⚠️ No user found with email:', testEmail);
      return;
    }

    // 2. Test cache retrieval (should be empty initially)
    console.log('\n2️⃣ Testing cache retrieval (should be empty)...');
    const cachedData = await competitorCacheService.getCompetitorCache(testEmail, yourSite, competitorSite);
    console.log('Cached data:', cachedData ? 'FOUND' : 'NOT FOUND');

    if (cachedData) {
      console.log('  - Cache age:', cachedData.cacheAge, 'hours');
      console.log('  - Has technology data:', !!cachedData.competitorSite?.puppeteer?.technology);
    }

    // 3. Test cache saving
    console.log('\n3️⃣ Testing cache saving...');
    const mockCompetitorData = {
      success: true,
      yourSite: {
        domain: yourSite,
        lighthouse: { 
          categories: {
            performance: { score: 0.85, displayValue: 85 }
          }
        },
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
        lighthouse: { 
          categories: {
            performance: { score: 0.75, displayValue: 75 }
          }
        },
        puppeteer: { 
          technology: {
            cms: 'WordPress',
            frameworks: ['jQuery'],
            analytics: ['Google Analytics', 'Google Tag Manager'],
            thirdPartyScripts: ['googletagmanager.com']
          }
        },
        traffic: {
          success: true,
          metrics: {
            monthlyVisits: 50000,
            avgVisitDuration: 120,
            pagesPerVisit: 2.5
          }
        }
      },
      comparison: {
        performance: { yours: 85, competitor: 75, winner: 'yours' },
        technology: {
          your: {
            cms: null,
            frameworks: ['React'],
            analytics: ['Google Analytics'],
            thirdPartyScripts: ['example.com']
          },
          competitor: {
            cms: 'WordPress',
            frameworks: ['jQuery'],
            analytics: ['Google Analytics', 'Google Tag Manager'],
            thirdPartyScripts: ['googletagmanager.com']
          }
        }
      },
      timestamp: new Date().toISOString()
    };

    const saveResult = await competitorCacheService.saveCompetitorCache(
      testEmail, 
      yourSite, 
      competitorSite, 
      mockCompetitorData, 
      7
    );
    console.log('Save result:', saveResult ? 'SUCCESS' : 'FAILED');

    // 4. Test cache retrieval again (should find data now)
    console.log('\n4️⃣ Testing cache retrieval (should find data now)...');
    const cachedDataAfterSave = await competitorCacheService.getCompetitorCache(testEmail, yourSite, competitorSite);
    console.log('Cached data after save:', cachedDataAfterSave ? 'FOUND' : 'NOT FOUND');
    
    if (cachedDataAfterSave) {
      console.log('✅ Cache working! Found data:');
      console.log('  - Competitor domain:', cachedDataAfterSave.competitorSite?.domain);
      console.log('  - Technology detected:', !!cachedDataAfterSave.competitorSite?.puppeteer?.technology);
      console.log('  - Frameworks:', cachedDataAfterSave.competitorSite?.puppeteer?.technology?.frameworks);
      console.log('  - Analytics:', cachedDataAfterSave.competitorSite?.puppeteer?.technology?.analytics);
      console.log('  - Traffic data:', !!cachedDataAfterSave.competitorSite?.traffic);
      console.log('  - Cache age:', cachedDataAfterSave.cacheAge, 'hours');
    }

    // 5. Test with different domain formats (should still hit cache)
    console.log('\n5️⃣ Testing domain normalization...');
    const cachedWithHttps = await competitorCacheService.getCompetitorCache(testEmail, `https://${yourSite}`, `https://www.${competitorSite}`);
    console.log('Cache hit with different domain format:', cachedWithHttps ? 'YES' : 'NO');

    console.log('\n✅ New competitor cache test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testNewCompetitorCache();