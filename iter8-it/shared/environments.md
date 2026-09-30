# Environments and branching

The model Claim It sets up and Build It, Ship It and Fix It follow.

**One cloud database, local everything else.** Supabase's cloud project is
production only. Development runs against a local Supabase in Docker. There
is no Supabase Branching, no persistent cloud dev branch, and no Supabase
<-> GitHub integration.

```
feature/<issue>-<slug> ──PR──▶ dev ──release PR──▶ main
        │                       │                    │
        └── local Supabase (Docker) ─┘                ├─▶ Vercel production build
                                                     └─▶ GitHub Action: supabase db push
                                                          (prod Supabase project)
       \_________ Build It _________/  \______________ Ship It ______________/
```

| Branch | Code runs against | Deploys to |
|---|---|---|
| `feature/*` | Local Supabase (`supabase start`, Docker) | Nothing (local only) |
| `dev` | Local Supabase | Nothing (integration branch) |
| `main` | Production Supabase project (cloud, Free plan) | Vercel production + migration Action |

## Nothing before it's needed

- No database unless the project needs one (`needs.auth` or
  `needs.database` in `journey.json`). Build It sets up local Supabase when
  the first story needs it; Ship It creates the production project on the
  first release that needs it.
- `supabase/migrations/` starts empty. Domain tables arrive through user
  stories. The Supabase CLI tracks applied migrations itself, so there's no
  tracking table.
- Docker Desktop is only required once the app needs Supabase. Check it
  with `docker info`.

## Local Supabase

- `npx supabase start` runs the full stack (Postgres, Auth, Realtime,
  Studio) in Docker.
- `npx supabase db reset` rebuilds the local DB from `supabase/migrations/`
  (+ `supabase/seed.sql`).
- `.env.local` is written from `npx supabase status -o env`, so it always
  points at local.

## Migrations

- Files in `supabase/migrations/`, written with `supabase migration new` or
  generated with `supabase db diff -f <name>`.
- Tested locally with `db reset`. **Never applied to production by hand.**
- Keep them backward-compatible with the code currently in production
  ("expand, then contract": add before you remove). The Vercel build and
  the migrate Action run in parallel on a release, so new code can briefly
  meet the old schema. Ship It's preflight flags destructive migrations.

## Production migrations run from CI

`.github/workflows/migrate.yml` runs on push to `main` when
`supabase/migrations/**` changed (plus `workflow_dispatch`):
`supabase/setup-cli`, then `supabase db push --db-url "$SUPABASE_DB_URL"`.

- `SUPABASE_DB_URL` is a single GitHub Actions secret: the production
  **session pooler** connection string (IPv4; GitHub runners can't reach
  the IPv6-only direct host), with the password percent-encoded. Using
  `--db-url` means CI needs no Supabase access token.
- Only this Action touches the production schema.

## Vercel

- **Builds `main` only.** Feature and dev branches point at a local
  database, so previews would have no DB. `vercel.json`:
  `{ "git": { "deploymentEnabled": { "main": true, "*": false } } }`
  (verify the current syntax when building).
- Production env vars reach Vercel through the Supabase <-> Vercel
  integration (Production environment). This is the only Supabase
  integration used.

## CI

`ci.yml` runs on PRs into `dev` and `main` (and pushes to both): lint,
`npm run typecheck` (`next typegen && tsc --noEmit`), Vitest, Playwright.
Once the app has a database, the e2e job runs `supabase start` in the
runner, so tests hit a real local stack built from the migrations. That
also proves every migration applies cleanly from scratch before it reaches
`main`.
