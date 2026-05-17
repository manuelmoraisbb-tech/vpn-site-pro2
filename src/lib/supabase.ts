import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[v0] Missing Supabase env vars. The app is running in offline/preview mode. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable backend features.'
  );
}

// Use placeholder values when env vars are missing so createClient does not throw
// at module load. Any network call will fail gracefully and be handled by the UI.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

export const STORAGE_BUCKET = 'vpn-files';
