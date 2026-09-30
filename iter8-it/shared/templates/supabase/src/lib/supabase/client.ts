import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

// Supabase from the browser (Client Components). Queries run as the
// signed-in person, so Row Level Security decides what they can see.
export function createClient() {
  const { url, publishableKey } = supabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
