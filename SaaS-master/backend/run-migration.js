// Run database migration to add social media handle columns
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  try {
    console.log('🔄 Running migration: add_social_handles_to_cache.sql\n');
    
    const sql = fs.readFileSync('./migrations/add_social_handles_to_cache.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error('❌ Error:', error.message);
        } else {
          console.log('✅ Success\n');
        }
      }
    }
    
    console.log('✅ Migration completed!');
    console.log('\nNew columns added to competitor_cache:');
    console.log('  - user_instagram_handle');
    console.log('  - user_facebook_handle');
    console.log('  - user_linkedin_handle');
    console.log('  - competitor_instagram_handle');
    console.log('  - competitor_facebook_handle');
    console.log('  - competitor_linkedin_handle');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
