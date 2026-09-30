---
name: ship-it
description: "Ship It — Put what you've built live for real users, and check it works there. Releases everything merged into dev to production: a release PR into main, the live deploy, a check of the live site, a version number and release notes, and the board updated. Use when someone wants to release or deploy, or says 'ship it', 'put it live', 'release', or 'deploy what's on dev'."
---

# Ship It

**Step 8 of the iter8-it journey.** Put what you've built live for real
users, and check it works there.

Ship It runs **every release**, not once. It promotes `dev` to `main`
(production), watches the live deploy, checks the live site, names the
release, and moves the released work to Done.

```
dev --release PR--> main --> Vercel production (+ database migrations, once there's a database)
```

## How to talk while doing this

- Plain language. Describe the release in terms of what people using the
  app can now do.
- Say what you're waiting on and roughly how long before each wait.
- Never go ahead with a release the user hasn't confirmed.

## Files and scripts

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md). Run the scripts from the project folder.

- `<plugin>/shared/scripts/board.mjs`: `list [--status "<status>"]`,
  `set <issue> "<status>"`.
- `<plugin>/shared/scripts/vercel-check.mjs`:
  `deployment <project> <full-sha>` waits for the production deploy of a
  commit; `project <project>` gives the production URL.
- `<plugin>/shared/supabase-prod.md`: the production database, the first
  time a release needs one.
- `<plugin>/shared/environments.md`: branches, environments, migrations.

## 0. Where are we?

1. Read `journey.json`. Needs `github.*` and `vercel.*` (Claim It). If
   they're missing, say so and offer Claim It.
2. Up to date and clean:

   ```bash
   git status --short         # must be empty
   git fetch origin
   git switch dev
   git pull
   ```

3. Anything to ship? `git log --oneline origin/main..origin/dev`. If it's
   empty: "Everything on `dev` is already live." Offer Build It. Stop.
4. `dev`'s latest CI run must be green:
   `gh run list --branch dev --workflow ci.yml --limit 1 --json conclusion,status,url`.
   Still running: wait for it (`gh run watch <id> --exit-status`). Failed:
   stop. Say what failed; fixing it is Build It's (or Fix It's) job.

## 1. What's going out

Gather:

- **Stories and fixes:** the merged PRs in
  `git log --oneline origin/main..origin/dev` (squash merges end in
  `(#<pr>)`), and the board items in In Review
  (`board.mjs list --status "In Review"`). Match them up. Flag anything
  merged that isn't on the board, and anything In Review that isn't
  merged.
- **Database changes:**
  `git diff --name-only origin/main origin/dev -- supabase/migrations`.
  Read each new migration. Flag anything **destructive**: `drop`,
  `rename`, `alter ... type`, `truncate`, `delete from`. Production briefly
  runs the old code against the new schema during a release, so a
  destructive change can break the live app. Explain the risk in plain
  words and suggest splitting it (add now, remove in a later release).

**Propose the version.** The last one is `journey.json` `lastRelease.tag`
(or the newest `gh release list --limit 1`). Versions are `vMAJOR.MINOR.PATCH`:

| Bump | When |
|---|---|
| none yet | First release: **v0.1.0** |
| **patch** (0.3.1 -> 0.3.2) | Only fixes; nothing new people can do. |
| **minor** (0.3.1 -> 0.4.0) | New things people can do (new stories). |
| **major** (1.4.0 -> 2.0.0) | Something people relied on changed or was removed, or a redesign. |
| **1.0.0** | The release that completes the first version: after it, every Feature Trim It put on the board (not labelled `later`) is live. |

Show the summary and the proposal, and ask to go ahead:

