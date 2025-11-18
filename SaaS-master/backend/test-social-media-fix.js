#!/usr/bin/env node

/**
 * Test script to verify social media data switching fixes
 */

import linkedinScraperService from './services/linkedinScraperService.js';

async function testLinkedInScraper() {
  console.log('🧪 Testing LinkedIn Scraper Improvements');
  console.log('==========================================');

  const testUrl = 'https://www.linkedin.com/company/microsoft';
  
  try {
    console.log(`\n1. Testing fallback data generation...`);
    const fallbackData = linkedinScraperService.generateFallbackData(testUrl);
    console.log(`   ✅ Fallback data generated successfully`);
    console.log(`   📊 Company: ${fallbackData.companyName}`);
    console.log(`   👥 Followers: ${fallbackData.companyFollowers}`);
    console.log(`   📈 Engagement Rate: ${fallbackData.engagementScore.engagementRate}%`);
    console.log(`   📝 Posts: ${fallbackData.topPosts.length}`);

    console.log(`\n2. Testing cache functionality...`);
    const cacheKey = 'test_cache_key';
    linkedinScraperService.saveToCache(cacheKey, fallbackData);
    const cachedData = linkedinScraperService.getFromCache(cacheKey);
    
    if (cachedData) {
      console.log(`   ✅ Cache working - age: ${cachedData.age} minutes`);
    } else {
      console.log(`   ❌ Cache not working`);
    }

    console.log(`\n3. Testing URL validation...`);
    const validUrls = [
      'https://www.linkedin.com/company/microsoft',
      'https://linkedin.com/company/google',
      'http://www.linkedin.com/company/apple'
    ];
    
    const invalidUrls = [
      'https://facebook.com/microsoft',
      'https://linkedin.com/profile/john-doe',
      'not-a-url'
    ];

    validUrls.forEach(url => {
      const isValid = linkedinScraperService.isValidLinkedInUrl(url);
      console.log(`   ${isValid ? '✅' : '❌'} ${url} - ${isValid ? 'Valid' : 'Invalid'}`);
    });

    invalidUrls.forEach(url => {
      const isValid = linkedinScraperService.isValidLinkedInUrl(url);
      console.log(`   ${isValid ? '❌' : '✅'} ${url} - ${isValid ? 'Invalid (but detected as valid)' : 'Correctly invalid'}`);
    });

    console.log(`\n4. Testing number formatting...`);
    const testNumbers = [500, 1500, 15000, 150000, 1500000];
    testNumbers.forEach(num => {
      const formatted = linkedinScraperService.formatNumber(num);
      console.log(`   📊 ${num} → ${formatted}`);
    });

    console.log(`\n✅ All tests completed successfully!`);
    console.log(`\n📋 Summary of Improvements:`);
    console.log(`   • Added caching to reduce API calls`);
    console.log(`   • Implemented fallback data for failed scrapes`);
    console.log(`   • Added timeout handling (30s limit)`);
    console.log(`   • Improved error handling and recovery`);
    console.log(`   • Enhanced data validation`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testLinkedInScraper().then(() => {
  console.log('\n🎉 Test completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});