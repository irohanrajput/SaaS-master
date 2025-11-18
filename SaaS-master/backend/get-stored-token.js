/**
 * Get stored LinkedIn token from database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://krgaukhigntjdfacppbq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZ2F1a2hpZ250amRmYWNwcGJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMzE3NSwiZXhwIjoyMDc0Nzk5MTc1fQ.ZHqUGqVC0iw4xTiWaAARj_5yC5QIkvK7HpR_Igok2B8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const userEmail = 'test@example.com';

console.log('🔍 Fetching stored LinkedIn token...\n');

const { data, error } = await supabase
  .from('oauth_tokens')
  .select('*')
  .eq('email', userEmail)
  .eq('provider', 'linkedin')
  .single();

if (error) {
  console.error('❌ Error:', error.message);
} else if (data) {
  console.log('✅ Token found!\n');
  console.log('Full Access Token:');
  console.log(data.access_token);
  console.log('\n📋 Copy this token and paste it in test-linkedin-direct-api.js');
} else {
  console.log('❌ No token found for:', userEmail);
}
