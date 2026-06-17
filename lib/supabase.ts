import { createClient } from "@supabase/supabase-js";

// We use the exclamation mark (!) to tell TypeScript that we guarantee 
// these variables exist in our .env.local file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This creates our connection client that we will use throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);