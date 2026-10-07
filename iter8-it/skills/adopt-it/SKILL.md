---
name: adopt-it
description: "Adopt It — Bring an app you've already started onto the iter8-it journey. The other way in, instead of Spot It, Name It and Claim It: looks at the existing app (code, GitHub, Vercel, Supabase) without changing anything, places it on the journey, drafts PRODUCT.md for the user to confirm, reports the gaps from the iter8-it way in plain words, and closes them one at a time with the user's OK. Use when someone has an existing app or repo they want to use iter8-it with, or says 'adopt it', 'use iter8-it on my existing app', or 'bring this project in'."
---

# Adopt It

**The other way in.** For an app that already exists, Adopt It takes the
place of Spot It, Name It and Claim It. Afterwards the app joins the same
loop as every iter8-it app: Meet It, Dream It, Trim It, Skin It, Build
It, Ship It.

```
New idea:      Spot It -> Name It -> Claim It --+
                                                +--> Meet It -> Dream It -> Trim It -> ...
Existing app:  Adopt It ------------------------+
```

The rule above everything: **the live app keeps working.** Adopt It
looks before it touches, changes nothing without a yes, makes every change
reviewable, and never does anything to the live app without a way back.

## How to talk

- Respectful: this is someone's working app, built their way. Differences
  from iter8-it aren't mistakes. Say "iter8-it does this differently",
  not "this is wrong".
- Plain words, one question at a time. Group the gaps; don't dump a list
  of 20 at once.

## 0. Is this the right step?

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md). Run from the app's folder.

- No code here (an empty folder): this is a new idea. Offer **Spot It**.
- `journey.json` already exists: it's already on the journey. Offer
  **What's Next** (or a re-scan, step 1, if they want a fresh gap report).
- Otherwise: an existing app. Carry on.

Check the tools are signed in, as Claim It does: `gh auth status` (the
right account), `vercel whoami`, and, if the app uses Supabase,
`npx supabase projects list` (the right account and org).

## 1. Look, without touching

```bash
node <plugin>/shared/scripts/adopt-scan.mjs
```

It reads the repo, GitHub (branches, the board and its statuses, Issue
types, labels, secrets by name, rules), Vercel (Git link, production
branch, address, env var names) and Supabase (projects), and prints what
it found plus a list of **gaps**, each with what the app has, what
iter8-it expects, whether it's **needed**, **recommended** or **optional**,
and the **risk** of changing it. It changes nothing.

If it says Vercel isn't linked here, ask, then `vercel link` (it only
writes `.vercel/`, which is gitignored) and scan again.

Also read the README, `CLAUDE.md`, any planning files the scan lists, the
main pages of the app, and the open Issues, so you understand what the
app is for.

**Not a Next.js app?** Say so plainly: iter8-it's build and release steps
assume Next.js on Vercel. Offer to adopt only the planning side (the
board, Issues, `PRODUCT.md`, Meet / Dream / Trim It, releases), and stop
there.

## 2. The product story, drafted

Draft `PRODUCT.md` (`<plugin>/shared/product-template.md`), the app's
product brief, from what you read:

- **Vision**: **Problem**, **People** and the purpose line. Code shows
  what an app does, not why, so each of these starts with
  `<!-- DRAFT: drafted from the code; please confirm the intent -->`
  until the owner confirms it.
- **What it does today**: from the README, the app's pages and routes,
  recent merged PRs (`gh pr list --state merged --limit 30`) and releases
  (`gh release list`): "<Persona> can ..." bullets, with versions where
  releases exist.
- **Up next**: from open Issues and the board (or milestones, if that's
  what the app uses).
