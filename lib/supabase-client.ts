import { createClient } from "@supabase/supabase-js";

// Grab the environment variables securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Export the client for our authentication pages to use
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);