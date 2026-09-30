---
name: build-it
description: "Build It — Add the features one small piece at a time, checking each one as you go. Takes the next feature on the board, splits it into small stories, builds one story with tests, and merges it into dev. Use when someone wants to work on the next feature or story, write code for their app, or says 'build the next thing', 'let's build', or 'work on #12'."
---

# Build It

**Step 7 of the iter8-it journey.** Add the features one small piece at a
time, checking each one as you go.

Build It turns the next thing on the board into working, tested code on
`dev`. It does **one story per run**, then offers the next story or Ship
It. Nothing goes live here; Ship It does that.

```
board (Todo) -> story -> feature/<issue>-<slug> -> PR -> dev
```

## How to talk while doing this

- The user is probably not a developer. Explain what you're building in
  terms of what the person using the app will be able to do, not in terms
  of files and functions. Show code only if they ask.
- One question at a time. Offer a sensible default.
- Before anything slow (CI, a long test run), say what you're waiting on
  and roughly how long.

## Files and scripts

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md).

- `<plugin>/shared/scripts/board.mjs`: `list [--status "<status>"]` (board
  items, top first), `set <issue> "<status>"`, `order <issue>...`. Run it
  from the project folder; it reads `journey.json`.
- `<plugin>/shared/conventions.md`: work item hierarchy, labels, statuses,
  branch names, PR rules.
- `<plugin>/shared/environments.md`: branches, environments, migrations.
- `<plugin>/shared/supabase-local.md`: adding the local database (once).

## 0. Where are we?

1. Read `journey.json`. If `github.repo` or `vercel.url` is missing, Claim
   It hasn't run. Say so, offer to run it, and stop.
2. Read `PRODUCT.md` for the people (personas) and the first version. If
   there's no People section, say that Build It works best once Meet It has
   run, and ask whether to continue anyway.
3. The type names for stories etc. are in `journey.json`
   `github.workItems` (for example `story` may be `Task`). Always use those
   names.
4. Get the local copy up to date and clean:

   ```bash
   git status --short        # must be empty; if not, ask what to do with the changes
   git switch dev
   git pull
   ```

## 1. Pick the work

1. **Unfinished work first.**
   `node <plugin>/shared/scripts/board.mjs list --status "In Progress"`.
   If a story is In Progress, offer to carry on with it: find its branch
   (`git branch -a --list "*feature/<n>-*"`) and continue at step 4.
2. Otherwise, the item the user named, or the **top** Todo item:
   `node <plugin>/shared/scripts/board.mjs list --status Todo`.
   Say which one and why: "Next on the board is #12, *Presenter can upload
   slides*. Shall we build that?"
3. If the board has nothing in Todo: say so and offer Trim It (to plan the
   next features) or Ship It (if `dev` has unreleased work).

## 2. Split a Feature into stories

If the item is a **Story**, skip to step 3.

If it's a **Feature**, check for existing stories:
`gh api repos/<owner>/<repo>/issues/<n>/sub_issues --jq '.[] | "#\(.number) \(.state) \(.title)"'`.

- **It has open stories:** pick the first one that isn't merged yet (on
  the board: Todo, or not on the board at all) and go to step 3.
- **It has none:** draft 1-5 stories. Each one is:
  - **small**: a few hours of work, one PR;
  - **a deliverable to a named persona**: something they can do or see,
    never "set up the database" or "create the API" (setup work goes
    inside the first story that needs it);
  - **checkable**: 2-5 acceptance criteria, written so someone could try
    them in the app.

  Show the drafts in plain language and ask for changes. Once agreed,
  create each one in order:

  ```bash
  gh issue create -R <owner>/<repo> --type "<workItems.story>" --parent <feature-number> \
    --title "<Persona> can <do something>" --body-file <file>
  ```

  (Personal accounts: `--label <workItems.story>` instead of `--type`.)
  Story body:

  ```markdown
  **For:** <Persona>

  <Persona> wants to <goal>, so that <why it matters to them>.

  ### Acceptance criteria
  - [ ] <something they can do or see>
  - [ ] ...

  ### Notes
  <device/context from PRODUCT.md, anything out of scope>
  ```

  Put the stories on the board in Todo, and order them first among the
  Todo items so the board reads top-down:
  `board.mjs set <story> Todo` for each, then
  `board.mjs order <story1> <story2> ...`.

Pick the first story.

## 3. Does this story need a database or sign-in?

It does if it needs anything saved that survives a refresh, anything
shared between people, or anyone to sign in. `journey.json` `needs` says
what Trim It decided.

- Needs it and `supabase.local` is `false`: this story is the first. Tell
  the user: "This is the first story that saves data, so it'll also set up
  a database on your computer. That needs Docker Desktop." Then follow
  `<plugin>/shared/supabase-local.md` **on the story's branch** (after step
  4 creates it), so the setup lands in this story's PR.
