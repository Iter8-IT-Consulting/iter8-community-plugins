import { signIn, signUp } from "./actions";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : null;
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <h1 className="font-headline text-3xl font-bold text-brand-ink">Sign in</h1>
      {message && (
        <p role="status" className="rounded border border-brand/30 bg-white p-3 text-sm text-brand-ink">
          {message}
        </p>
      )}
      <form className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
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
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="rounded border border-brand-muted/40 bg-white px-3 py-2"
          />
        </label>
        <button formAction={signIn} className="rounded bg-brand px-4 py-2 font-semibold text-white">
          Sign in
        </button>
        <button formAction={signUp} className="rounded border border-brand px-4 py-2 font-semibold text-brand">
          Create an account
        </button>
      </form>
    </main>
  );
}
