import { SignOutButton } from "@/components/SignOutButton";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Your account" };

// An example of a signed-in-only page. Replace or remove it when a story
// gives people a real place to land after signing in.
export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await requireUser("/account");
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : null;
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6 py-12">
      <h1 className="font-headline text-3xl font-bold text-brand-ink">Your account</h1>
      {message && (
        <p role="status" className="rounded border border-brand/30 bg-white p-3 text-sm text-brand-ink">
          {message}
        </p>
      )}
      <p className="text-brand-muted">Signed in as {user.email}</p>
      <a href="/reset-password" className="text-sm text-brand underline underline-offset-4">
        Change your password
      </a>
      <SignOutButton />
    </main>
  );
}
