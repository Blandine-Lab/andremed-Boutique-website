// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mobgoxdfmhkmqpiwyhhj.supabase.co';
const supabaseAnonKey = 'sb_publishable_GcGYY4d9w-uPgavGF4mdYQ_T-IwO88o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);