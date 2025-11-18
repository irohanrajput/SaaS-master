/**
 * Clear Facebook Cache
 * Run this to clear old cached data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🗑️ Clearing Facebook cache...\n');

const { data, error } = await supabase
  .from('social_media_cache')
  .delete()
  .eq('user_email', 'contact.pawsomeai@gmail.com')
  .eq('platform', 'facebook')
  .select();

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log(`✅ Cleared ${data?.length || 0} cache entries`);
  console.log('\n💡 Now refresh your dashboard - it will fetch fresh data!');
}
