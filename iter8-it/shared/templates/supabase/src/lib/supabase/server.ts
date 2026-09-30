import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

// Supabase on the server (Server Components, Route Handlers, Server
// Actions). Create a new client for every request; never share one.
export async function createClient() {
  const { url, publishableKey } = supabaseEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't set cookies. Fine as
          // long as the proxy refreshes sessions (added with sign-in).
        }
      },
    },
  });
}
