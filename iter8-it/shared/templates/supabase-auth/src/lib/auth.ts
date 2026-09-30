import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string | null };

// Who is signed in, or null. Verifies the session (getClaims), so it's safe
// to use for decisions on the server. Never use getSession() for that.
export async function currentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
}

// For pages only signed-in people may see: sends everyone else to sign in,
// then back here.
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await currentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return user;
}
