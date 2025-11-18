import competitorAnalysisService from './services/competitorAnalysisService.js';

/**
 * Test the complete technology detection API response
 */
async function testTechAPI() {
  const url = 'https://agenticforge.tech/';
  
  console.log(`🚀 Testing complete API response for: ${url}`);
  
  try {
    const result = await competitorAnalysisService.analyzeWebsite(url);
    
    console.log('\n📊 Complete API Response:');
    console.log('Success:', result.success);
    console.log('URL:', result.url);
    console.log('Technology:', JSON.stringify(result.technology, null, 2));
    
    if (result.technology) {
      console.log('\n🔍 Technology Breakdown:');
      console.log('  CMS:', result.technology.cms || 'None');
      console.log('  Frameworks:', result.technology.frameworks?.length || 0, 'detected');
      console.log('  Analytics:', result.technology.analytics?.length || 0, 'tools');
      console.log('  Third-party Scripts:', result.technology.thirdPartyScripts?.length || 0, 'domains');
      
      if (result.technology.frameworks?.length > 0) {
        console.log('    Frameworks:', result.technology.frameworks.join(', '));
      }
      if (result.technology.analytics?.length > 0) {
        console.log('    Analytics:', result.technology.analytics.join(', '));
      }
      if (result.technology.thirdPartyScripts?.length > 0) {
        console.log('    Scripts:', result.technology.thirdPartyScripts.slice(0, 3).join(', '));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTechAPI();