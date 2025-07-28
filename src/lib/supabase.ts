import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials
const hasValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://')

// Create the appropriate client
const supabase: SupabaseClient = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      console.warn('⚠️ Supabase credentials not properly configured. Using mock client.')
      // Create a mock client that won't throw errors
      return {
        auth: {
          signInWithOtp: async () => ({ error: null }),
          getUser: async () => ({ data: { user: { id: 'mock-user-id' } } }),
          getSession: async () => ({ data: { session: { access_token: 'mock-token' } } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null })
        }
      } as unknown as SupabaseClient
    })()

export { supabase }