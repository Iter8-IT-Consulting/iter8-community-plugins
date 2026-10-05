"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: String(formData.get("password") ?? "") });
  if (error) redirect(`/reset-password?message=${encodeURIComponent(error.message)}`);
  redirect(`/account?message=${encodeURIComponent("Your password has been changed.")}`);
}