- Needs it and it's already set up: go on.
- Needs it but `needs` says the app doesn't: stop and ask. The plan
  changed; update `needs` in `journey.json` if the user agrees.

## 4. Start the story

```bash
node <plugin>/shared/scripts/board.mjs set <story> "In Progress"
node <plugin>/shared/scripts/board.mjs set <feature> "In Progress"   # if it isn't already
git switch -c feature/<story>-<short-slug>
```

`<short-slug>`: 2-5 lowercase words from the title, joined with hyphens.

If `journey.json` `stage` is before `build-it`, set it to `build-it` on
this branch; it goes in with the story.

## 5. Build it

Work in small steps, keeping the app working after each one.

- **Read the Next.js docs that ship with the project** before using an API
  you're not sure of (`AGENTS.md` explains; this Next.js may be newer than
  you know).
- **Tests:**
  - unit tests (Vitest, `*.test.tsx` next to the code) for logic and
    components;
  - an end-to-end test (Playwright, `e2e/`) for each user-facing
    acceptance criterion, on the device project(s) the persona uses
    (`desktop`, `mobile`; see the persona's context in `PRODUCT.md`).
- **Data access** goes through `src/repositories/` using `supabase-js`
  (see `supabase-local.md`), never raw queries scattered in components.
- **Schema changes** are migration files in `supabase/migrations/`, made
  with `npx supabase migration new <name>` or
  `npx supabase db diff -f <name>`, and checked with `npx supabase db reset`.
  Add before you remove: production runs the old code against the new
  schema for a moment during Ship It, so never drop or rename something
  the current live code uses. See `<plugin>/shared/environments.md`.
- **No secrets in the code.** Keys go in `.env.local` (gitignored); names
  go in `.env.example`.

When it's built, run everything, in order:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

**If port 3000 is busy**, check whose server it is: open
http://localhost:3000 and compare the page title with this app's name.

- **This app** (the user trying the story with `npm run dev`): just run
  `npm run test:e2e`. Locally, the tests reuse that server, which is
  what you want. (Next.js allows only one dev server per project folder,
  so a second one on another port won't start.)
- **Another app:** run the tests on a free port instead:
  `E2E_PORT=3100 npm run test:e2e`. Don't stop the other app without
  asking.

All must pass. Then **self-review**: read the whole diff
(`git diff dev...`) against the acceptance criteria. Look for leftover
debug code, missing tests, anything hard-coded that shouldn't be, and
anything outside the story's scope.

**Let the user try it.** Offer: "Want to try it yourself? Run
`npm run dev` and open http://localhost:3000 (on your phone too, if it's
for mobile: use your computer's network address)." Adjust from their
feedback before opening the PR.

## 6. Pull request into `dev`

Commit in sensible steps (messages say what changed for the user), then:

```bash
git push -u origin HEAD
gh pr create --base dev --title "<story title>" --body-file <file>
```

PR body:

```markdown
Refs #<story>

<What the persona can do now, in a sentence or two.>

### Acceptance criteria
- [x] <criterion> (how it's tested: unit / e2e desktop / e2e mobile)

### How it was checked
lint, typecheck, unit, build, e2e all pass locally.
```

Use `Refs`, not `Closes`: the story stays open until Ship It puts it live.

```bash
node <plugin>/shared/scripts/board.mjs set <story> "In Review"
gh pr checks <pr> --watch --fail-fast
```

Say: "The automatic checks are running on GitHub. About 3-5 minutes."
If a check fails: `gh run view <run-id> --log-failed`, explain the cause
simply, fix it, push, and watch again.

## 7. Merge into `dev`

When the checks are green, summarize what the story does and ask: "Merge
it into `dev`? It won't be live until we run Ship It." On yes:

```bash
gh pr merge <pr> --squash --delete-branch
git switch dev
git pull
```

Then:

- Comment on the story:
  `gh issue comment <story> --body "Merged to dev in #<pr>. Goes live with the next release (Ship It)."`
- The story **stays In Review** (merged, not live). Don't close it.
- If every story under the feature is now merged, set the feature to
  In Review too.

## 8. What next?

Offer both, with a recommendation:

- **Build the next story** (name it), or
- **Ship what's on `dev`** now, so people can use it.

Recommend shipping when a persona can do something useful end to end, or
when 3 or more stories are waiting. Small, frequent releases are easier to
check and to undo.

## Stop and ask if

- `journey.json` is missing what Claim It sets up.
- There are uncommitted changes you didn't make.
- The story needs a database but Docker isn't available.
- A story would need to remove or rename something the live app uses.
- Checks keep failing for a reason outside the story.
- The user wants to skip tests or merge with failing checks. Explain why
  not; if they insist, it's their call, but note it on the PR.
