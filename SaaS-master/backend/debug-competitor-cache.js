import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Debug competitor cache table
 */
async function debugCompetitorCache() {
  console.log('🔍 Debugging Competitor Cache Table');
  console.log('====================================');

  try {
    // 1. Check table structure
    console.log('\n1️⃣ Checking table structure...');
    let columns, columnsError;
    try {
      const result = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'competitor_cache')
        .eq('table_schema', 'public');
      columns = result.data;
      columnsError = result.error;
    } catch (err) {
      columnsError = err;
    }

    if (columnsError) {
      console.log('⚠️ Could not fetch table structure:', columnsError.message);
    } else if (columns) {
      console.log('Table columns:', columns.length > 0 ? 'Found' : 'None');
      if (columns.length > 0) {
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      }
    }

    // 2. Check existing cache entries
    console.log('\n2️⃣ Checking existing cache entries...');
    const { data: cacheEntries, error: cacheError } = await supabase
      .from('competitor_cache')
      .select('user_id, user_domain, competitor_domain, created_at, updated_at, expires_at, analysis_status')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (cacheError) {
      console.error('❌ Error fetching cache entries:', cacheError.message);
      console.error('Full error:', cacheError);
    } else {
      console.log(`Found ${cacheEntries?.length || 0} cache entries:`);
      if (cacheEntries && cacheEntries.length > 0) {
        cacheEntries.forEach((entry, idx) => {
          const isExpired = new Date(entry.expires_at) < new Date();
          console.log(`  ${idx + 1}. ${entry.user_domain} vs ${entry.competitor_domain}`);
          console.log(`     User ID: ${entry.user_id}`);
          console.log(`     Status: ${entry.analysis_status}`);
          console.log(`     Created: ${entry.created_at}`);
          console.log(`     Expires: ${entry.expires_at} ${isExpired ? '(EXPIRED)' : '(ACTIVE)'}`);
          console.log('');
        });
      } else {
        console.log('  No cache entries found');
      }
    }

    // 3. Check users_table to see if user IDs match
    console.log('\n3️⃣ Checking users_table...');
    const { data: users, error: usersError } = await supabase
      .from('users_table')
      .select('id, email')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`Found ${users?.length || 0} users in users_table:`);
      if (users && users.length > 0) {
        users.forEach((user, idx) => {
          console.log(`  ${idx + 1}. ID: ${user.id} (${typeof user.id}) - Email: ${user.email}`);
        });
      }
    }

    // 4. Check for foreign key constraints
    console.log('\n4️⃣ Checking foreign key constraints...');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'competitor_cache')
      .eq('table_schema', 'public');

    if (constraintsError) {
      console.log('⚠️ Could not fetch constraints:', constraintsError.message);
    } else if (constraints) {
      console.log('Table constraints:');
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

    console.log('\n✅ Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugCompetitorCache();