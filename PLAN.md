# Plan: the "It" app-building plugin

A Claude Code plugin that walks someone from "I have a problem" to "my app is
live and improving", one named step at a time. Each step is a skill:

| # | Step | One-liner |
|---|------|-----------|
| 1 | **Spot It** | Find a real problem in your life or work that a simple app could fix. |
| 2 | **Name It** | Give your project a name. It forces you to decide what it's really for. |
| 3 | **Claim It** *(working name)* | Claim your name on the internet: a real project and a live page, so it's real from the start. |
| 4 | **Meet It** | Get to know the people who will use it: what they're trying to get done and what frustrates them today. |
| 5 | **Dream It** | Get every feature idea out of your head and onto the table, big or small. |
| 6 | **Trim It** | Cut the list down to the smallest version someone would actually use. |
| 7 | **Build It** | Add the features one small piece at a time, checking each one as you go. |
| 8 | **Ship It** | Put what you've built live for real users, and check it works there. |
| 9 | **Fix It** | Things will break. Find out why, fix it, and put the fix live. |
| 10 | **Grow It** | Keep improving your app with what you learn from real use. |

**Build It -> Ship It is a loop, not a one-time step.** Build It moves work
from feature branches into `dev`. Ship It promotes `dev` to production. You
go around it for every release, and Fix It and Grow It feed back into it.

**The one-time "hello world" moment is Claim It**, right after Name It. It
creates the repo, the board, CI, the Vercel project, and a live starter
page. After that, everything else (the backlog, the code, the database)
builds on real infrastructure.

This plugin stands on its own. It is **not** a replacement for
`iter8-rails-plugins` (`iter8-dev-workflows` / `iter8-po-workflows`), which
continue separately. That repo (`C:\Source\iter8-rails-plugins`) is a useful
reference for structure and for proven details, called out below where
relevant, but nothing here depends on it.

