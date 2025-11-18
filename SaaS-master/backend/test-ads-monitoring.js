// Test script for Google Ads and Meta Ads monitoring services

import { getGoogleAdsMonitoring } from './services/googleAdsMonitoringService.js';
import { getMetaAdsMonitoring } from './services/metaAdsMonitoringService.js';

console.log('🧪 Testing Ads Monitoring Services\n');
console.log('=' .repeat(60));

// Test domains and usernames
const testCases = {
  yourSite: {
    domain: 'agenticforge.tech',
    facebook: 'RVCEngineering'
  },
  competitor: {
    domain: 'pes.edu',
    facebook: 'pesuniversity'
  }
};

async function testGoogleAds() {
  console.log('\n📊 TESTING GOOGLE ADS MONITORING');
  console.log('=' .repeat(60));
  
  // Test your site
  console.log('\n🔍 Testing your site:', testCases.yourSite.domain);
  const yourGoogleAds = await getGoogleAdsMonitoring(testCases.yourSite.domain);
  console.log('Result:', JSON.stringify(yourGoogleAds, null, 2));
  console.log('✅ Your site Google Ads:', yourGoogleAds.error ? 'FAILED' : `SUCCESS (${yourGoogleAds.totalAds} ads)`);
  
  // Test competitor
  console.log('\n🔍 Testing competitor:', testCases.competitor.domain);
  const compGoogleAds = await getGoogleAdsMonitoring(testCases.competitor.domain);
  console.log('Result:', JSON.stringify(compGoogleAds, null, 2));
  console.log('✅ Competitor Google Ads:', compGoogleAds.error ? 'FAILED' : `SUCCESS (${compGoogleAds.totalAds} ads)`);
}

async function testMetaAds() {
  console.log('\n\n📘 TESTING META ADS MONITORING');
  console.log('=' .repeat(60));
  
  // Test your site
  console.log('\n🔍 Testing your site Facebook:', testCases.yourSite.facebook);
  const yourMetaAds = await getMetaAdsMonitoring(testCases.yourSite.facebook);
  console.log('Result:', JSON.stringify(yourMetaAds, null, 2));
  console.log('✅ Your site Meta Ads:', yourMetaAds.error ? 'FAILED' : `SUCCESS (${yourMetaAds.totalAds} ads)`);
  
  // Test competitor
  console.log('\n🔍 Testing competitor Facebook:', testCases.competitor.facebook);
  const compMetaAds = await getMetaAdsMonitoring(testCases.competitor.facebook);
  console.log('Result:', JSON.stringify(compMetaAds, null, 2));
  console.log('✅ Competitor Meta Ads:', compMetaAds.error ? 'FAILED' : `SUCCESS (${compMetaAds.totalAds} ads)`);
}

async function runTests() {
  try {
    await testGoogleAds();
    await testMetaAds();
    
    console.log('\n\n' + '=' .repeat(60));
    console.log('🎯 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log('✅ Google Ads: Check results above');
    console.log('✅ Meta Ads: Check results above');
    console.log('\nIf Meta Ads failed with quota error, you need to:');
    console.log('1. Use a different RapidAPI account');
    console.log('2. Upgrade your RapidAPI plan');
    console.log('3. Use alternative Facebook API (Meta Graph API)');
    console.log('4. Use direct SearchAPI.io Meta Ad Library search (search by name instead of page_id)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
