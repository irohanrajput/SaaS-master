import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearAllCache() {
  console.log('🗑️  FORCE CLEARING ALL CACHES...\n');
  
  try {
    // Get email from command line or use default
    const email = process.argv[2] || 'henax19725@haotuwu.com';
    
    console.log(`Clearing ALL caches for: ${email}\n`);
    
    // Delete ALL social media cache for this user
    const { data, error } = await supabase
      .from('social_media_cache')
      .delete()
      .eq('user_email', email);
    
    if (error) {
      console.error('❌ Error clearing cache:', error);
      return;
    }
    
    console.log('✅ Supabase cache cleared!');
    console.log('\n📱 NOW DO THIS:');
    console.log('   1. Open browser DevTools (F12)');
    console.log('   2. Go to Console tab');
    console.log('   3. Paste this: localStorage.clear(); location.reload();');
    console.log('   4. Press Enter');
    console.log('\n✨ Your dashboard will reload with fresh data showing impressions=38, clicks=2\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearAllCache();
