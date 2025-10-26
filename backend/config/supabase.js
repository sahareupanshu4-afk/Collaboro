/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION (BACKEND)
 * ============================================================================
 * Backend Supabase client for server-side database operations
 * 
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_ANON_KEY: Public anon key for authentication
 * 
 * Usage:
 * const supabase = require('./config/supabase');
 * const { data } = await supabase.from('table').select('*');
 * ============================================================================
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
}

// Create and export Supabase client instance
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
