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
> sign up and sign in with an email and password, and sign out. For the
> first version, new accounts work straight away, with no "confirm your
> email" step. Emails from the app come later, once it has its own look.

## 1. Copy the templates

Copy these into the project, at the same paths:

| Template | What it is |
|---|---|
| `src/proxy.ts` | Runs before each page and keeps the session fresh. (Next.js 16 calls this *proxy*; older versions called it middleware.) |
| `src/lib/supabase/proxy.ts` | The session refresh itself (`updateSession`). |
| `src/lib/auth.ts` | `currentUser()` (who's signed in, or null) and `requireUser(returnTo)` (for signed-in-only pages). |
| `src/app/sign-in/page.tsx`, `actions.ts` | The sign-in page: sign in, create an account. Server actions for sign in, sign up and sign out. |
| `src/app/auth/confirm/route.ts` | Where links in Supabase's emails land (confirm sign-up, reset password, change email). |
| `src/components/SignOutButton.tsx` | A sign-out button to put wherever it fits (a header, the account page). |
| `src/app/account/page.tsx` | An example signed-in-only page. The story may replace it. |
| `e2e/auth.spec.ts` | Sign up, sign out, wrong password, sign in. Tagged `@writes`. |

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
- `[auth]` `additional_redirect_urls`: add `"http://localhost:3000/**"`.
- `[auth.email]` `enable_confirmations = false` (the default locally).

Restart the local database (`npm run db:stop`, `npm run db:start`) so the
settings apply. Sign-up emails, if any, are caught by the local mail
viewer (Mailpit) at the `mail` address `supabase-ports.mjs` printed.

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
  `auth.uid()` policies. Email confirmation is off for now."
- The PR description says, in plain words, that people can now create
  accounts, and that the first release with sign-in also sets the live
  site's sign-in settings (Ship It).

## Production (Ship It)

The live project needs its own sign-in settings: its **site address** and
**allowed redirect addresses** must be the live site (otherwise email
links point at `localhost`), and email confirmation is **off** to match.
`supabase-prod.md` step 6 sets them with `supabase-prod.mjs auth-config`.