- **First Version**: leave it out (it's the plan from before building);
  **Layout**: the shape the app already has, from
  `<plugin>/shared/layouts.md`, or `custom`.

Keep it to about one page. Then confirm it **section by
section**, in a short "confirm mode" of Spot It / Meet It / Trim It: show
the draft, ask "what's wrong or missing?", fix it. Never re-interview from
scratch. The app's name and one-line purpose too (Name It in a sentence).

## 3. Place it on the journey

Write `journey.json` (`<plugin>/shared/journey-schema.md`) from what was
found: `name`, `slug` (the repo name), `purpose`, `needs` (sign-in? stored
data?), `layout`, `github`, `vercel`, `supabase` (`projectRef` of the
production project), `lastRelease` (the newest release or tag, if any),
`skin` (`null` unless it already uses brand tokens), `brief` (`release`:
the newest release or `null`, `updatedAt`: now), and:

```json
"adopted": { "at": "<ISO date>", "from": "<one line: how it was run before>", "exceptions": [] }
```

`stage`: the furthest step whose results now exist. A live app with
people and a backlog is usually `trim-it`; without a backlog, `meet-it`.

Commit `PRODUCT.md` and `journey.json` on a branch and open a PR, or
straight to `dev` if it already exists. This is the first change, and it
touches no running code.

## 4. The gap report

Walk through the scan's gaps **grouped** (Product, Board, Branches,
Hosting, Database, CI, Tests, Look), needed first. For each: what the
app does today, what iter8-it does instead and why it helps, what it
would take, the risk, and any cost. Point out money it could save (an
extra active database on a paid plan, say). Ask, group by group, which
to close now, which later, and which to keep as they are.

Gaps they keep go into `journey.json` `adopted.exceptions`, each as
`{ "id": "<gap id>", "why": "<their reason>" }`. Other steps read these
and work around them (for example, a kept deploy script means Ship It
mentions it instead of assuming merge-to-deploy).

## 5. Close gaps, one at a time

Lowest risk first. Each change is its own small piece of work: a branch,
a PR, checks, the user's OK, as in Build It. Use the existing procedures
instead of improvising:

| Gap | How |
|---|---|
| Board statuses, `later` label, Issue types | `shared/conventions.md`; a board with items needs its Status options changed by hand in its settings (say exactly what to add) |
| Board views | `node <plugin>/skills/claim-it/scripts/board-views.mjs <owner> <number>`, **after** the Status options are fixed (the Tracking Board's columns come from Status). It adds Issue List and Tracking Board and leaves existing views alone; offer to delete old views by hand if they're no longer wanted |
| Tests, scripts, `vercel.json`, `ci.yml` | Copy from `skills/claim-it/assets/templates/` (and `shared/templates/supabase/` if it has a database), adapting to the app, not overwriting its own tests |
| `dev` branch and default branch | Create `dev` from the code that's live now, push, `gh repo edit --default-branch dev`. Tell them existing branches stay; new work starts from `dev` |
| Local database ports | `shared/scripts/supabase-ports.mjs` |
| Migrations workflow, `SUPABASE_DB_URL`, env var names | `shared/supabase-prod.md` steps 3-5. First find out how migrations reach production today, and keep that working until the new way is proven with a dry run |
| Skin and `/style-guide` | Offer **Skin It** (it can capture the current look as tokens) |
| Vercel avatar | If the app has its own icon but Vercel still shows another (often the Iter8 "8"): `node <plugin>/shared/scripts/vercel-check.mjs set-avatar <project> src/app/apple-icon.png` |

**High-risk gaps** (Vercel's production branch, `main` itself, how
production gets its database changes) need a short plan before anything
moves: what changes, in what order, how to check the live site, and how
to roll back. Do them together with the user watching, at a quiet time.

Retire old planning files (`context.json`, `po-backlog`, old CLAUDE.md
sections) only once their content is in `PRODUCT.md` or on the board, and
only with a yes.

Add `CLAUDE.md` sections from Claim It's template (links, stack,
commands, branches, look) next to what's already there. Keep their own
notes.

## 6. Hand off

Sum up: what's now on the journey, what was changed, what was kept (the
exceptions) and why. Then run **What's Next**, which picks it up from
here like any iter8-it app.
