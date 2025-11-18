/**
 * Direct Supabase test to check oauth_tokens table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Testing Supabase Connection\n');
console.log('='.repeat(70));
console.log('\nSupabase URL:', SUPABASE_URL);
console.log('Service Key:', SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testDatab