> **Ready to release v0.2.0** (new things people can do):
> - Presenters can upload a slide deck (#12)
> - Audience members can join with a QR code (#14)
>
> No database changes. Go ahead?

## 2. First release that needs a database?

If the release includes `supabase/migrations/` files, or the app uses
Supabase (`journey.json` `supabase.local` is `true`), and
`supabase.projectRef` is `null`: this release creates the production
database. Tell the user what that involves (a free Supabase project, one
dashboard step for them) and follow `<plugin>/shared/supabase-prod.md`
before step 3.

## 3. Release PR

Record the release first, so `main` and `dev` end up identical. On `dev`:

- `journey.json`: `lastRelease` = `{ "tag": "<version>", "at": "<now, ISO 8601>" }`,
  and `stage` = `"ship-it"` if it was earlier.
- Commit (`Ship It: prepare <version>`) and push.

Then the release PR, with plain-language release notes:

```bash
gh pr create --base main --head dev --title "Release <version>" --body-file <file>
```

```markdown
## What's new
- <Persona> can <do thing> (#<story>)

## Fixes
- <what was wrong, now fixed> (#<bug>)

## Behind the scenes
- <database changes, in plain words, if any>
```

(Leave out empty sections. Use `Refs`, never `Closes`: see
`<plugin>/shared/conventions.md`.)

**Checks must pass before merging, always**, whether or not GitHub
enforces it (`journey.json` `github.mainProtected`):

```bash
gh pr checks <pr> --watch --fail-fast
```

Say: "Running the final checks on the release. About 3-5 minutes." If a
check fails, stop and explain; the fix goes through Build It or Fix It.
Don't merge.

Merge with a **merge commit** (so `main`'s history shows each release).
Never delete `dev`:

```bash
gh pr merge <pr> --merge
git fetch origin
```

## 4. Watch it go live

```bash
node <plugin>/shared/scripts/vercel-check.mjs deployment <vercel.project> $(git rev-parse origin/main)
```

Say: "Vercel is building the new version. About 1-3 minutes. The current
version stays live until the new one is ready."

- `READY`: go on.
- `ERROR`: the new version didn't build, and **nothing changed for
  people using the app**. Show the cause
  (`vercel inspect <url> --logs --scope <vercel.scope>`), explain it, and
  hand off to Fix It. Stop.
- `BLOCKED`: Vercel didn't recognize the commit author's email. See Claim
  It's note on commit identity; fix and push an empty commit to `main`
  through a PR. Stop and explain.

**If the release has migrations**, the migrate Action runs at the same
time:

```bash
gh run list --branch main --workflow migrate.yml --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch <id> --exit-status
```

If it fails: **stop**. Show the log (`gh run view <id> --log-failed`),
explain in plain words, and hand off to Fix It. Never change the
production database by hand.

## 5. Check it live

Get the production URL (`journey.json` `vercel.url`, or
`vercel-check.mjs project <vercel.project>`), then run the end-to-end
tests against it:

```bash
BASE_URL=<production url> npm run test:e2e
```

(PowerShell: `$env:BASE_URL="<url>"; npm run test:e2e; Remove-Item Env:BASE_URL`.)

Skip tests that change data if the live app has real users' data (tag
those tests `@writes` and run with `--grep-invert @writes`).

Then check each released story's acceptance criteria on the live site,
briefly, and ask the user to try the headline change on the device it's
for: "Open <url> on your phone and try joining with the QR code."

**If it's live but broken:** offer to roll back to the previous version
right away. It takes seconds, and nothing is lost:

```bash
vercel ls <vercel.project> --scope <vercel.scope> --environment production --format json   # the previous READY deployment's url
vercel rollback <previous deployment url> --scope <vercel.scope> --yes
```

Then hand off to Fix It. (A rollback puts back the old code, not an old
database. That's why migrations only ever add.)

## 6. Close the loop

1. **Name the release** and publish its release page (the same notes as
   the PR):

   ```bash
   gh release create <version> --target main --title "<version>" --notes-file <file>
   ```

2. **Board:** for each released story and fix:
   `board.mjs set <n> Done`, then
   `gh issue close <n> --comment "Live in <version>: <production url>"`.
   A Feature whose stories are all Done: set it to Done and close it the
   same way. An Epic whose Features are all closed: close it.
3. **Bring `dev` level with `main`** (the release merge commit is the only
   difference):

   ```bash
   git switch dev
   git merge --ff-only origin/main
   git push origin dev
   ```

## 7. Hand off

- **What's live:** <version> at <url>, and what people can now do.
- **The release page:** `gh release view <version> --json url --jq .url`.
- **The board:** what's Done, and what's next in Todo.

Offer: "Next up on the board is #<n>, *<title>*. Build it now?"

## Stop and ask if

- CI on `dev` is failing, or the release PR's checks fail.
- A migration is destructive and the user hasn't agreed to the risk.
- The deploy fails, is blocked, or the migrate Action fails.
- The live check fails (offer the rollback first).
- `git merge --ff-only` fails: someone changed `dev` during the release.
  Explain, and merge `main` into `dev` with a normal merge after asking.
- Anyone suggests changing the production database by hand.

If the release stops **before** the release PR is merged, undo the
"prepare" commit on `dev` (`git revert <sha>`, push) so `journey.json`
doesn't claim a release that didn't happen, and close the release PR.
