# Add sign-in (Supabase Auth)

Build It follows this **once**, on the branch of the first story where
people sign in. The local database must already be set up
(`supabase-local.md`); if it isn't, do that first, on the same branch.
Afterwards the app has email-and-password accounts, and `journey.json`
`needs.auth` is `true`.

`<plugin>` is the iter8-it plugin folder. Templates are in
`<plugin>/shared/templates/supabase-auth/`.

## Tell the user first

> This story is the first where people sign in, so I'm adding accounts:
> sign up and sign in with an email and password, sign out, and "forgot
> your password?". On your computer, new accounts work straight away and
> any emails land in a local inbox viewer. When it goes live, Ship It will
> ask whether you have an email sending service, since that decides
> whether real people get their emails.

## 1. Copy the templates

Copy these into the project, at the same paths:

| Template | What it is |
|---|---|
| `src/proxy.ts` | Runs before each page and keeps the session fresh. (Next.js 16 calls this *proxy*; older versions called it middleware.) |
| `src/lib/supabase/proxy.ts` | The session refresh itself (`updateSession`). |
| `src/lib/auth.ts` | `currentUser()` (who's signed in, or null) and `requireUser(returnTo)` (for signed-in-only pages). |
| `src/app/sign-in/page.tsx`, `actions.ts` | The sign-in page: sign in, create an account, and a "Forgot your password?" link. Server actions for sign in, sign up and sign out. |
| `src/app/forgot-password/page.tsx`, `actions.ts` | Enter your email to get a reset link. Says the same thing whether or not the account exists. |
| `src/app/reset-password/page.tsx`, `actions.ts` | Choose a new password: where the reset link lands (signed in by it), and "Change your password" for anyone signed in. |
| `src/app/auth/confirm/route.ts` | Where links in Supabase's emails land (confirm sign-up, reset password, change email). Accepts both link styles (`code` and `token_hash`), so Supabase's default emails work. |
| `src/components/SignOutButton.tsx` | A sign-out button to put wherever it fits (a header, the account page). |
| `src/app/account/page.tsx` | An example signed-in-only page. The story may replace it. |
| `e2e/auth.spec.ts` | Sign up, sign out, wrong password, sign in. Tagged `@writes`. |
| `e2e/password-reset.spec.ts` | Forgot password end to end: the reset email is read from the local mail viewer (`MAILPIT_URL`). Tagged `@writes`. |

Then shape them to the story. The sign-in page's wording, where people
land afterwards (`next`), and where the sign-out button lives are the
story's decisions. Keep the security parts as they are:

- Server code decides with `currentUser()` / `getClaims()`, **never**
  `getSession()` (a session read from cookies isn't verified).
- Nothing goes between `createServerClient` and `getClaims()` in
  `src/lib/supabase/proxy.ts`.
- `next` is only ever a same-site path (`safeNext`), so a crafted link
  can't send people to another site.

## 2. Local settings

In `supabase/config.toml`:

- `[auth]` `minimum_password_length = 8` (the sign-in form asks for 8).
- `[auth]` `additional_redirect_urls = ["http://localhost:*/**", "http://127.0.0.1:*/**"]`
  (any local port, so reset links work whichever port the app or the
  tests run on).
- `[auth.email]` `enable_confirmations = false` (the default locally;
  keep it off: confirming is a production decision, see Ship It).

Restart the local database (`npm run db:stop`, `npm run db:start`) so the
settings apply, and rerun `supabase-env.mjs` (it adds `MAILPIT_URL` to
`.env.local`). Emails (password resets) are caught by the local mail
viewer, Mailpit, at that address: nothing is really sent.

## 3. Data that belongs to a person

Tables with per-person data get a `user_id` column and policies that use
`auth.uid()`, in the story's migration:

```sql
create table public.decks (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);
alter table public.decks enable row level security;

create policy "People see their own decks" on public.decks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "People add their own decks" on public.decks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "People change their own decks" on public.decks
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "People delete their own decks" on public.decks
  for delete to authenticated using (user_id = (select auth.uid()));
```

(`(select auth.uid())` rather than `auth.uid()` lets Postgres work it out
once per query, not once per row.) Anything readable by people who aren't
signed in needs its own `to anon` policy, deliberately.

## 4. Leave a note for later: branded emails

Supabase sends sign-up, password-reset and change-email messages in its
own plain style. Making them look like the app is worth doing, but not
before the app has a settled look. Create a `later` Feature so it isn't
forgotten (skip if one exists):

```bash
gh issue create -R <owner>/<repo> --type "<workItems.feature>" --label later \
  --title "People get account emails that look like they come from <Name>" \
  --body "**For:** everyone with an account

Sign-up, password-reset and change-email messages currently come from Supabase in its default style. Make them look and sound like <Name>, and send them from the app's own address.

**Later because** the app's look should settle first. Sending from our own address also needs an email service (for example Resend) connected to Supabase; the built-in sender is only for testing.

(Created by Build It when sign-in was added.)"
```

Put it under the Epic that covers accounts, if there is one
(`--parent <epic>`).

## 5. Check and record

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`auth.spec.ts` must pass on both device projects.

- `journey.json`: `needs.auth` = `true` (and `needs.database` = `true`).
- `CLAUDE.md` **Database** section, add: "**Sign-in:** Supabase Auth, email
  and password. `currentUser()` / `requireUser()` in `src/lib/auth.ts`;
  never `getSession()` on the server. Per-person tables use `user_id` and
  `auth.uid()` policies. Forgot password: `/forgot-password` ->
  email -> `/auth/confirm` -> `/reset-password`. Locally, emails land in
  Mailpit (`MAILPIT_URL`); email confirmation is off locally, and on in
  production only if an email service is connected."
- The PR description says, in plain words, that people can now create
  accounts, and that the first release with sign-in also sets the live
  site's sign-in settings (Ship It).

## Adding Forgot password to an app that already has sign-in

Apps that added sign-in before this template had Forgot password
(iter8-it before 0.18): copy in `src/app/forgot-password/`,
`src/app/reset-password/`, the new `src/app/auth/confirm/route.ts`, and
`e2e/password-reset.spec.ts`; add the "Forgot your password?" link to the
sign-in page and a "Change your password" link where it fits; update the
local settings in step 2; add `MAILPIT_URL` to CI's "Point the app at it"
step (see the current `templates/supabase/.github/workflows/ci.yml`). Do
it as a story ("<Persona> can reset a forgotten password"). Then, on
release, Ship It runs the sign-in settings step again (email service
question included).

## Production (Ship It)

The live project needs its own sign-in settings: its **site address** and
**allowed redirect addresses** must be the live site (otherwise email
links point at `localhost`), and its **email**: with the user's own email
service connected, emails reach everyone and email confirmation is
**on**; without one, only the Supabase team gets emails (so nobody else
can reset a password) and confirmation stays **off**.
`supabase-prod.md` step 6 sets them with `supabase-prod.mjs auth-config`.
