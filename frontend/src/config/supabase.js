/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION (FRONTEND)
 * ============================================================================
 * Frontend Supabase client for authentication and database operations
 * 
 * Environment Variables Required (in .env file):
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Public anon key for client-side operations
 * 
 * Features:
 * - Automatic session persistence in localStorage
 * - Auto-refresh of authentication tokens
 * - Client-side Row Level Security (RLS) enforcement
 * 
 * Usage:
 * import { supabase } from './config/supabase';
 * const { data } = await supabase.from('table').select('*');
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables (Vite automatically loads from .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for configuration validation
console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey?.length);

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not configured!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  throw new Error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
}

/**
 * Supabase client instance
 * Configured with persistent sessions and auto token refresh
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Keep user logged in across page reloads
    autoRefreshToken: true,    // Automatically refresh expired tokens
  }
});

console.log('✅ Supabase client initialized');
