import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mobgoxdfmhkmqpiwyhhj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GcGYY4d9w-uPgavGF4mdYQ_T-IwO88o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);