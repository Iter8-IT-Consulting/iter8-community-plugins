"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Only same-site paths, so a crafted link can't send people elsewhere.
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function back(message: string, next: string): never {
  redirect(`/sign-in?message=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
}

export async function signIn(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) back("That email and password don't match an account.", next);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    options: { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  if (error) back(error.message, next);
  // With email confirmation off, the account is ready and signed in.
  if (data.session) redirect(next);
  back("Check your email for a link to finish creating your account.", next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
