import { createClient } from '@supabase/supabase-js';

// Uses the PUBLIC anon key only — safe to expose in frontend code.
// Row Level Security policies on the DB protect the actual data.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
