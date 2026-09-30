---
name: trim-it
description: "Trim It — Cut the list down to the smallest version someone would actually use. Step 6 of iter8-it: chooses the first version's Features, puts them on the board in order, labels the rest 'later', and records whether the app needs sign-in or a database. Use when someone wants to plan the first version, prioritize or order the backlog, or says 'trim it', 'what should we build first', or 'what's the MVP'."
---

# Trim It

**Step 6 of the iter8-it journey.** Cut the list down to the smallest
version someone would actually use.

Trim It turns Dream It's idea pile into a plan:

- the **first-version Features** go on the board, in Todo, **in the order
  to build them**;
- everything else gets the **`later`** label, with the reason in a
  comment;
- it records what the app **needs**: sign-in? stored data?

Nothing is built or set up here. Build It and Ship It act on the plan.

## How to talk

- Kind but firm. The question for every Feature is: **"Would anyone use
  the first version without this?"** If yes, it waits.
- Celebrate cutting. "Later" isn't "never"; it's "after people are using
  it and telling us what matters."
- One Feature at a time, briefly. Don't re-debate the whole list.

## 0. Where are we?

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md). Board helper: `<plugin>/shared/scripts/board.mjs` (run from the
project folder).

1. `journey.json` needs `github.*` (Claim It). Missing: offer Claim It.
2. The Features:

   ```bash
   gh issue list -R <owner>/<repo> --state open --limit 200 --json number,title,labels,issueType
   ```

   Keep the open Features (Issue Type or label `workItems.feature`). None:
   offer Dream It and stop.
3. **A rerun** (Grow It uses this too): some Features are already on the
   board or labelled `later`. Show both lists; the job is to adjust, not
   start over. Don't move anything that's In Progress or later in the
   board.

## 1. The first version's goal

Ask: "When the first version is live, what's the one thing someone should
be able to do from start to finish?" For SlideIt: "A presenter writes a
short deck and presents it, and the audience follows on their phones."

Write it down in a sentence; it's the test for every Feature.

## 2. Walk the list

For each Feature, grouped by Epic:

- Ask: "Would anyone use the first version without this?" Offer your view
  in a sentence when it helps.
- **In:** needed for the goal above.
- **Later:** nice, but the goal works without it. Note the reason in a few
  words ("Can share by copying the link for now").

Aim for the **fewest Features that make the goal work end to end**,
usually 3-7. If the list is long, say so and look for a smaller path.
Features can be made smaller too: "Presenter can edit slides" might become
"Presenter can paste a Markdown deck" for now.

## 3. Order the first version

Put the "in" Features in build order. Build first what the others depend
on, and **get something usable end to end as early as possible** (a thin
version of the whole journey beats one perfect piece). Show the order and
confirm.

## 4. What does it need?

Ask these explicitly and record the answers:

1. **"Do people sign in?"** (accounts, "my decks", anything private to a
   person) -> `needs.auth`
2. **"Does the app keep anything that must survive a refresh, or be
   shared between people?"** (saved decks, a live session others join)
   -> `needs.database`

- `auth` means a database too (Supabase handles both).
- `database` without `auth` still means Supabase, but confirm it: some
  apps only need a page that works in the browser, with nothing saved.
- Neither: say so plainly. "Great, no database: simpler and free forever."

Tell them what happens next: "When Build It reaches the first story that
saves data, it'll set up a database on your computer (Docker Desktop is
needed then). The first release after that creates the online database."

## 5. Save the plan

**Board**, first-version Features only:

```bash
node <plugin>/shared/scripts/board.mjs set <feature> Todo       # for each, in order
node <plugin>/shared/scripts/board.mjs order <f1> <f2> <f3> ...   # build order, top first
```

**Later** Features:

```bash
gh issue edit <n> -R <owner>/<repo> --add-label later
gh issue comment <n> -R <owner>/<repo> --body "Later: <reason>. (Trim It)"
```

(A later Feature that was on the board from an earlier trim: remove it
from the board only if it's still Todo; ask first.)

**`PRODUCT.md`**: add (or replace) the **First Version** section, following
`<plugin>/shared/product-template.md`:

```markdown
## First Version

<The goal sentence.> The first version includes <short list, in order>.
Out for now: <the main things labelled later>. The app needs sign-in: yes/no.
It stores data: yes/no.
```

**`journey.json`**: `needs` = `{ "auth": <bool>, "database": <bool>, "decidedIn": "trim-it" }`,
`stage` = `"trim-it"` if it was earlier.

Commit to `dev` and push:

```bash
git switch dev && git pull
git add PRODUCT.md journey.json
git commit -m "Trim It: first version planned"
git push
```

## 6. What next?

Show the board link (`journey.json` has the project number:
`https://github.com/orgs/<owner>/projects/<number>` for an org,
`https://github.com/users/<owner>/projects/<number>` for a personal
account). "Next is **Build It**: building the first Feature, one small
story at a time. Start now?"
