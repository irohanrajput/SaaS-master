// Simple test for ChangeDetection.io integration
import changeDetectionService from './services/changeDetectionService.js';

async function testChangeDetection() {
  console.log('\n🧪 Testing ChangeDetection.io Integration\n');
  console.log('='.repeat(50));
  
  const testDomain = 'pes.edu';
  
  console.log(`\n1️⃣  Testing analyzeContentChanges for: ${testDomain}`);
  console.log('-'.repeat(50));
  
  try {
    const result = await changeDetectionService.analyzeContentChanges(testDomain);
    
    console.log('\n📊 Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log(`   Domain: ${result.domain}`);
      console.log(`   UUID: ${result.uuid}`);
      console.log(`   Last Checked: ${new Date(result.monitoring.lastChecked * 1000).toLocaleString()}`);
      console.log(`   Last Changed: ${result.monitoring.lastChanged ? new Date(result.monitoring.lastChanged * 1000).toLocaleString() : 'Never'}`);
      console.log(`   Check Count: ${result.monitoring.checkCount}`);
      console.log(`   Change Count: ${result.monitoring.changeCount}`);
      console.log(`   Activity Level: ${result.activity.activityLevel}`);
      console.log(`   Is Active: ${result.activity.isActive}`);
      console.log(`   Triggers: ${result.triggers.join(', ')}`);
      console.log(`   History Count: ${result.history.length}`);
    } else {
      console.log('\n❌ FAILED!');
      console.log(`   Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log('\n❌ EXCEPTION!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Test complete!\n');
}

testChangeDetection();
