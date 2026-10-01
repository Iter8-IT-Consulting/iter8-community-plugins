---
name: trim-it
description: "Trim It — Cut the list down to the smallest version someone would actually use, and keep the board groomed after that. Step 6 of iter8-it: moves the chosen Features from Backlog to Todo in build order, parks or drops the rest, and records whether the app needs sign-in or a database. Rerun it any time to groom: pick what's next, reorder, park or drop ideas. Use when someone wants to plan the first version or the next batch, prioritize or reorder the backlog, groom the board, or says 'trim it', 'what should we build next', or 'what's the MVP'."
---

# Trim It

**Step 6 of the iter8-it journey.** Cut the list down to the smallest
version someone would actually use.

The board has five columns:

```
Backlog -> Todo -> In Progress -> In Review -> Done
```

Dream It puts every idea in **Backlog**. Trim It decides what moves to
**Todo** (ready to build, top = next) and in what order. It's also the
**grooming** step: rerun it whenever Todo is getting short, new ideas
have piled up, or priorities have changed.

For each Feature in Backlog, one of:

| Decision | What happens |
|---|---|
| **Next** | Moves to Todo, in build order. |
| **Later** | Stays in Backlog with the `later` label and the reason in a comment. |
| **Never** | Closed as "not planned", with the reason in a comment. It drops off the board and can be reopened. |
| **Not decided** | Stays in Backlog, no label. Fine for new ideas nobody's thought about yet. |

Nothing is built or set up here. Build It and Ship It act on the plan.

## How to talk

- Kind but firm. The test for every Feature is: **"Would anyone miss
  this in the next version?"** For the first version: "Would anyone use
  it without this?" If they would, it waits.
- Celebrate cutting. "Later" isn't "never"; it's "after people are using
  it and telling us what matters."
- One Feature at a time, briefly. Don't re-debate the whole list.

## 0. Where are we?

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md). Board helper: `<plugin>/shared/scripts/board.mjs` (run from the
project folder).

1. `journey.json` needs `github.*` (Claim It). Missing: offer Claim It.
2. Read the board: `node <plugin>/shared/scripts/board.mjs list`.
   Also look for open Features that aren't on the board at all (created
   before the Backlog column existed, or by hand):
   `gh issue list -R <owner>/<repo> --state open --limit 200 --json number,title,labels,issueType`.
   Put any such Feature in Backlog first (`board.mjs set <n> Backlog`).
3. Nothing in Backlog: offer Dream It and stop.
4. Which kind of trim is this?
   - **First trim**: `PRODUCT.md` has no **First Version** section. Do
     every step below.
   - **Grooming** (any later run): show the board in a few lines (what's
     in Todo, In Progress and In Review, how many in Backlog and how many
     of those are `later`). Ask what prompted it: Todo running low, new
     ideas, or a change of plan. Skip steps 4 and 5 unless the needs
     changed or there's no layout yet.

Never move or reorder anything that's In Progress, In Review or Done.

## 1. The goal

**First trim:** "When the first version is live, what's the one thing
someone should be able to do from start to finish?" For SlideIt: "A
presenter writes a short deck and presents it, and the audience follows
on their phones."

**Grooming:** "What should the next release let people do that they
can't today?" Use what's been learned: feedback, bugs, what people
actually use (ask; Grow It will gather this more fully later).

Write the goal down in a sentence. It's the test for every Feature.

## 2. Walk the Backlog

Go through the Backlog Features, grouped by Epic. Look again at the
`later` ones too: say briefly why each was parked and ask whether that's
still true.

For each: **next**, **later** (with a reason in a few words: "Can share
by copying the link for now"), **never** (with a reason), or **not
decided**. Offer your view in a sentence when it helps.

Aim for the **fewest Features that make the goal work end to end**,
usually 3-7. Features can be made smaller too: "Presenter can edit
slides" might become "Presenter can paste a Markdown deck" for now (edit
the Issue's title and description, and note the smaller scope).

## 3. Order Todo

Put the Todo Features (those already there plus the new ones) in build
order. Build first what the others depend on, and **get something usable
end to end as early as possible**: a thin version of the whole journey
beats one perfect piece. Show the order and confirm.

## 4. What does it need?

First trim (and whenever a newly chosen Feature changes the answer). Ask
these explicitly:

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

## 5. The layout

First trim only (and whenever `journey.json` has no `layout` yet).
Now that the people and the first version are known, choose the app's
overall shape: the page frame and navigation that features slot into.
Read `<plugin>/shared/layouts.md` and follow its **Choosing** section:
recommend one layout with a one-sentence reason (and a runner-up if it's
close), show the others in a line each, and let the user pick, or
describe their own (`custom`). Then, as its own question, recommend yes
or no on a public **front page** (see "The front page" in layouts.md). If
yes and no Feature covers it, create one ("Visitor can see what <Name> is
and get started", for the persona who arrives first) and decide with the
user where it goes in Todo.

Explain why it matters, briefly: "Picking a shape now means every feature
lands in the same frame, instead of each one inventing its own."

## 6. Save it

**Board:**

```bash
node <plugin>/shared/scripts/board.mjs set <feature> Todo         # each Feature moving to Todo
node <plugin>/shared/scripts/board.mjs order <f1> <f2> <f3> ...   # all of Todo, in build order, top first
```

A Todo Feature that's been pushed out of the plan goes back:
`board.mjs set <n> Backlog`, and gets the `later` label.

**Later:**

```bash
gh issue edit <n> -R <owner>/<repo> --add-label later
gh issue comment <n> -R <owner>/<repo> --body "Later: <reason>. (Trim It)"
```

A `later` Feature that's now next: `gh issue edit <n> --remove-label later`,
then move it to Todo as above.

**Never:**

```bash
gh issue close <n> -R <owner>/<repo> --reason "not planned" --comment "Not planned: <reason>. (Trim It)"
```

**`PRODUCT.md`**, first trim: add the **First Version** section and, after
it, the **Layout** section, following `<plugin>/shared/product-template.md`:

```markdown
## First Version

<The goal sentence.> The first version includes <short list, in order>.
Out for now: <the main things labelled later>. The app needs sign-in: yes/no.
It stores data: yes/no.

## Layout

**<Layout name>**: <its one-line description>. <One sentence on why it fits
these people.> (For `custom`: the description the user gave, in the same
shape as layouts.md: fits / desktop / phone / first story builds.)

**Front page:** yes / no. <One sentence on why.>
```

Grooming: leave First Version as it is once it's live (it's history);
the board and Issues carry the plan from then on.

**`journey.json`**, first trim: `needs` =
`{ "auth": <bool>, "database": <bool>, "decidedIn": "trim-it" }`,
`layout` = `{ "shape": <single-tool | app-nav | mobile-tabs | two-sided | custom>, "frontPage": <bool> }`,
and `stage` = `"trim-it"` if it
was earlier. Grooming: update `needs` only if
it changed.

Commit any file changes to `dev` and push:

```bash
git switch dev && git pull
git add PRODUCT.md journey.json
git commit -m "Trim It: <first version planned | next batch planned>"
git push
```

## 7. What next?

Show the board link (`journey.json` has the project number:
`https://github.com/orgs/<owner>/projects/<number>` for an org,
`https://github.com/users/<owner>/projects/<number>` for a personal
account), and point out that cards can be dragged between Backlog and
Todo, and reordered, by hand at any time. Then: "Next is **Build It**:
building the top Feature in Todo, one small story at a time. Start now?"
