import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Runs before every page request: keeps the signed-in session fresh.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|apple-icon.png|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
