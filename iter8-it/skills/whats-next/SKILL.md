---
name: whats-next
description: "What's Next — Where am I in the iter8-it journey, and what should I do next? Looks at the project's files, board and releases and recommends one next step. Use when someone asks 'what's next', 'where am I', 'what should I do now', 'where were we', comes back to a project after a break, or seems unsure which step to run."
---

# What's Next

**A helper for the iter8-it journey.** It answers "where am I, and what
should I do next?" in a few lines, and offers to start that step.

It only reads; it never changes anything.

## 1. Gather the facts

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md). From the project folder:

```bash
node <plugin>/shared/scripts/status.mjs
```

It reports (as JSON):

- `plugin`: the installed iter8-it version;
- `product`: which `PRODUCT.md` sections exist;
- `journey`: the stage, live URL, needs, database and last release;
- `git`: the current branch, uncommitted changes, and `unreleasedCommits`
  (on `dev`, not yet live);
- `openPullRequests`;
- `board`: how many Features are in Backlog; the Todo, In Progress and In
  Review items; and how many are Done;
- `laterIdeas`: Features labelled `later`.

No `PRODUCT.md` and no `journey.json`: this folder hasn't started the
journey. If it's **empty**, recommend **Spot It** (a new idea). If it
already holds an **app** (a `package.json`, a git history), recommend
**Adopt It**, the way in for existing apps. Or ask if they meant another
folder.

## 2. Decide

Go down this list and stop at the **first** match. That's the
recommendation.

| # | If | Recommend |
|---|---|---|
| 1 | No Problem in `PRODUCT.md` | **Spot It** |
| 2 | Still `# (unnamed)`, or no `name` in `journey.json` | **Name It** |
| 3 | No live URL (`journey.liveUrl` is null) | **Claim It** |
| 4 | Uncommitted changes, or a story In Progress | **Build It**, to finish that story (name it) |
| 5 | An open PR into `dev` | **Build It**, to finish that PR (checks, merge) |
| 6 | An open PR into `main` | **Ship It**, to finish that release |
| 7 | No People in `PRODUCT.md` | **Meet It** |
| 8 | No Features at all (nothing on the board) | **Dream It** |
| 9 | No First Version in `PRODUCT.md`, or `needs` not decided | **Trim It** |
| 10 | Unreleased commits, and either 3+ stories In Review or the last Todo item of the first version is merged | **Ship It** (strongly) |
| 11 | Unreleased commits | **Build It** for the next item, *or* Ship It. Recommend shipping if a person can now do something useful end to end. |
| 12 | Items in Todo | **Build It**: the top Todo item (name it). If it's the *last* Todo item and the Backlog has ideas, add: "After this, Todo is empty; a quick Trim It will pick what's next." If there have been **2+ releases since Trim It last ran** (`git log --oneline --grep "Trim It" -1` vs. `gh release list`), add the outer-loop nudge below. |
| 12a | `journey.skin` is `null`, and at least one release has gone out | Whatever row 12 says, plus one line: "Your app still wears the starter look. When you know what you want, **Skin It** shows you a few directions." (Never instead of building.) |
| 13 | Nothing in Todo, but ideas in Backlog | **Trim It**, to groom: pick the next Features from the Backlog |
| 14 | Nothing in Todo, In Progress, In Review or Backlog | **Grow It** (see below) |

Some steps can run out of order (Meet It before Claim It, say); if the
facts show that happened, don't send them back. Only recommend a step
whose inputs are missing if it's genuinely next.

**The two loops.** After Claim It, the journey runs in two loops:

```
Meet It -> Dream It -> Trim It      (outer: what to build, and for whom)
Build It <-> Ship It, with Fix It   (inner: build and release)
```

What's Next mostly keeps people in the inner loop. **The outer-loop
nudge** is one extra line after the recommendation, when real use may
have taught them something: "You've released twice since you last
looked at your people and ideas. When there's a moment: new kinds of
people using it? **Meet It**. New ideas? **Dream It**. Then **Trim It**
to choose."

**A custom domain** (the app on its own address, e.g. `slideit.apps.iter8.community`): if the user asks for one, or a Todo item is about it, follow `<plugin>/shared/custom-domain.md`.

**Grow It isn't built yet.** For row 14, ask what they've learned from
people using the app, then recommend: **Meet It** if new kinds of people
have turned up (or someone isn't who we thought), otherwise **Dream It**
(new ideas) then **Trim It** (reconsider the `later` ideas and plan the
next batch). Mention that Grow It will guide this more fully in a later
version.

## 3. Tell them

Keep it short: where they are (two or three lines), then **one**
recommendation with the reason, then an offer. End with the plugin
version in small print ("_iter8-it 0.14.3_"), so people can tell which
version they are running.

> **Plug Test** is live at https://itplug-test-1.vercel.app (v0.1.0).
> One story is merged but not live yet (*Visitor can read the guestbook*),
> and you're partway through *Visitor can sign the guestbook*, with
> unsaved changes on its branch.
>
> **Next: finish that story with Build It.** Then both guestbook stories
> can go live together with Ship It.
>
> Start Build It now?

If they say yes, run that step's skill.
