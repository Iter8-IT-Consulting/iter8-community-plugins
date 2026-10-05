"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  // The link in the email lands on /auth/confirm, which signs them in and
  // sends them on to choose a new password.
  await supabase.auth.resetPasswordForEmail(String(formData.get("email") ?? ""), {
    redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/reset-password")}`,
  });
  // Same message whether or not the account exists, so the page can't be
  // used to find out who has one.
  redirect(
    `/forgot-password?message=${encodeURIComponent(
      "If there's an account for that email, a link to choose a new password is on its way. Check your inbox.",
    )}`,
  );
}
