# Add a local database (Supabase in Docker)

Build It follows this **once**, on the branch of the first story that
needs stored data or sign-in. It lands in that story's PR, not as a
separate change. Afterwards `journey.json` `supabase.local` is `true`.

Nothing here touches the cloud. The production database comes later, in
Ship It (`supabase-prod.md`).

`<plugin>` is the iter8-it plugin folder. Templates are in
`<plugin>/shared/templates/supabase/`.

## Tell the user first

> This story needs to save data, so I'm adding a database to your
> computer. It runs inside **Docker Desktop** (a free app that runs other
> software in a sandbox). The first start downloads about 2 GB and takes
> 5-10 minutes; after that it starts in about a minute. Nothing online
> changes yet.

## 1. Docker

```bash
docker info --format "{{.ServerVersion}}"
```

- Works: go on.
- "Cannot connect" / "failed to connect to the docker API": Docker
  Desktop is installed but not running. Ask the user to start it (or start
  it: Windows `Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"`,
  macOS `open -a Docker`) and check again; it takes a minute.
- "command not found": Docker Desktop isn't installed. Give the link
  (https://www.docker.com/products/docker-desktop/) and wait. It needs a
  restart on Windows. Stop here until it works.

## 2. Install and set up

```bash
npm install -D supabase
npm install @supabase/supabase-js @supabase/ssr
npx supabase init
node <plugin>/shared/scripts/supabase-ports.mjs
```

- **Close stdin for Supabase CLI commands** when running them from a
  tool: `npx supabase migration new` reads SQL from piped input and waits
  forever if stdin is open. In bash, add `< /dev/null`.
- `supabase-ports.mjs` gives this project its own block of ten ports.
  Every project's local Supabase uses 54320-54329 by default, so a second
  one on the same machine fails with "port is already allocated". It also
  names the local project after the slug and turns off the logs dashboard
  (the heaviest container, not needed). It prints the addresses; Studio
  (the database browser) is the one to mention to the user.

Add to `package.json` `scripts`:

```json
"db:start": "supabase start",
"db:stop": "supabase stop",
"db:reset": "supabase db reset",
"db:types": "supabase gen types typescript --local > src/lib/supabase/database.types.ts"
```

## 3. Start it

Say: "Starting the database. The first time downloads it, so this takes
5-10 minutes."

```bash
npx supabase start < /dev/null
```

If it fails with "port is already allocated", run
`supabase-ports.mjs` again and retry.

## 4. Connect the app

Copy the templates into the project (same paths):

| Template | What it is |
|---|---|
| `src/lib/supabase/env.ts` | Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, with a clear error if they're missing. |
| `src/lib/supabase/client.ts` | Supabase for Client Components (the browser). |
| `src/lib/supabase/server.ts` | Supabase for Server Components, Route Handlers and Server Actions. A new client per request. |
| `.env.example` | The variable names, no values. |
| `.github/workflows/ci.yml` | Replaces Claim It's CI: the e2e job starts Supabase from the migrations and checks the generated types are current. |

Then:

```bash
node <plugin>/shared/scripts/supabase-env.mjs   # writes .env.local (gitignored)
npm run db:types                                # src/lib/supabase/database.types.ts
```

The variable names are the ones the Supabase <-> Vercel integration sets
in production, so the same code runs in both places.

## 5. How the app uses the database

Write these into `CLAUDE.md` (new **Database** section) so every later
story follows them:

```markdown
## Database

Supabase (Postgres + Auth). Local development runs in Docker; production
is one Supabase project, changed only by the migrate Action on `main`.

- **Start / stop:** `npm run db:start` / `npm run db:stop`. Studio (browse
  the data): <studio url>. After starting on a new machine, write `.env.local` with iter8-it's
  `supabase-env.mjs` script (Build It runs it), or copy the values from
  `npx supabase status`.
- **Schema changes are migrations** in `supabase/migrations/`, never edits
  in Studio: `npx supabase migration new <name>` (then write the SQL), or
  make the change locally and `npx supabase db diff -f <name>`. Check with
  `npm run db:reset`, then `npm run db:types` and commit the types.
- **Add before you remove.** A release briefly runs the old code against
  the new schema. Never drop or rename something the live code uses; do
  it in a later release, after the code stops using it.
- **Every table gets Row Level Security** (`enable row level security`)
  and explicit policies in the same migration. No policy = nobody can
  read it through the app.
- **Data access goes through `src/repositories/`**: one file per table
  or area, functions that take a Supabase client
  (`listNotes(db)`), typed with `Database` from
  `src/lib/supabase/database.types.ts`. Components and pages call
  repositories, never `.from(...)` directly.
- **Browser vs server:** `@/lib/supabase/client` in Client Components,
  `@/lib/supabase/server` everywhere on the server. `SUPABASE_SECRET_KEY`
  bypasses RLS: server-only, and only when a story truly needs it.
- **Sample data** for local development and tests goes in
  `supabase/seed.sql` (applied by `db reset` and in CI).
```

## 6. Sign-in (only when the story needs it)

If this story (or a later one) has people sign in, it also needs Next.js's
**proxy** (`src/proxy.ts`, what older Next.js called middleware) to keep
sessions fresh. Follow Supabase's current Next.js server-side auth guide,
and the proxy docs that ship with Next.js
(`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`).
Local sign-up emails are caught by Mailpit (the `mail` address from
`supabase-ports.mjs`); nothing is really sent.

## 7. Check, and record it

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

End-to-end tests that need data use `supabase/seed.sql` and run against
the local database.

- `journey.json`: `supabase.local` = `true`.
- The story's PR description mentions, in plain words, that it adds the
  local database, and that the first release with it will set up the
  production database (Ship It).