The first real test of the finished plugin is rebuilding **SlideIt** from
scratch (see [Acceptance test](#7-acceptance-test-slideit)).

---

## 1. Principles

These apply to every skill and should be stated in the plugin README.

- **Journey, not roles.** Skills are organized by where the project is, not
  by who is using them. A solo builder runs all of them.
- **Plain language.** The steps are written for builders who may not be
  professional developers. Skills explain what they're doing and why in
  everyday words, and ask one clear question at a time.
- **Real from the start.** After Claim It there is a live URL, and every
  later step keeps it working.
- **Nothing before it's needed.** Infrastructure is provisioned only when
  something has shown it's needed:
  - No database unless the project needs one. The deciding factor is
    usually **auth**: if users sign in, the app uses Supabase (Auth + DB).
    Trim It records the need. **Build It** sets up the local Supabase
    when the first story needs it, and **Ship It** creates the production
    project on the first release that needs it.
  - **No app tables at setup.** `supabase/migrations/` starts empty. The
    Supabase CLI tracks applied migrations itself (in the database's
    `supabase_migrations` schema), so no tracking table is needed either.
    Domain tables arrive through user stories in Build It.
- **Mostly free.** Default to free tiers: GitHub, Vercel Hobby/Team, and the
  Supabase Free plan. Anything paid is offered, never assumed, and its cost
  is stated up front.
- **One cloud database, local everything else** (see
  [Environments and branching](#2a-environments-and-branching)).
  Supabase's cloud project is **production only**. Development runs against
  a **local Supabase in Docker**. There is no Supabase Branching, no
  persistent cloud dev branch, and no Supabase <-> GitHub integration.
- **Personas drive everything.** Features and stories are always deliverables
  to a named persona, never infrastructure-for-its-own-sake.
- **Epic / Feature / Story hierarchy** on a **Kanban** board
  (Backlog / Todo / In Progress / In Review / Done). No sprints.
- **Small, iterative, live.** Work isn't done when it's merged. It's done
  when Ship It has put it in production and checked it there.
- **Each step is runnable on its own** and also offers to flow straight into
  the next step. Spot / Name / Claim often happen in one sitting, as do
  Meet / Dream / Trim.
- **Every step checks the previous ones.** Running a step whose inputs are
  missing says what's missing and offers to run the earlier step. It never
  silently guesses.

---

## 2. Shared project state

Steps hand information to each other through two files at the project root
plus GitHub Issues. Both files are committed.

### `PRODUCT.md` (human-readable, the product's source of truth)

```markdown
# <Display Name>

<one-line purpose>            <- Name It

## Problem                    <- Spot It
Who has it, what happens today, why it matters, how we'll know it's solved.

## People                     <- Meet It
### <Persona name>
- Trying to get done: ...
- Frustrations today: ...
- Context: device, setting, skill level (e.g. "on a phone, in an audience")

## First Version              <- Trim It
The goal of the first version in a paragraph, what's explicitly out (for
now), and what the app needs (sign-in? stored data?). The feature list
itself lives on the board.
```

### `journey.json` (machine-readable, what skills read and write)

```json
{
  "stage": "build-it",
  "name": "SlideIt",
  "slug": "slideit",
  "purpose": "Markdown slides delivered live to your audience's phones.",
  "needs": {
    "auth": true,
    "database": true,
    "decidedIn": "trim-it"
  },
  "github": { "owner": "Iter8-IT-Consulting", "repo": "slideit", "project": 3 },
  "vercel": { "scope": "iter8-community", "project": "slideit", "url": "https://slideit.vercel.app" },
  "supabase": {
    "local": true,
    "org": "<org-id>",
    "projectRef": null,
    "region": "us-east-1"
  },
  "lastRelease": { "tag": null, "at": null }
}
```

- `stage` is the furthest step completed. It is a hint for "what's next",
  not a lock: any step can be rerun.
- Fields are `null` until the step that owns them runs.
- Keep a short schema doc in `shared/journey-schema.md`. Treat it as the
  contract between skills; change it deliberately.

### Work items: GitHub Issues from Dream It onward

Because Claim It creates the repo and board **before** Meet / Dream / Trim,
ideas go straight into GitHub Issues. There is no local idea list to import
later. Dream It creates Epics and Features (unprioritized). Trim It puts
first-version Features on the board in order and labels the rest `later`.
Build It splits a Feature into Stories when it picks it up.

### Before Claim It

Spot It and Name It are **local only**: a folder, `git init`, `PRODUCT.md`
and `journey.json`. Someone can stop there with nothing to tear down.

### Everything else

- `CLAUDE.md`, written by Claim It and extended by later steps: stack,
  conventions, environments, and pointers to `PRODUCT.md` / `journey.json`.
  It should not duplicate the product content.
- `USER.md` (gitignored) holds per-developer identity if a skill needs it.

---

## 2a. Environments and branching

This is the model that Claim It sets up and that Build It, Ship It and Fix
It follow.

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

- **Local Supabase.** `npx supabase start` runs the full stack (Postgres,
  Auth, Realtime, Studio) in Docker. `npx supabase db reset` rebuilds the
  local DB from `supabase/migrations/` (+ `supabase/seed.sql`). `.env.local`
  is written from `npx supabase status -o env`, so it always points at local.
- **Migrations.** Written as files in `supabase/migrations/`, either by hand
  (`supabase migration new`) or generated from local changes with
  `supabase db diff -f <name>`. Docker makes `db diff` available. They're
  tested locally with `db reset` and are never applied to production by
  hand.
- **Production migrations run from CI.** `.github/workflows/migrate.yml` runs
  on push to `main` when `supabase/migrations/**` changed (plus
  `workflow_dispatch`): `supabase/setup-cli`, then
  `supabase db push --db-url "$SUPABASE_DB_URL"`.
  - `SUPABASE_DB_URL` is a single GitHub Actions secret: the production
    **session pooler** connection string (IPv4; GitHub runners can't
    reach the IPv6-only direct host), with the password percent-encoded.
    Using `--db-url` means no Supabase access token is needed in CI.
  - Only the migration Action touches the production schema.
- **Vercel builds `main` only.** Production deploys come from merges to
  `main` via the Vercel GitHub connection. Feature/dev branches point at a
  local database, so preview deployments would have no DB. Claim It turns
  off deployments for other branches in `vercel.json`:
  `{ "git": { "deploymentEnabled": { "main": true, "**": false } } }`.
  Vercel matches branches with minimatch, where `*` doesn't cross a `/`,
  so `"*"` would still deploy `feature/...` branches; `"**"` covers them.
  A branch matching several rules deploys if any is `true`, so `main`
  still deploys.
- **Production env vars** reach Vercel through the Supabase <-> Vercel
  integration (Production environment). This is the only Supabase
  integration used.
- **Default branch.** `dev` is where day-to-day PRs target. Claim It creates
  `dev` from `main` as its last step (after the site is live, so Vercel
  connects while `main` is still the default and picks it as the
  production branch) and sets it as the GitHub default branch.
  `main` is only updated by Ship It's release PRs and Fix It's hotfixes.
- **CI** (`ci.yml`) runs on PRs into `dev` and `main`: lint, typecheck,
  Vitest, Playwright. Once the app has a database, the e2e job runs
  `supabase start` in the runner (`supabase/setup-cli`), so tests hit a
  real local stack built from the migrations. This also proves every
  migration applies cleanly from scratch before it reaches `main`.
- **Machine prerequisite:** Docker Desktop, checked with `docker info`, but
  only once the app needs Supabase. Apps without a database never need
  Docker.

---

## 3. The skills

Each skill lives in `skills/<step>/SKILL.md`. **Every `SKILL.md` must start
with YAML frontmatter** (`name`, `description`). Claude Code uses it to
discover the skill. The existing iter8-rails skills lack it, which is likely
why `init-project` wasn't listed as an available skill. The `description`
should include the step's one-liner and natural trigger phrases.

Shared procedures used by more than one skill live in `shared/` (see
[Repository layout](#4-repository-layout)). In particular,
`shared/supabase-local.md` (used by Build It) and `shared/supabase-prod.md`
(used by Ship It) mean "add a database" is written once.

For each skill below: purpose, inputs, what it does, outputs, and done-when.

### 3.1 Spot It (`spot-it`)
- **Purpose:** turn a vague itch into a clear, specific problem statement.
- **Inputs:** none. This is the entry point. It works in an empty folder.
- **Does:** asks who has the problem, what they do today, what goes wrong,
  and how often. Pushes back gently on solution-first answers ("an app that
  does X") to get at the underlying problem. Asks whether a simple app is
  the right fix at all.
- **Outputs:** `git init` if needed; `PRODUCT.md` with the Problem section;
  `journey.json` with `stage: "spot-it"`.
- **Done when:** the problem fits in a few sentences the user agrees with,
  including how they'd know it's solved.

### 3.2 Name It (`name-it`)
- **Purpose:** a name that clarifies what the app is for.
- **Inputs:** Problem.
- **Does:** proposes a few names tied to the problem; settles the display
  name, a **lowercase slug** (used for the repo, the Vercel project and
  the Supabase project), and a one-line purpose. Checks that the slug is
  free on GitHub under the intended owner and as a Vercel project (Claim
  It rechecks).
- **Outputs:** `PRODUCT.md` title and purpose line; `journey.json` name,
  slug and purpose.
- **Done when:** the name, slug and purpose line are agreed.

### 3.3 Claim It (`claim-it`) *(working name)*
The one-time setup, reshaped from `init-project`. It carries most of the
hard-won detail (see [Appendix A](#appendix-a-lessons-from-the-first-slideit-run)).
**No database here.** That comes later, only if needed.

- **Purpose:** the name becomes a real project with a live page and the
  full pipeline in place, so everything after builds on something real.
- **Inputs:** name, slug, purpose.
- **Preconditions (check all before creating anything):**
  - Signed in, **as the right accounts**: `gh auth status` (note the
    active account if there are several) and `vercel whoami`. Show which
    account each is using and have the user confirm. Offer re-login if one
    is stale.
  - Commit identity: confirm the name and email for this repo and set them
    **repo-local** (`git config user.name/user.email`).
  - The destination GitHub owner is confirmed. Org -> native Issue Types;
    personal account -> labels (`epic`, `feature`, `story`, `bug`).
  - The slug is free in GitHub and Vercel. If one is taken: ask to reuse
    or rename. Never overwrite.
- **Steps:**
  1. **Scaffold** Next.js (TypeScript, App Router, Tailwind, `src/`, ESLint,
     npm) into the current folder. Keep `PRODUCT.md`, `journey.json` and
     `.git`.
  2. **Starter page + branding.** Hello World showing the app name and
     purpose, with the optional Iter8 Community branding kit (favicon,
     palette, Open Sans, footer credit). Branding lives in a few obvious
     files so it's easy to remove; `CLAUDE.md` explains how.
  3. **Tests:** Vitest (unit, happy-dom: ~1s warm vs ~2.3s for jsdom) and Playwright (e2e), each with one
     passing test. Playwright starts with `desktop` + `mobile` projects;
     Meet It may adjust them later to the personas' devices.
  4. **Repo hygiene:** `.gitignore` (including `.env*` except
     `.env.example`, `.vercel/`, `supabase/.temp/`, Playwright output,
     `USER.md`), `.gitattributes` (LF), `.editorconfig`.
  5. **`CLAUDE.md`** and `README.md`. `npm run build`, `npm test` and
     `npm run test:e2e` all pass locally. Commit.
  6. **GitHub:** `gh repo create <owner>/<slug> --private --source=. --push`
     (pushes `main`); create and push `dev` from it and make `dev` the
     default branch (`gh repo edit --default-branch dev`); `gh project
     create`; reconcile Status to Todo/In Progress/In Review/Done (read the
     options, send back the **full** list plus additions via
     `updateProjectV2Field`); `gh project link` to the repo. Verify Issue
     Types exist (org) or create the labels (personal).
  7. **CI:** `.github/workflows/ci.yml` on PRs into `dev` and `main` (and
     pushes to both): lint, `npm run typecheck`
     (**`next typegen && tsc --noEmit`**), Vitest, Playwright. Push and
     watch the first run until it's green.
  8. **Vercel:** `vercel link --yes --project <slug> --scope <scope>`,
     commit `vercel.json` limiting deployments to `main`, then confirm the
     Vercel GitHub App can see the repo **before** `vercel git connect`. If
     it can't, give the exact GitHub settings link and wait for the user.
     Verify it's connected and the production branch is `main`.
  9. **Go live:** get the first production deploy of `main`; open the URL
     and check the page renders (Playwright against the live URL is
     ideal). Record the URL in `journey.json` and `CLAUDE.md`.
- **Outputs:** live URL, repo with `main` + `dev` (default), an empty
  board, CI green, `journey.json` github/vercel filled, `stage: "claim-it"`.
- **Done when:** a stranger could open the URL on their phone and see it.

### 3.4 Meet It (`meet-it`)
- **Purpose:** know the users well enough to build for them.
- **Inputs:** Problem, name.
- **Does:** identifies 1-3 personas. For each: what they're trying to get
  done, what frustrates them today, and their context (device, setting,
  urgency). Device context decides mobile-first vs desktop-first per
  experience, and updates the Playwright device projects if needed.
- **Outputs:** the People section in `PRODUCT.md`; the personas in
  `CLAUDE.md`.
- **Done when:** each persona has goals, frustrations and context the user
  recognizes.

### 3.5 Dream It (`dream-it`)
- **Purpose:** get every idea out, without judging yet.
- **Inputs:** People; the repo from Claim It.
- **Does:** brainstorms features per persona, including the big and silly
  ones. Shows the grouped list for review first, then creates **Epic**
  Issues (big areas) and **Feature** Issues (things a persona can do),
  linked as sub-issues and tagged with the persona. They're **not** added
  to the board yet: this is the idea pile, not the plan. Rerunnable at any
  time to add ideas.
- **Reference:** `iter8-po-workflows/skills/plan-batch` (draft locally,
  review, then create the hierarchy in one batch).
- **Done when:** the user has nothing left to add for now.

### 3.6 Trim It (`trim-it`)
- **Purpose:** the smallest version someone would actually use.
- **Inputs:** the Feature Issues from Dream It.
- **Does:** walks the list and asks "would anyone use the first version
  without this?" First-version Features go on the board in Todo, **in
  order**. The rest get the `later` label, with the reason in a comment.
  Then it asks the **needs questions** explicitly and records the answers:
  - Do people sign in? -> `needs.auth`
  - Does the app store data that must survive a refresh or be shared
    between people? -> `needs.database`
  - `auth` implies Supabase. `database` without `auth` still means
    Supabase, but confirm it (some apps need neither).
  Nothing is provisioned here. Build It and Ship It act on the answers.
- **Reference:** `iter8-po-workflows/skills/reorder-backlog` for board
  ordering.
- **Outputs:** the First Version section in `PRODUCT.md`; an ordered
  board; `journey.json` `needs`.
- **Done when:** the first version fits on one screen and the needs are
  recorded.

### 3.7 Build It (`build-it`)
- **Purpose:** turn the next Feature into working, tested code on `dev`.
- **Inputs:** the board. Takes the top Todo item, or the one the user names.
- **Does:**
  1. If the item is a Feature without stories, drafts 1-5 stories. Each is
     a deliverable to a persona, with acceptance criteria. Confirm them
     with the user, then create them as sub-issues.
  2. **First story that needs data or auth?** Run
     `shared/supabase-local.md` once:
     - check Docker (`docker info`)
     - `npm i -D supabase`, `npx supabase init`
     - install `@supabase/supabase-js` + `@supabase/ssr`
     - `supabase start` (the first run pulls images, which takes a few
       minutes; say so)
     - write `.env.local` from `supabase status -o env` and add
       `.env.example`
     - switch CI's e2e job to start Supabase in the runner
     - set `supabase.local = true`

     It lands as part of that story's PR, not as a separate infra change.
  3. For one story: move it to In Progress, branch off `dev`
     (`feature/<issue>-<slug>`), implement it with tests (unit, plus e2e for
     user-facing flows on the relevant device projects), and self-review.
  4. **Schema changes:** a migration file in `supabase/migrations/`
     (`supabase migration new` or `supabase db diff -f <name>`), checked
     with `supabase db reset`. Keep migrations backward-compatible with
     the code currently in production (add before you remove); see Open
     question 2.
  5. Open a PR into `dev` (it references the Issue), move it to In Review,
     and wait for green CI.
  6. Merge into `dev` when the user approves (or per the configured review
     policy). The story **stays In Review** (merged, not yet live) until
     Ship It releases it.
  7. Offer: "Build the next story, or ship what's on `dev`?"
- **Reference:** `iter8-dev-workflows/skills/work-story` and `work-batch`
  (Rails also integrates through a dev branch).
- **Done when:** the story is merged to `dev` with green CI.

### 3.8 Ship It (`ship-it`)
- **Purpose:** promote what's on `dev` to production, and prove it works
  there. It runs every release, not once.
- **Inputs:** `dev` ahead of `main`, with green CI.
- **Does:**
  1. **Preflight:** summarize what's going out: stories merged since the
     last release, and any new migrations (listing them and flagging
     anything destructive, like drops or renames). Confirm with the user.
  2. **First release that needs a database?** (`needs.database` or
     `needs.auth`, a new migration, or Supabase env vars in use, with no
     production project yet.) Run `shared/supabase-prod.md` once:
     - Confirm the Supabase CLI account and org (`supabase orgs list`);
       offer logout/login if it's stale.
     - Generate a strong DB password. Tell the user to save it in their
       password manager; it's never committed and not needed locally.
     - `supabase projects create <slug>` on the **Free** plan, in the
       region closest to Vercel. Poll until `ACTIVE_HEALTHY`.
     - Pause for the one dashboard step: the **Supabase <-> Vercel
       integration** (Production env vars). Verify with `vercel env ls`.
     - `gh secret set SUPABASE_DB_URL` (session pooler URL, password
       percent-encoded), commit `.github/workflows/migrate.yml` to `dev`,
       and run it once via `workflow_dispatch` against the empty schema
       to prove the connection.
     - Do **not** connect the Supabase GitHub integration or enable
       Branching.
     - Record `supabase.projectRef`.
  3. **Release PR** `dev -> main` with a plain-language changelog. Wait for
     green CI, then merge (a merge commit, so `main`'s history shows
     releases).
  4. **Watch production:** the Vercel production deploy and, if migrations
     changed, the migrate Action. Both must succeed.
  5. **Smoke-check live:** open the production URL; run the e2e suite (or a
     tagged smoke subset) against it where it's safe to; check each
     released story's acceptance criteria briefly on the device it's for.
  6. **Close the loop:** move the released stories and Features to Done,
     close their Issues with a "live in <release>" comment, tag the release
     (`vYYYY.MM.DD-n` or semver; see Open question 7), and update
     `journey.json` `lastRelease`.
  7. **If something fails:**
     - A deploy fails before going live: nothing changed for users. Hand
       off to Fix It.
     - It's live but broken: offer Vercel's instant rollback
       (`vercel rollback`), then Fix It.
     - A migration failed: stop, show the log, and hand off to Fix It.
       Never hand-edit production.
- **Done when:** production runs the new release, it's been checked live,
  and the board shows it as Done.

### 3.9 Fix It (`fix-it`)
- **Purpose:** find why something broke, fix it, and put the fix live.
- **Inputs:** a bug report: the user's words, an Issue, an error message, or
  a failing CI run, deploy or migration.
- **Does:** creates or updates a **Bug** Issue; reproduces the problem
  (locally against the Docker stack, or on production; checks Vercel logs,
  CI logs and migrate Action logs); finds the root cause before changing
  code; writes a **failing test that captures the bug**; fixes it. Explains
  the cause in plain language on the Issue. Then it asks which path to take:
  - **Normal:** feature branch -> `dev` (Build It's steps 3-6), then Ship It.
  - **Hotfix:** production is broken and `dev` holds unreleased work that
    shouldn't go out yet. Branch `hotfix/<issue>-<slug>` off `main`, PR
    into `main`, run Ship It's steps 4-6 for it, then merge `main` back
    into `dev` so the branches don't drift.
- **Done when:** the fix is live, the test guards it, and the Issue
  explains what happened.

### 3.10 Grow It (`grow-it`)
- **Purpose:** improve from real use.
- **Inputs:** a live app. Feedback from the user, Issues, or anything they
  paste.
- **Does:**
  - Gathers what's been learned: feedback and bug patterns, what shipped,
    what's unused, and Vercel/Supabase usage if available.
  - Revisits `PRODUCT.md`: are the personas still right? Is the problem
    still the problem?
  - Runs a mini Dream It -> Trim It: new ideas become Issues, `later` items
    get reconsidered, and the board is reordered.
  - Offers **upgrades** when they'd pay off, each with its cost stated:
    a custom domain, error monitoring, analytics, a hosted staging
    environment (a second Supabase project + Vercel previews for `dev`),
    Supabase Branching (Pro) for per-PR databases, or migrate-then-deploy
    ordering (Open question 2).
- **Done when:** the board reflects what to do next, and why.

### 3.11 Helper: What's Next (`whats-next`) (optional, small)
Reads `journey.json`, the board and the `dev`/`main` difference. It answers
"where am I and what should I do next?", for example "3 stories are merged
but not shipped. Run Ship It?" It's cheap to build and makes the journey
self-guiding. Build it after Claim It works.

---

## 4. Repository layout

A single-plugin marketplace, modelled on `iter8-rails-plugins`:

```
<repo>/
  .claude-plugin/marketplace.json     # lists the one plugin
  iter8-it/
    .claude-plugin/plugin.json        # name, version, description
    skills/
      spot-it/SKILL.md
      name-it/SKILL.md
      claim-it/SKILL.md
      claim-it/assets/brand/...       # ported from init-project assets
      claim-it/assets/templates/...   # ci.yml, vercel.json, test configs, CLAUDE.md, etc.
      meet-it/SKILL.md
      dream-it/SKILL.md
      trim-it/SKILL.md
      build-it/SKILL.md
      ship-it/SKILL.md
      ship-it/assets/templates/migrate.yml
      fix-it/SKILL.md
      grow-it/SKILL.md
      whats-next/SKILL.md
    shared/
      journey-schema.md               # journey.json contract
      product-template.md             # PRODUCT.md skeleton
      conventions.md                  # board statuses, issue hierarchy, labels, branch naming
      environments.md                 # section 2a, for skills to cite
      supabase-local.md               # add local Supabase (Build It)
      supabase-prod.md                # add production Supabase + migrate Action (Ship It)
  scripts/teardown.*                  # test helper, not a skill
  test-fixtures/
  README.md
  PLAN.md                             # this file
```

- **Templates as files, not prose.** The first SlideIt run showed that
  config written out by hand drifts. Keep `ci.yml` (with and without the
  Supabase e2e setup), `migrate.yml`, `vercel.json`, `vitest.config.mts`,
  `playwright.config.ts`, `.editorconfig`, `.gitattributes`, the
  `.gitignore` additions and the `CLAUDE.md` skeleton as real files, and
  have the skills copy and fill them.
- **Versioning:** bump `plugin.json` `version` on each change that users
  should pick up (Claude Code caches plugins by version).

---

## 5. Build order

Build and test one skill at a time against a throwaway project before
starting the next.

1. **Repo skeleton:** marketplace, plugin.json, the `shared/` docs
   (journey schema, PRODUCT template, conventions, environments), and the
   README. Install the plugin locally and confirm the skills are
   discovered (frontmatter!).
2. **Claim It**, driven by a fixture `PRODUCT.md` + `journey.json`. It's
   the most mechanical step, has the freshest lessons, and everything
   later depends on it.
3. **Teardown helper** (`scripts/`, not a user-facing skill). It deletes a
   test run's GitHub repo and Project, Vercel project and Supabase project
   by slug, with confirmation. Claim It and Ship It will be run many times;
   this makes that cheap.
4. **Build It + Ship It together**, since they're one loop. Test both paths:
   - **No database:** a trivial story goes feature -> `dev` -> Ship It ->
     live, then is checked and marked Done.
   - **With database:** a story that triggers `supabase-local` (Docker)
     and adds a migration; Ship It then triggers `supabase-prod` (Free
     project, Vercel integration, `SUPABASE_DB_URL`, `migrate.yml`) and
     the Action applies the migration in production. Also exercise a
     failure: a deliberately broken migration stops the release cleanly.
5. **Spot It -> Name It**, then **Meet It -> Dream It -> Trim It**, each
   writing real `PRODUCT.md` / `journey.json` / Issues. Check that Claim It
   and Build It consume their real output, not just the fixtures.
6. **Fix It** (normal and hotfix paths).
7. **Grow It**, then **What's Next.**
8. **Acceptance test:** SlideIt end to end.

---

## 6. Testing the skills

- **Fixtures:** a `test-fixtures/` folder with `PRODUCT.md` + `journey.json`
  at each stage (after Name It, after Claim It, after Trim It with and
  without auth), so any skill can be started mid-journey.
- **Throwaway slugs** for provisioning tests (e.g. `itplug-test-<n>`), plus
  the teardown helper.
- **For each skill, verify:** it refuses cleanly when its inputs are
  missing; it's rerunnable without duplicating anything (idempotent where
  it provisions); and it writes exactly the state the next step expects.
- Consider `claude plugin eval` suites for the conversation steps (Spot,
  Name, Meet, Dream, Trim) once they settle.

---

## 7. Acceptance test: SlideIt

**Precondition:** the first SlideIt attempt is fully torn down, so the slug is
free everywhere and nothing bills:
- Supabase `slideit` project, its persistent `dev` branch and Branching
  (**the `dev` branch bills continuously until deleted**)
- Vercel `iter8-community/slideit`
- GitHub `Iter8-IT-Consulting/SlideIt` and its Project (#3). Deleting a
  repo needs `gh auth refresh -s delete_repo`.
- Local `C:\Source\SlideIt` contents
- Afterwards, move the Supabase org back to Free if nothing else needs
  Pro. The new model never needs it.
- Docker Desktop installed and running on the machine.

**Run:** Spot It -> Name It -> Claim It -> Meet It -> Dream It -> Trim It ->
Build It (first story) -> Ship It, in a fresh `SlideIt` folder, as
`Adam-Iter8`, committing as `Adam Goss <adam@iter8itconsulting.com>`,
GitHub owner `Iter8-IT-Consulting`, Vercel scope `iter8-community`.

**Expected outcomes:**
- Claim It: live Hello World from `main`; `dev` is the default branch; CI
  green; no Supabase and no Docker yet.
- Meet It yields at least a **Presenter** (desktop-first authoring) and an
  **Audience Member** (mobile-first viewing via QR). Playwright keeps
  `desktop` + `mobile`.
- Dream It / Trim It: Epics and Features as Issues; the first version
  ordered on the board; `needs.auth = true` (presenters save decks) and
  `needs.database = true`.
- Build It: the first data or auth story triggers the local Supabase setup;
  its migration is checked with `db reset`; the story merges to `dev`.
- Ship It: triggers the Free production project, Vercel integration,
  `SUPABASE_DB_URL` and `migrate.yml`; the release PR merges; the Action
  applies the migration; the live check passes; the story is Done. No
  Branching and no Supabase GitHub integration anywhere.

---

## 8. Open questions

1. **Claim It's name.** "Claim It" is a working name for the new step 3.
   Alternatives: "Start It", "Stake It", "Plant It". Or fold it into Name
   It ("Name It, and claim it"), although that makes Name It much
   heavier. The step list, README and skill folder follow whatever is
   chosen.
2. **Deploy/migrate ordering on `main`.** A release merge starts the Vercel
   build and the migrate Action in parallel, so new code can briefly run
   against the old schema (or the reverse). Options:
   a. Accept it, and require backward-compatible ("expand, then contract")
      migrations. This is the current plan: simplest, and fine at entry
      scale. Ship It's preflight flags destructive migrations.
   b. Let the Action own production deploys: migrate first, then
      `vercel deploy --prod` from the Action, with Vercel's automatic `main`
      deploys turned off. The order is guaranteed, but it needs a
      `VERCEL_TOKEN` secret and more moving parts.
   Start with (a), and offer (b) as a Grow It upgrade.
3. ~~**Data access layer.**~~ **Decided (2026-09-29): `@supabase/supabase-js`**
   with generated types (`supabase gen types typescript`) and a
   `src/repositories/` folder. No TypeORM. Migrations stay with the Supabase
   CLI (consider its declarative schemas so migrations are generated from
   the desired table definitions). Deciding reason: supabase-js queries as
   the signed-in user, so Row Level Security enforces who sees what in the
   database; an ORM on a direct connection bypasses RLS, and one missed
   filter leaks data. Original question: The Rails prescription is TypeORM (EntitySchema,
   `synchronize: false`) with a repository pattern. Keep it, or use
   `@supabase/supabase-js` directly (which pairs with Auth and Realtime;
   SlideIt's live slide sync will want Realtime)? It's introduced by the
   first data story either way. **Recommendation:** supabase-js plus a
   repository-pattern folder, with no TypeORM. It has fewer moving parts,
   no Node-only drivers, and it works with RLS.
4. ~~**Plugin and repo name.**~~ **Decided (2026-09-29):** the plugin is
   `iter8-it`, in the `iter8-community-plugins` marketplace repo
   (`Iter8-IT-Consulting/iter8-community-plugins`, private for now).
5. ~~**Audience.**~~ **Decided (2026-09-29): solo non-developer builders
   first.** Skills explain more, and Claude merges without a second
   reviewer. Original question: Is the primary user a solo non-developer builder (Iter8
   Community), a consultant with a client, or both? This affects tone, how
   much each step explains, and the default review policy for merges into
   `dev` and releases to `main`.
6. **Personal-account destinations.** Labels instead of Issue Types, and
   `gh project` under a user. Confirm this is a supported path from v1.
7. ~~**Release tagging.**~~ **Decided (2026-09-29): semver** (`vMAJOR.MINOR.PATCH`).
   Ship It proposes the bump from what's going out and explains it; the
   user confirms. Patch = fixes only; minor = new stories (things people
   can do); major = something people relied on changed or was removed, or
   a redesign. Releases count up from `v0.1.0`; the release that
   completes Trim It's first version is `v1.0.0`. Each release also gets a **GitHub Release** page (under the repo's
   Releases) with a plain-language list of what changed. Original question: Date-based (`v2026.10.02-1`) or semver? Date-based
   suits non-developers and continuous shipping. Also decide whether Ship
   It creates a GitHub Release with the changelog.
8. ~~**Branch protection.**~~ **Decided (2026-09-29): require green CI before
   merging into `main`** (not `dev`). Claim It adds a ruleset for `main`.
   GitHub only enforces rulesets on public repos or paid plans; on a
   private repo under GitHub Free (Iter8-IT-Consulting is on Free), Claim It
   says so and the rule is skill-enforced instead: Ship It and Fix It never
   merge into `main` until CI is green. Grow It offers the paid plan as an
   upgrade, with its cost. Original question: Require green CI before merging into `dev` and
   `main`? It's cheap to set up from Claim It (`gh api` rulesets) and
   protects beginners, but it adds friction for solo builders.
   Recommendation: protect `main` only.

---

## 9. After Friday (2026-10-02): ideas queued

### 9.1 Adopt It: bring an existing project onto the journey

**Idea (Adam, 2026-10-01):** take a project that already exists (on
GitHub, Vercel and Supabase, say), work out where it is in the journey,
and fill in the gaps, so iter8-it can carry on from there. **First test
case: ScoreIt.** It has a GitHub repo and board (#2), a Vercel project
with production on `release/prod`, Supabase `scoreit-prod` plus a paused
`scoreit-test`, and Resend for email.

A one-time step (working name **Adopt It**), run in the project's folder:

1. **Discover, read-only.** Read the repo (stack, `package.json`, tests,
   CI, `supabase/`, README), GitHub (default branch, branches, Issues and
   their types and labels, Projects and their Status options, rulesets),
   Vercel (`vercel-check.mjs project`: Git link, production branch,
   domains, env vars by name only) and Supabase (projects, Branching,
   integrations, how migrations are applied today). Nothing changes yet.
2. **Place it on the journey.** Fill in `journey.json` from what was
   found and set `stage` to the furthest step whose outputs already
   exist. A live app with a backlog is past Trim It, for example.
3. **Reconstruct the product story.** Draft `PRODUCT.md` (Problem,
   People, First Version, Layout) from the README, the code, the Issues
   and the live site. Confirm each part with the user in a short
   "confirm mode" of Spot / Name / Meet / Trim It: show the draft, ask
   what's wrong, never re-interview from scratch.
4. **Gap report.** Compare with the iter8-it conventions
   (`shared/conventions.md`, `environments.md`, `journey-schema.md`) and
   list each difference in plain words, with what it would take to close
   it, the risk, and whether it's needed or optional. For example:
   - branches (`release/prod` vs `main` + `dev`), and Vercel's
     production branch;
   - the board's Status options (Backlog / Todo / In Progress /
     In Review / Done), Issue Types vs labels, `persona:` labels;
   - CI (lint, typecheck, unit; e2e on releases) and `vercel.json`
     (deploy only production);
   - the database: Branching or a persistent cloud dev database
     (billing!) vs local Docker; migrations applied by `migrate.yml` with
     `SUPABASE_DB_URL` vs by hand or by an integration; production env var
     names (publishable keys);
   - tests (Vitest, Playwright desktop/mobile), `CLAUDE.md` and README
     sections;
   - anything iter8-it doesn't support (a non-Next.js stack, say): say
     so plainly, and adopt only the parts that fit (board, Issues,
     PRODUCT.md, releases).
5. **Close gaps one at a time, with consent,** smallest risk first. Each
   change goes through a PR. Nothing that could break the live app
   happens without a rollback plan: switching Vercel's production branch,
   say, or replacing how migrations run. Some gaps can be left on
   purpose; record them in `journey.json` (e.g. an `adopted.exceptions`
   list) so other skills don't trip over them.
6. **Hand off** to What's Next.

**Things to work out:**
- How much the other skills must tolerate a partly adopted project:
  exceptions, or a "compatibility" flag that each skill checks.
- Existing Issues with no Feature/Story structure: map them, or leave
  them and only structure new work.
- Data safety when moving off Branching or a cloud dev database: what
  local seed data replaces it.
- Cost: adoption may *save* money (e.g. dropping a persistent Branching
  database). Say so in the gap report.

---

## Appendix B: Decisions made while building Claim It (2026-09-29)

- **Templates are applied by a script** (`claim-it/scripts/apply-templates.mjs`),
  which reads `journey.json` and refuses to run twice without `--force`.
  The name and purpose live in one generated file, `src/app/site.ts`, which
  the page, the metadata and both tests import.
- **`create-next-app --disable-git`** avoids deleting the temp folder's `.git`.
- **Vercel checks are a script** (`claim-it/scripts/vercel-check.mjs`):
  `visible` (the search-repo check from Appendix A) and `project`
  (Git connection, production branch, production URL from
  `/v9/projects`). The production URL is read, never assumed: Vercel
  adds a suffix when `<slug>.vercel.app` is taken.
- **Connecting Vercel doesn't deploy.** Claim It pushes a commit to `main`
  afterwards and waits for that deployment (`vercel inspect --wait`), then
  runs the e2e suite against the live URL (`BASE_URL=... npm run test:e2e`).
- **Status field:** `claim-it/scripts/board-status.mjs` sends GraphQL
  variables (no shell escaping) and refuses boards that already have
  items, because replacing the option list regenerates option IDs.
- **Story vs Task:** if an org has no Story Issue Type, Claim It asks each
  time whether to add one (org-wide) or use Task. The choice is recorded
  in `journey.json` `github.workItems`, and later skills read type names
  from there.
- **First live run (itplug-test-1, 2026-09-29) worked end to end**, except
  the commit identity: the first two commits used the global
  `thegoss@gmail.com`, and Vercel **blocked** that deploy because it didn't
  recognize the author email. Claim It now defaults the commit email to
  the Vercel account's email (`vercel-check.mjs account`), sets it
  repo-locally right after the go-ahead before anything is committed,
  and explains a BLOCKED deploy. Separately, `git push` goes through Git
  Credential Manager, not `gh`, so it can push as a different GitHub
  account; Claim It offers `gh auth setup-git`.
- **Build It / Ship It mechanics (2026-09-30):** a shared
  `shared/scripts/board.mjs` (list in board order, set status, reorder)
  and `shared/scripts/vercel-check.mjs` (moved from Claim It; adds
  `deployment <project> <sha>`, which waits for the production deploy of
  a commit via `meta.githubCommitSha`). `gh` 2.97 creates typed
  sub-issues natively (`--type`, `--parent`). Stories are squash-merged
  into `dev`; releases are merge commits into `main`, after which `dev`
  is fast-forwarded to `main`. Ship It commits `lastRelease` to `dev`
  *before* the release PR so `main` and `dev` end identical. Issues are
  closed by Ship It, not by PR keywords: GitHub only auto-closes for PRs
  into the default branch (`dev`).
- **Database procedures (2026-09-30).** `shared/supabase-local.md` and
  `shared/supabase-prod.md`, with helpers `supabase-ports.mjs` (each
  project gets its own block of ten local ports: ScoreIt and DDJ already
  hold 5432x and 5532x on Adam's machine), `supabase-env.mjs` and
  `supabase-prod.mjs`. Env names follow what the Supabase Vercel
  integration syncs today (publishable keys, not the legacy anon key):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY`. **The Supabase <-> Vercel dashboard integration is
  replaced** by `vercel env add` with keys from `supabase projects
  api-keys`: same variables, no dashboard pause. `supabase link` writes
  the session-pooler URL (port 5432) to `supabase/.temp/pooler-url`,
  which becomes the `SUPABASE_DB_URL` secret. `migrate.yml`'s manual run
  defaults to `--dry-run`, so proving the connection from `dev` changes
  nothing. `supabase init` no longer prompts; `supabase migration new`
  waits on stdin when it isn't a terminal, so tools must close stdin.
  Supabase Free allows 2 active projects per org, and paid orgs pay about
  $10 a month per extra project, so supabase-prod asks for the plan first.
- **CI doesn't run on pushes to `dev` (2026-09-30).** Only PRs into `dev`
  and `main`, plus pushes to `main`. A merged PR already ran on that
  exact code, so the push run was a repeat, about a third of the CI
  minutes. (The org is on GitHub Free: 2,000 private-repo minutes a
  month, shared with ScoreIt. A story with a database costs about 10
  minutes: CI with Supabase is about 5 billed minutes per run.)
- **Build It + Ship It tested live on itplug-test-1 (2026-09-30), both paths.**
  Without a database: two Features built as stories in separate Build It
  runs, released together as v0.1.0; board, issues, release page and
  `dev`/`main` sync all correct. With a database: a Feature split into
  "read" and "sign" stories; the first set up local Supabase (own port
  block) and passed CI with Supabase in the runner; Ship It created the Pro-org
  production project, set the Vercel env vars and `SUPABASE_DB_URL`, the
  dry run listed both migrations, and on release the migrate Action
  applied them. The live guestbook reads and writes. Torn down afterwards
  with `scripts/teardown.mjs`, including the Supabase project. **Not yet
  exercised: sign-in (auth).**
- **Sign-in template (2026-10-01).** Built and tested locally before the
  SlideIt trial (`shared/supabase-auth.md`). Email and password, with
  confirmation off for the first version, because Supabase's built-in
  email sender only reaches the org's team members and sends very little.
  Production sign-in settings go through `supabase-prod.mjs auth-config`:
  `config push` sends every property a config.toml declares, so it pushes
  a temporary config that declares only the auth settings. (Checked with
  `config diff`: undeclared settings show as "remote_only" and are left
  alone.) Branded account emails become a `later` Feature created by
  Build It. ScoreIt already sends through Resend
  (`noreply@mail.apps.iter8.community`), which is the obvious path when
  that Feature comes up.
- **Vercel CLI logins expire after about 8 hours** (`auth.json` has
  `expiresAt` and `refreshToken`). Scripts that read the token run
  `vercel whoami` first to renew it.
- **Backlog column and grooming (2026-10-01).** The board is Backlog /
  Todo / In Progress / In Review / Done, so the whole backlog is visible
  and can be dragged. Dream It puts Features in Backlog. Trim It moves
  the chosen ones to Todo, in order. It is also the grooming step, rerun
  whenever Todo runs low: next / later (label + reason) / never (closed
  "not planned" + reason) / not decided. What's Next recommends Trim It
  when Todo is empty and the Backlog isn't. Build It never takes work
  straight from the Backlog. Added to SlideIt's board (#5) while it was
  still empty.
- **CI end-to-end tests only at release (2026-10-01).** Story PRs into
  `dev` run only lint, typecheck and unit tests (about 1 minute). The
  end-to-end job (3-5 minutes with Supabase) runs on PRs into `main`,
  pushes to `main` and manual runs, because Build It already runs the
  full e2e suite locally against the local database before each PR. The
  release PR still gates `main` on e2e.
- **Build It run scope (2026-10-01):** asks once per run: one story, this
  Feature (the default) or everything in Todo. It loops story by story,
  keeping the try-it pause, and stops early on failures or decisions.
- **Two loops (2026-10-01).** After Claim It, the journey has an inner
  loop (Build It <-> Ship It, with Fix It) and an outer loop (Grow It ->
  Meet It -> Dream It -> Trim It). The outer loop runs whenever real use
  teaches something. Meet It reruns add, adjust or retire personas, and
  lead into a Dream It focused on a new persona, then Trim It. What's
  Next and Ship It nudge toward the outer loop every couple of releases.
  Grow It (after Friday) becomes the outer loop's guide.
- **Layouts as descriptions, not code (2026-10-01).** `shared/layouts.md`
  describes four app shapes (single-tool, app-nav, mobile-tabs,
  two-sided), each with fits / desktop / phone / signals / first story
  builds, plus a separate yes/no for a public **front page**. (That was
  first a fifth "front page + app" layout; Adam pointed out it's a choice
  on top of any layout.) Trim It recommends both after the first trim. The
  choice is recorded in `journey.json` `layout: { shape, frontPage }`
  and `PRODUCT.md` (Layout section). Build It's first story builds the
  frame. Text only, so nothing goes stale with Next.js versions. Code
  templates were considered and rejected for the upkeep.
- **Cold-start test times on Windows** are antivirus scanning freshly
  installed files (33s jsdom / 14s happy-dom on the first run, ~1-2s
  after). Retry once before treating a timeout as a failure.

---

## Appendix A: Lessons from the first SlideIt run

Concrete things the first attempt (with `init-project` 0.5.2, 2026-09-26)
ran into. Build them into Claim It / Ship It.

| Problem | Fix to build in |
|---|---|
| `init-project` never appeared as a skill in the session. | `SKILL.md` needs YAML frontmatter; bump the plugin version on changes. |
| `create-next-app .` rejects a folder named `SlideIt` (npm names can't have capitals). | Scaffold into a lowercase temp subfolder, delete its `.git`, move the contents up. |
| `npm i -D vitest` failed its peer check against `@types/node@20` on Node 24. | Install `@types/node@^<node major>` to match the machine's Node. |
| CI `tsc` failed: `Cannot find name 'LayoutProps'` (types generated into gitignored `.next/types`). | `"typecheck": "next typegen && tsc --noEmit"`; CI uses it. |
| Next 16 ships `AGENTS.md`, with `CLAUDE.md` = `@AGENTS.md`. | Keep `@AGENTS.md` as the first line of the generated `CLAUDE.md`. |
| Two gh accounts were signed in; the wrong git email would have been committed. | Confirm the active gh account and set a repo-local git identity before the first commit. |
| The Supabase CLI was signed in as an old account; org IDs changed after re-login. | `supabase-prod.md` shows the org list and confirms it before creating anything; offer `supabase logout/login`. |
| `supabase init` prompts interactively. | Pipe `n` answers (or pass flags) for the VS Code/Deno prompts. |
| `gh project create` Status lacked "In Review". | Read the options and send the full list plus additions to `updateProjectV2Field`; then `gh project link`. |
| `vercel git connect` failed: the Vercel GitHub App was on "selected repositories" and didn't include the new repo. Even after the user changed it, it took another round. | Before connecting, query what the app can see: `GET https://api.vercel.com/v1/integrations/search-repo?provider=github&teamId=<id>&namespaceId=<installation-id>` (token from the Vercel CLI's `auth.json`). Give the exact org installation settings link and verify again before retrying. |
| `vercel git connect` asks y/N when the local remote already matches. | Pipe `y`. |
| `vercel link` appends `.vercel` to `.gitignore` even if already present. | Check, and revert the duplicate. |
| The Supabase <-> Vercel integration synced vars to **Production only**. | Fine under this model: only `main` deploys, and local dev uses `supabase status -o env`. |
| The Rails init used Supabase Branching (Pro plan + an always-on `dev` branch). That was too expensive for entry projects. | Local Supabase in Docker for `dev`/feature work; one Free production project; migrations applied by a GitHub Action on `main`. |
| Init provisioned a database and an example `presentations` table before any story asked for them. | Claim It never touches Supabase; Build It / Ship It add it just in time; no tables without a story. |
| A Vitest cold start timed out once (60s) on Windows. | Re-run once before treating it as a failure; consider raising `testTimeout`. |
| A background poll loop for Supabase status confused the user. | Say what's being waited on and roughly how long before any polling loop, and prefer a single check the user can re-trigger. |
