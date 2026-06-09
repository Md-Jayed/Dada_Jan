import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://osfqxtmyqzsxqzfvivso.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_WJJqPUkWY70sRIjvI2B6qA_FL7quKQB";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
