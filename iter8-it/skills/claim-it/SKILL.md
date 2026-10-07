---
name: claim-it
description: "Claim It — Claim your name on the internet: a real project and a live page, so it's real from the start. Creates the GitHub repo, project board and CI, the Vercel project, and a live starter page. Use when someone has named their project and wants to set it up, or says 'make it real', 'set it up', 'claim it', or 'get it online'."
---

# Claim It

**Part of the iter8-it journey.** Claim your name on the internet: a real
project and a live page, so it's real from the start.

This is the one-time setup. When it's done, the project has:

- a Next.js app with a starter page showing its name and purpose
- unit and end-to-end tests, passing
- a private GitHub repo with `main` and `dev` (`dev` is the default)
- a GitHub project board (Backlog / Todo / In Progress / In Review / Done), empty
- CI running on every PR into `dev` and `main` (and pushes to `main`), green
- `main` protected: nothing merges into it unless CI is green
- a Vercel project that deploys `main` only
- a public `/style-guide` page showing the app's colors, fonts and pieces
  (the Iter8 starter skin until Skin It gives it its own)
- a live URL a stranger could open on their phone

**No database.** Supabase comes later (Build It / Ship It), and only if the
app needs it.

Everything here is on free tiers: GitHub Free, Vercel Hobby (or the user's
existing team), and nothing else. Say so when asking to go ahead.

## How to talk while doing this

- Plain, everyday language. The user may not be a developer. Say what
  you're about to do and why, in a sentence, before doing it.
- One question at a time. Offer a sensible default.
- Before anything slow (installs, the first build, waiting for CI or a
  deploy), say what you're waiting on and roughly how long: "Installing
  the app's building blocks. This takes 2-5 minutes."
- Don't run silent polling loops. Use a single blocking wait (`gh run
  watch`, `vercel-check.mjs deployment`) or one check the user can ask
  you to repeat.

## Files this skill uses

`<skill-dir>` is the folder holding this SKILL.md. `<plugin>` is the
iter8-it plugin folder, two levels up (`<skill-dir>/../..`).

| Path | What it is |
|---|---|
| `scripts/apply-templates.mjs` | Copies the templates and branding into the scaffolded app and fills in the name and purpose. |
| `scripts/board-status.mjs` | Makes the board's Status field Backlog / Todo / In Progress / In Review / Done (empty boards only). |
| `scripts/board-views.mjs` | Adds the two standard views: **Issue List** (table) and **Tracking Board** (board, columns by Status). Leaves existing views alone. |
| `<plugin>/shared/scripts/vercel-check.mjs` | `account`: the Vercel account's email. `visible <owner>/<repo>`: can Vercel's GitHub App see the repo? `project <name>`: the project's Git connection, production branch and URL. |
| `assets/templates/` | The project files, laid out as they go into the project. |
| `assets/brand/` | Iter8 Community branding (favicon, palette, footer credit). |

The shared contracts this skill writes to are in `<plugin>/shared/`: `journey-schema.md`,
`conventions.md`, `environments.md`.

## 0. Where are we?

Read `journey.json` in the current folder.

- **Missing, or no `name` / `slug` / `purpose`:** say that Claim It needs
  a named project first, and offer to run Name It (or Spot It if there's no
  `PRODUCT.md` either). Stop.
- **`github` / `vercel` already filled in:** this is a rerun. Go to
  [Resuming](#resuming), and never redo a finished step.
- Otherwise start at step 1.

## 1. Check everything before creating anything

Do all of these first. If any fails, say which, say how to fix it, and
stop. Don't create anything halfway.

1. **Tools.** `node --version` (20.9 or newer), `npm --version`,
   `git --version`, `gh --version`, `vercel --version`. If one's missing,
   say what it is and how to install it: Node.js from nodejs.org (includes
   npm), Git from git-scm.com, GitHub CLI from cli.github.com, Vercel CLI
   with `npm install -g vercel`.
2. **The folder.** It should hold only `PRODUCT.md`, `journey.json`,
   `.git/` and editor/tool leftovers (`.vscode/`, `.claude/`, `USER.md`).
   Anything else: show what's there and ask before going on. Never
   overwrite someone's work.
3. **GitHub sign-in.** Run `gh auth status`. If more than one account is
   signed in, show them all and which is active. Ask: "I'll create the repo
   as **<account>**. Is that right?" If not, `gh auth switch`. The token
   needs the `repo`, `project` and `workflow` scopes; if one's missing,
   `gh auth refresh -h github.com -s project,workflow`.

   **Pushes must go as that account too.** `git push` doesn't use `gh`'s
   login unless git is set up to: check
   `git config --get-all credential.https://github.com.helper`. If it
   doesn't mention `gh`, git uses whatever GitHub login the system's
   credential store remembers (on Windows, Git Credential Manager), which
   can be a different account. Explain that, and offer
   `gh auth setup-git`, which makes git push as the active `gh` account.
   It changes a setting for all repos on this machine, so ask first.
