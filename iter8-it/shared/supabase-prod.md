# Add the production database (Supabase cloud)

Ship It follows this **once**, on the first release that needs a database
(`journey.json` `supabase.local` is `true`, or the release has files in
`supabase/migrations/`) while `supabase.projectRef` is `null`. It runs
**before** the release PR, so the release's migrations have somewhere to
go.

One cloud project, for production only. No Supabase Branching, no
Supabase <-> GitHub integration, no dev database in the cloud (local
Docker covers that; see `environments.md`).

`<plugin>` is the iter8-it plugin folder. Helpers:
`<plugin>/shared/scripts/supabase-prod.mjs`. Run everything from the
project folder, with stdin closed for `npx supabase` commands
(`< /dev/null` in bash).

## Tell the user first

> This release is the first that saves data, so it needs a database on
> the internet too. I'll create a Supabase project called **<slug>**, on
> the **free** plan, connect it to your live site, and set things up so
> database changes are applied automatically when a release goes live.
> It takes about 5 minutes.

## 1. The right Supabase account and organization

```bash
npx supabase orgs list -o json < /dev/null
```

- "Access token not provided" / unauthorized: `npx supabase login` (opens
  the browser). If it keeps showing an old account, the login is cached by
  the system: `npx supabase logout`, then login again.
- Show the organizations **with their IDs** (two orgs can share a name)
  and ask which one. Never guess.
- **Cost check.** Ask which plan that organization is on, and give the
  billing link: `https://supabase.com/dashboard/org/<org-id>/billing`.
  - **Free:** at most 2 active projects. If it already has 2, say so and
    stop: the user can pause or delete one, or choose another org.
  - **Paid (Pro or above):** every project adds compute cost (about $10 a
    month for the smallest), beyond the plan's included credit. Say the
    cost plainly and get a clear yes before creating anything.

## 2. Create the project

Pick the region: the one closest to where Vercel runs the app. Vercel's
default is Washington, D.C., so **`us-east-1`** unless the user's Vercel
project uses another region.

```bash
node <plugin>/shared/scripts/supabase-prod.mjs password
```

Tell the user: "This is the database's master password. Save it in your
password manager now. It's not stored anywhere in the project, and you
won't need it day to day." Wait until they say they've saved it. Keep it
in a shell variable only for the next steps; never write it to a file or
commit it.

```bash
npx supabase projects create <slug> --org-id <org-id> --region <region> --db-password "<password>" -o json < /dev/null
node <plugin>/shared/scripts/supabase-prod.mjs wait <project-ref>
```

Say: "Supabase is setting up the database. This takes 2-4 minutes."

## 3. Connect the live site

Put the production connection settings on Vercel (production only):

```bash
node <plugin>/shared/scripts/supabase-prod.mjs vercel-env <project-ref> <vercel.scope>
vercel env ls production --scope <vercel.scope>
```

The list must show `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. They take
effect on the next deploy, which is this release.

(This replaces the Supabase <-> Vercel dashboard integration: same
variables, set from the command line, so there's nothing for the user to
click.)

## 4. Let GitHub apply migrations

```bash
npx supabase link --project-ref <project-ref> < /dev/null
SUPABASE_DB_PASSWORD="<password>" node <plugin>/shared/scripts/supabase-prod.mjs github-secret <owner>/<repo>
```

`supabase link` records the connection details in `supabase/.temp/`
(gitignored); the helper turns them into the session-pooler connection
string with the password and stores it as the `SUPABASE_DB_URL` Actions
secret. The password is then no longer needed in this session.

Copy `<plugin>/shared/templates/supabase-prod/.github/workflows/migrate.yml`
into the project. Commit it to `dev` with the `journey.json` update below,
push, and prove the connection with a dry run (it lists the migrations it
would apply and changes nothing):

```bash
gh workflow run migrate.yml --ref dev -f dry_run=true
gh run list --workflow migrate.yml --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch <id> --exit-status
```

If it fails to connect, check the secret was set for the right repo and
that `supabase/.temp/pooler-url` used port 5432, then run the helper
again.

## 5. Sign-in settings (if the app has sign-in)

If the app has accounts (`src/lib/auth.ts` exists, or `needs.auth`), the
live project needs its own sign-in settings: the live site's address, so
links in Supabase's emails point there, not at `localhost`, plus
password length 8 and email confirmation off, to match local.

```bash
node <plugin>/shared/scripts/supabase-prod.mjs auth-config <project-ref> <vercel.url> --dry-run
node <plugin>/shared/scripts/supabase-prod.mjs auth-config <project-ref> <vercel.url>
```

The first shows what will change; the second changes only those settings
and checks they took. (It pushes a temporary config that declares just
these; the project's own `supabase/config.toml` points at `localhost` and
must never be pushed.)

**Run this again** on any later release that first adds sign-in, and
whenever the live address changes (a custom domain).

## 6. Record it

`journey.json`:

```json
"supabase": { "local": true, "org": "<org-id>", "projectRef": "<project-ref>", "region": "<region>" }
```

`CLAUDE.md` **Links**: add
`- Database: https://supabase.com/dashboard/project/<project-ref>`.

Commit ("Ship It: production database") and push to `dev`. Then carry on
with Ship It's release PR: when it merges, the migrate Action applies the
release's migrations to the new database.

## Never

- Change the production database by hand (dashboard SQL editor, `db push`
  from a laptop). Only the migrate Action changes it.
- Turn on Supabase Branching or the Supabase <-> GitHub integration.
- Commit the database password, the secret key, or `supabase/.temp/`.
