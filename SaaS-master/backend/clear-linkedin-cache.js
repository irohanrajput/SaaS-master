import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearLinkedInCache() {
  console.log('🗑️  Clearing LinkedIn cache...\n');
  
  try {
    // Get email from command line or use default
    const email = process.argv[2] || 'henax19725@haotuwu.com';
    
    console.log(`Clearing cache for: ${email}`);
    
    // Delete from social_media_cache table
    const { data, error } = await supabase
      .from('social_media_cache')
      .delete()
      .eq('user_email', email)
      .eq('platform', 'linkedin');
    
    if (error) {
      console.error('❌ Error clearing cache:', error);
      return;
    }
    
    console.log('✅ LinkedIn cache cleared successfully!');
    console.log('   Next API call will fetch fresh data from LinkedIn.');
    console.log('\n💡 To see fresh data:');
    console.log('   1. Refresh your dashboard');
    console.log('   2. Or wait for the next auto-refresh');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearLinkedInCache();