4. **Where the repo goes.** Ask which GitHub owner: the account itself or
   one of its orgs (`gh api user/orgs --jq '.[].login'`). Never guess.
   Check the owner type:
   `gh api users/<owner> --jq .type` (`Organization` or `User`).
   Ask private or public (default: private).
5. **How work items are typed.**
   - **Organization:** list its Issue Types:
     `gh api orgs/<owner>/issue-types --jq '.[] | "\(.name) enabled=\(.is_enabled)"'`.
     - Epic, Feature or Bug missing: explain that Issue Types are
       org-wide (every repo in the org sees them) and ask to add them.
     - **Story missing:** ask: "Your org doesn't have a Story type. I can
       add one (it'll show up in every repo in the org), or use your
       existing **Task** type for stories. Which would you like?"
     - Don't create anything yet; step 6 does that. Remember the
       answers for `github.workItems`.
   - **Personal account:** Issue Types don't exist there. Use labels
     `epic`, `feature`, `story`, `bug`, created in step 6. Tell the user
     that's how it works on a personal account.
6. **Vercel sign-in and scope.** `vercel whoami` and `vercel teams ls`.
   Show the account and teams and ask which scope the project goes in.
   Never guess.
7. **Commit identity.** Commits must use an email Vercel recognizes, or
   Vercel **blocks the deploy**. Get the Vercel account's email:
   `node <plugin>/shared/scripts/vercel-check.mjs account`. Ask what name and
   email commits in this project should use, offering the Vercel email as
   the default. If the user picks a different email (for example the one
   in `git config --global user.email`), warn that Vercel may block
   deploys unless that email is also on their Vercel account's linked
   GitHub account. Mention it will be visible in the repo's history if the
   repo is ever made public. It's set for this repo only, straight after
   the go-ahead.
8. **The name is free.**
   - GitHub: `gh repo view <owner>/<slug>` must fail with "Could not
     resolve to a Repository".
   - Vercel: `vercel project inspect <slug> --scope <scope>` must fail with
     "no project".
   - If either exists: ask whether to pick another slug (Name It can help)
     or, only if it's clearly this same project from an earlier run, reuse
     it. Never overwrite or link to someone else's project.

Then summarize the plan and get one "go ahead":

> Here's what I'll set up for **<Name>**, all free:
> - a private GitHub repo `<owner>/<slug>` with a project board
> - automatic checks (CI) on every change
> - a Vercel project in `<scope>` and a live starter page
>
> Commits will be from `<name> <email>`. This takes about 15-20 minutes,
> mostly waiting on installs and builds. Go ahead?

**As soon as they say yes, before anything else,** set the commit identity
for this repo only. Nothing may be committed before this:

```bash
git init -b main          # only if there's no .git/ yet
git config user.name "<name>"
git config user.email "<email>"
```

(The global identity is often a different email; that's how commits end
up with the wrong author.)

## 2. Scaffold the app

`create-next-app` won't scaffold into a folder whose name has capital
letters (npm package names can't), so scaffold into a lowercase temporary
subfolder and move everything up.

Say: "Creating the app. The install takes a few minutes."

```bash
npx --yes create-next-app@latest claim-it-tmp --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --use-npm --disable-git --yes
```

Move everything in `claim-it-tmp/` (including dotfiles like `.gitignore`)
up into the project folder, then delete `claim-it-tmp/`. Use the move
command for the shell you're in:

- bash: `shopt -s dotglob && mv claim-it-tmp/* . && rmdir claim-it-tmp`
- PowerShell: `Get-ChildItem -Force claim-it-tmp | Move-Item -Destination .; Remove-Item claim-it-tmp`

Next.js writes an `AGENTS.md` and a `CLAUDE.md` containing `@AGENTS.md`.
Keep `AGENTS.md`; the template `CLAUDE.md` keeps `@AGENTS.md` as its first
line.

## 3. Add the tests and the templates

Install the test tools. `create-next-app` pins `@types/node@^20`, which
fails Vitest's peer check on newer Node, so match `@types/node` to the
machine's Node major version:

```bash
npm install -D "@types/node@^<node major>" vitest @vitejs/plugin-react happy-dom @testing-library/react @testing-library/dom @testing-library/jest-dom @playwright/test
```

Then apply the templates (reads the name, slug and purpose from
`journey.json`):

```bash
node <skill-dir>/scripts/apply-templates.mjs
```

It writes the starter page and branding, the Vitest and Playwright configs
with one test each, `ci.yml`, `vercel.json` (only `main` deploys),
`.editorconfig`, `.gitattributes`, `.nvmrc`, `CLAUDE.md` and `README.md`,
adds the iter8-it lines to `.gitignore`, and sets the package name and the
`typecheck` / `test` / `test:e2e` scripts. Don't hand-edit these files to
get things passing: if a template is wrong, say so. The fix belongs in the
plugin.

## 4. Check it works locally

Run these in order. Each must pass before the next:

```bash
npm run build
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
```

- The first `npm test` after an install can be slow on Windows (antivirus
  scans the new files). If it times out, run it once more before treating
  it as a real failure.
- `npx playwright install chromium` downloads a browser (~150 MB) once per
  machine. Say so.
- `npm run test:e2e` starts the app itself and tests it on a desktop and a
  mobile screen size.

## 5. First commit

The identity was set right after the go-ahead. Check it's still this
repo's, then commit:

```bash
git config --local user.email     # must print the email from step 1
git add -A
git commit -m "Claim It: starter app for <Name>"
```

Check `git log -1 --format='%an <%ae>'` shows the right identity.

## 6. GitHub: repo, board, work item types

```bash
gh repo create <owner>/<slug> --<private|public> --source=. --push
```

This pushes `main`. The first CI run starts right away; step 7 watches it.

**Board:**

```bash
gh project create --owner <owner> --title "<Name>" --format json --jq '"number=\(.number) url=\(.url)"'
node <skill-dir>/scripts/board-status.mjs <owner> <number>
gh project link <number> --owner <owner> --repo <owner>/<slug>
node <skill-dir>/scripts/board-views.mjs <owner> <number>
```

`board-status.mjs` adds "Backlog" and "In Review" to the Status field. It only changes
an empty board, which a new one is.

`board-views.mjs` then adds the two standard views (run it after
`board-status.mjs`, so the Tracking Board's columns are the five
statuses):

- **Issue List**: a table of Title, Status and Sub-issues progress.
- **Tracking Board**: a board of Title, Assignees, Status, Linked pull
  requests and Sub-issues progress, with a column per status.

GitHub's API can create views but not delete them, so the default
"View 1" stays until the user deletes it (step 11 says how).

**Work item types** (from step 1):

- Org, missing types the user agreed to add: get the org's node ID with
  `gh api orgs/<owner> --jq .node_id`, then for each type:

  ```bash
  gh api graphql -f query='mutation($ownerId: ID!, $name: String!, $description: String!) {
    createIssueType(input: {ownerId: $ownerId, isEnabled: true, name: $name, description: $description}) {
      issueType { id name }
    }
  }' -f ownerId=<org-node-id> -f name="Story" -f description="A small deliverable to a persona, with acceptance criteria."
  ```

- Personal account: create the labels:

  ```bash
  gh label create epic --repo <owner>/<slug> --color 6f42c1 --description "A big area of the product"
  gh label create feature --repo <owner>/<slug> --color 1356cf --description "Something a persona can do"
  gh label create story --repo <owner>/<slug> --color 28a745 --description "A small deliverable to a persona"
  gh label create bug --repo <owner>/<slug> --color dc3545 --description "Something broken" --force
  ```

- Both: `gh label create later --repo <owner>/<slug> --color 6c757d --description "Not in the current plan"`.

Update `journey.json`:

```json
"github": {
  "owner": "<owner>",
  "repo": "<slug>",
  "project": <number>,
  "workItems": { "kind": "issue-types", "epic": "Epic", "feature": "Feature", "story": "<Story or Task>", "bug": "Bug" }
}
```

(For a personal account: `"kind": "labels"` and the label names.) Don't
commit yet; step 9 commits it with the Vercel details.

## 7. Watch CI go green

Say: "GitHub is now running the app's checks for the first time. This
takes about 3-5 minutes."

```bash
gh run list --repo <owner>/<slug> --branch main --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch <id> --repo <owner>/<slug> --exit-status
```

If it fails, `gh run view <id> --repo <owner>/<slug> --log-failed`, find
the cause and explain it in plain words. A failure here almost always
means a template problem: fix it in the project, and tell the user it
should also be fixed in the plugin. Don't move on until CI is green.

## 8. Vercel: create the project and connect GitHub

```bash
vercel link --yes --project <slug> --scope <scope>
```

This creates the Vercel project (it detects Next.js by itself) and writes
`.vercel/` (gitignored). It also appends `.vercel` to `.gitignore` even
though it's already there; if `git diff .gitignore` shows that, undo it
with `git checkout -- .gitignore`.

**Before connecting, check Vercel can see the repo:**

```bash
node <plugin>/shared/scripts/vercel-check.mjs visible <owner>/<slug>
```

- `VISIBLE`: go on.
- `NOT VISIBLE`: the Vercel GitHub App is limited to selected repos. Give
  the user the settings link the script prints and exactly what to do
  there. Wait for them to say it's done, then **run the check again**.
  Their first change doesn't always take; don't try to connect until the
  check says `VISIBLE`.

Then connect. It asks to confirm when the local `origin` matches, so pipe
`y`:

```bash
echo y | vercel git connect https://github.com/<owner>/<slug> --scope <scope>
```

Check the connection and the production branch:

```bash
node <plugin>/shared/scripts/vercel-check.mjs project <slug>
```

`git` must be `<owner>/<slug>` and `productionBranch` must be `main`. If
the production branch is anything else, ask the user to set it in the
Vercel dashboard: the project's Settings -> Environments -> Production ->
Branch Tracking -> `main`. Check again.

## 9. Go live

Connecting doesn't deploy anything by itself. Deploy by pushing to `main`.

Update `journey.json` `vercel.scope` and `vercel.project`, then:

```bash
git add -A
git commit -m "Claim It: connect GitHub board and Vercel"
git push
```

Say: "Vercel is building the live site. This takes 1-3 minutes."

Wait for the deployment of that commit:

```bash
node <plugin>/shared/scripts/vercel-check.mjs deployment <slug> $(git rev-parse HEAD)
```

If `state` is `ERROR`: `vercel inspect <url> --scope <scope> --logs`,
explain, fix, push again.

If its state is **BLOCKED**, Vercel didn't recognize the commit's author
email. Check `git log -1 --format='%ae'` against
`vercel-check.mjs account`. Fix the repo's `user.email`, then
`git commit --allow-empty -m "Claim It: redeploy"` and push. Don't rewrite
commits that are already pushed.

Get the production URL (`productionUrl`) from:

```bash
node <plugin>/shared/scripts/vercel-check.mjs project <slug>
```

It's often `https://<slug>.vercel.app`, but not always: Vercel adds a
suffix when that name is taken.

**Check it live**, running the end-to-end tests against the real site:

```bash
BASE_URL=<production url> npm run test:e2e
```

(PowerShell: `$env:BASE_URL="<production url>"; npm run test:e2e; Remove-Item Env:BASE_URL`.)

Both the desktop and mobile checks must pass.

## 10. Record it and create `dev`

- `journey.json`: `vercel.url` = the production URL, `stage` =
  `"claim-it"`.
- `CLAUDE.md`: replace the placeholder under **Links** with:

  ```markdown
  - Live: <production url>
  - Repo: https://github.com/<owner>/<slug>
  - Board: <project url>
  - Vercel: https://vercel.com/<scope>/<slug>
  ```

Commit and push to `main` ("Claim It: <Name> is live"). This redeploys the
same page, which is fine.

Then create `dev` from `main` and make it the default branch:

```bash
git switch -c dev
git push -u origin dev
gh repo edit <owner>/<slug> --default-branch dev
```

The local checkout stays on `dev`, where day-to-day work happens.

**Protect `main`:** nothing merges into `main` unless CI is green. Add a
ruleset (the check names are the job names in `ci.yml`):

```bash
gh api repos/<owner>/<slug>/rulesets --method POST --input - <<'JSON'
{
  "name": "main: CI must pass",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "Lint, typecheck, unit tests" },
          { "context": "End-to-end tests" }
        ]
      }
    }
  ]
}
JSON
```

- **It works:** set `journey.json` `github.mainProtected` to `true`.
- **It's refused with a message about upgrading or making the repo
  public:** GitHub only enforces this on public repos or paid plans. Set
  `github.mainProtected` to `false` and tell the user, plainly: "GitHub's
  free plan can't lock `main` on a private repo, so the iter8-it steps
  will enforce it instead: nothing goes live until the checks pass. Grow
  It can tell you about the paid option later." Don't suggest making the
  repo public to get around it; that's the user's call.

Commit `journey.json` to `dev` and push.

## 11. Hand off

Tell the user, in plain words:

- **It's live:** <production url>. Open it on your phone.
- **The code:** https://github.com/<owner>/<slug>. `dev` is where work
  happens; `main` is what's live.
- **The board:** <project url>. It's empty. Ideas go on it in Dream It.
  It has two views: **Tracking Board** (cards in columns) and **Issue
  List** (a table). One tidy-up only you can do: delete GitHub's default
  **View 1**: on the board, click the **▾** on the "View 1" tab, then
  **Delete view**.
- **Checks:** every change is tested automatically before it can go live.
- **Cost:** nothing so far.

Then offer the next step: "Next is **Meet It**: getting to know the people
who'll use <Name>. Want to start now?"

## Resuming

Claim It can stop partway (a failed check, the user stepping away). On a
rerun, work out what's already done and continue from the first thing
that isn't:

| Done if | Step |
|---|---|
| `package.json` exists and `.gitignore` contains `Added by iter8-it (Claim It)` | 2-3 (to re-apply templates on purpose: `apply-templates.mjs --force`) |
| `git log` has the "starter app" commit | 4-5 |
| `journey.json` `github.repo` is set and `gh repo view` works | 6 (check the board and types too) |
| The latest CI run on `main` is green | 7 |
| `.vercel/project.json` exists and `vercel-check.mjs project` shows `git` connected | 8 |
| `journey.json` `vercel.url` is set and the URL loads | 9 |
| `dev` exists on GitHub and is the default branch, and `github.mainProtected` is set | 10 |

Say what's already done before continuing: "The repo and board already
exist, so I'll pick up at connecting Vercel."

## Stop and ask if

- Any check in step 1 fails. Don't create anything.
- The GitHub owner, Vercel scope or commit identity hasn't been confirmed
  by the user.
- The slug is taken on GitHub or Vercel by something that isn't clearly
  this project.
- The folder holds files that aren't this project's.
- `board-status.mjs` refuses (the board isn't empty).
- Vercel still can't see the repo after the user says they fixed it
  twice.
- A local check, CI or the deploy fails and the cause isn't a clear
  template problem.
- Anything asks to set up a database, Supabase or Docker. That's Build It's
  job, and only when a story needs it.
