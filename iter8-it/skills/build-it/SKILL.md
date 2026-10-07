---
name: build-it
description: "Build It — Add the features one small piece at a time, checking each one as you go. Takes the next feature on the board, splits it into small stories, and builds them one at a time with tests, merging each into dev: one story, the whole feature, or everything in Todo, as the user chooses. Use when someone wants to work on the next feature or story, write code for their app, or says 'build the next thing', 'let's build', or 'work on #12'."
---

# Build It

**Part of the iter8-it journey.** Add the features one small piece at a
time, checking each one as you go.

Build It turns the next thing on the board into working, tested code on
`dev`, **one story at a time**: each story gets its own branch, PR,
checks and merge. At the start it asks how far to go this run (step 1).
Nothing goes live here; Ship It does that.

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
- `<plugin>/shared/supabase-auth.md`: adding sign-in (once).
- `<plugin>/shared/layouts.md`: the app layouts; the first story builds
  the chosen one's frame.

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
3. **How far this run?** Ask once, offering the default:

   > How far shall I go? **This feature** (all its stories, one after
   > another), **just one story**, or **everything in Todo**? I'll still
   > stop after each story so you can try it before it's merged.

   - **This feature** (default): every story of the current Feature.
   - **One story**: stop after the first merge.
   - **Everything in Todo**: carry on into the next Todo Feature when one
     is finished, until Todo is empty.

   Remember the answer for the rest of the run; step 8 uses it. Mention
   that each story takes a few minutes of checks on GitHub.
4. If the board has nothing in Todo: say so and offer **Trim It** to pick
   the next Features from the Backlog (or Dream It if the Backlog is
   empty too), or Ship It if `dev` has unreleased work. Build It never
   takes work straight from the Backlog.

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
- Needs **sign-in** and the app has no accounts yet (no `src/lib/auth.ts`):
  this story also adds them. Follow `<plugin>/shared/supabase-auth.md` on
  the story's branch (after the local database, if that's new too).
- Needs it and it's already set up: go on.
- Needs it but `needs` says the app doesn't: stop and ask. The plan
  changed; update `needs` in `journey.json` if the user agrees.

### The app's frame (first story)

If the app still has Claim It's starter page and no frame of its own
(no shared header/navigation in `src/components/`), this story also
builds the frame for the chosen layout: `journey.json` `layout.shape`,
described in `<plugin>/shared/layouts.md` (or, for `custom`, in
`PRODUCT.md`'s Layout section). The starter page then becomes either
the **placeholder front page** (`layout.frontPage` true: keep it, add a
"Get started" button into the app and a short "Who it's for" line, as in
"The front page" in layouts.md) or the app itself (no front page). Follow its "First story builds" line and the
**Building** section there. Keep the Iter8 credit in the footer unless
the user removed the branding.

No layout chosen yet (Trim It ran before layouts existed, or was
skipped): pick one now, following the **Choosing** section of
`layouts.md`, and record it in `journey.json` and `PRODUCT.md` on this
story's branch.

Tell the user in a sentence: "This first story also builds the app's
frame, the <layout> layout, so later features slot into it."

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
  `npx supabase db diff -f <name>`, and applied locally with
  `npm run db:migrate` (`supabase migration up --local`), which keeps the
  data already there, as production will. **Never reset the local
  database** (`db reset`) as part of a story: only if the user asks, or
  it's genuinely stuck, and ask first, since it wipes their local data.
  Add before you remove: production runs the old code against the new
  schema for a moment during Ship It, so never drop or rename something
  the current live code uses. See `<plugin>/shared/environments.md`.
- **American English spelling** in everything the app shows (and in
  comments): color, center, gray, organize, canceled.
- **Looks come from the skin.** Use the `brand-*` color classes,
  `rounded-brand` and the fonts from `layout.tsx`; never hard-code colors
  (`bg-white`, `text-gray-500`, hex values). A new reusable piece (a
  card, a badge, a list row) gets a small example on `/style-guide` too.
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

All must pass. **The local `test:e2e` run is the story's end-to-end check**:
CI runs only the quick checks on PRs into `dev`, and the end-to-end tests
run in CI at release time. Never open the PR without it passing here.

Then **self-review**: read the whole diff
(`git diff dev...`) against the acceptance criteria. Look for leftover
debug code, missing tests, anything hard-coded that shouldn't be, and
anything outside the story's scope.

**Let the user try it: this is the approval.** Offer: "Want to try it
yourself? Run `npm run dev` and open http://localhost:3000 (on your
phone too, if it's for mobile: use your computer's network address).

**On a phone** (same Wi-Fi): `npm run dev` prints a **Network** address
(`http://192.168.x.x:3000`); that's the one to open. The first time,
Windows may ask whether Node.js can use the network: allow it on private
networks. If the page loads but buttons or forms do nothing, or sign-in
links land on `127.0.0.1`, the app is missing the network setting in
`next.config.ts`: `allowedDevOrigins` must include
`"127.0.0.1", "192.168.*.*", "10.*.*.*", "172.*.*.*"` (Claim It's
template has it; older apps may not). Add it (merge with whatever the
file already has), restart `npm run dev`, and it works from both
addresses.
When it looks good, say so and I'll open the PR and merge it into `dev`
once the checks pass." Adjust from their feedback until they approve.
Their "looks good" covers the merge: Build It doesn't ask again (step 7).
If they'd rather skip trying it, ask for a plain "go ahead" instead.

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

Say: "The automatic checks are running on GitHub. About a minute."
If a check fails: `gh run view <run-id> --log-failed`, explain the cause
simply, fix it, push, and watch again.

## 7. Merge into `dev`

The user approved the story at the try-it pause (step 5), so **merge as
soon as the checks are green**, without asking again:

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
- Tell the user in one line: "Merged #<pr> into `dev`. It goes live with
  the next Ship It."

**Ask before merging instead** if anything changed after their approval
(a fix needed to get the checks green, say): show what changed in a
sentence or two and get a fresh "looks good". Never merge with failing
checks.

## 8. Next story, or stop

Go round again (back to step 2, for the next story) while the run's scope
allows:

| Scope | Carry on with | Stop when |
|---|---|---|
| One story | nothing | after this merge |
| This feature | the Feature's next unmerged story | all its stories are merged |
| Everything in Todo | the next story; when a Feature is done, the top Todo Feature | Todo is empty |

Between stories, say in one line what was merged and what's next ("#14
merged. Next: #15, *Audience member sees the current slide*."), and
carry on. The user can say "stop" at any pause (the try-it check, the
approval at the try-it pause); finish cleanly at the next safe point (nothing half
done: the current story merged, or its branch pushed and left In
Progress).

**Always stop early**, whatever the scope, when:

- checks fail and the fix isn't clearly part of the story;
- something needs the user's decision (a new database or sign-in need,
  a destructive migration, a story that should be split differently);
- the next story needs something that isn't available (Docker not
  running, say).

When the run ends, sum up what was merged, then offer, with a
recommendation:

- **Keep building** (name the next story or Feature), or
- **Ship what's on `dev`** now, so people can use it.

Recommend shipping when a persona can do something useful end to end, or
when 3 or more stories are waiting. Small, frequent releases are easier to
check and to undo. If Todo is now empty, offer Trim It to pick what's
next.

## Stop and ask if

- `journey.json` is missing what Claim It sets up.
- There are uncommitted changes you didn't make.
- The story needs a database but Docker isn't available.
- A story would need to remove or rename something the live app uses.
- Checks keep failing for a reason outside the story.
- The user wants to skip tests or merge with failing checks. Explain why
  not; if they insist, it's their call, but note it on the PR.
