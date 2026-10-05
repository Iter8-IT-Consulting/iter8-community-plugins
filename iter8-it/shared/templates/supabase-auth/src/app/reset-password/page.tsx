import { requireUser } from "@/lib/auth";
import { updatePassword } from "./actions";

export const metadata = { title: "Choose a new password" };

// Reached from the link in a password-reset email (via /auth/confirm, which
// signs them in first), or by a signed-in person changing their password.
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  await requireUser("/reset-password");
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : null;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <h1 className="font-headline text-3xl font-bold text-brand-ink">Choose a new password</h1>
      {message && (
        <p role="status" className="rounded border border-brand/30 bg-white p-3 text-sm text-brand-ink">
          {message}
        </p>
      )}
      <form action={updatePassword} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded border border-brand-muted/40 bg-white px-3 py-2"
          />
        </label>
        <button className="rounded bg-brand px-4 py-2 font-semibold text-white">Save new password</button>
      </form>
    </main>
  );
}
