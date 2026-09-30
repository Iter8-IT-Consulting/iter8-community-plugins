// Where the app finds Supabase. Locally these come from `.env.local`
// (written from `npx supabase status`); in production the Supabase <-> Vercel
// integration sets them.
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase isn't configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set. " +
        "Locally, start Supabase (npx supabase start) and write .env.local (see CLAUDE.md).",
    );
  }
  return { url, publishableKey };
}
