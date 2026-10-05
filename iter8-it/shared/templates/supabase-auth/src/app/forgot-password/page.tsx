import { requestPasswordReset } from "./actions";

export const metadata = { title: "Forgot your password?" };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : null;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <h1 className="font-headline text-3xl font-bold text-brand-ink">Forgot your password?</h1>
      <p className="text-brand-muted">Enter your email and we&apos;ll send you a link to choose a new one.</p>
      {message && (
        <p role="status" className="rounded border border-brand/30 bg-white p-3 text-sm text-brand-ink">
          {message}
        </p>
      )}
      <form action={requestPasswordReset} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-brand-muted/40 bg-white px-3 py-2"
          />
        </label>
        <button className="rounded bg-brand px-4 py-2 font-semibold text-white">Send me a link</button>
      </form>
      <a href="/sign-in" className="text-sm text-brand underline underline-offset-4">
        Back to sign in
      </a>
    </main>
  );
}
