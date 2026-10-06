---
name: meet-it
description: "Meet It — Get to know the people who will use it: what they're trying to get done and what frustrates them today. Part of iter8-it: defines 1-3 personas in PRODUCT.md, including the devices and settings they use. Use when someone wants to define their users or personas, or says 'meet it', 'who is this for', or 'who will use this'."
---

# Meet It

**Part of the iter8-it journey.** Get to know the people who will use
it: what they're trying to get done and what frustrates them today.

Meet It describes **1-3 personas**: kinds of people, each with a name, what
they're trying to get done, what frustrates them today, and their context
(device, setting, how rushed or expert they are). Every feature and story
later is written *for* one of them, so they need to feel real.

## How to talk

- Curious and concrete. Ask about real people they know: "Think of
  someone who has this problem. What's their day like?"
- One question at a time. If two people are at the keyboard, draw on
  both; they may know different users.
- Plain words: "the people who'd use it", "a kind of person". Introduce
  "persona" once, simply: "We'll call each kind of person a persona."

## 0. Where are we?

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md).

- `PRODUCT.md` needs a Problem and a name (Spot It, Name It). Missing:
  offer those steps and stop.
- It works before or after Claim It. After Claim It (`journey.json`
  `github.repo` set), the result is committed to `dev`.
- A **People** section already exists: a rerun, usually because using
  the app taught them something (Grow It, What's Next and Ship It suggest
  it). Show the personas and ask what's changed: someone new turned up,
  someone isn't who we thought, or someone doesn't matter any more.
  - **Adjust**: update their description; keep their name if possible
    (Issues are tagged with it).
  - **Retire** (after the first version, prefer this to deleting):
    move them under a short "### No longer the focus" note in People
    with the reason, keep their `persona:` label, and mention that Trim
    It can park their Backlog Features.
  - **Start over** only before anything's been built.

## 1. Who are they?

Read the Problem back in a sentence. Then:

1. "Who are the different kinds of people involved?" The problem often
   has more than one side: someone who creates and someone who consumes
   (a presenter and the audience), someone who asks and someone who
   approves. List them.
2. Keep **1-3** that the first version is really for. Others can wait;
   say so.

## 2. For each persona

Ask, one at a time:

- **A name** that says who they are: "Presenter", "Audience Member",
  "Coach". (A role, not a made-up person's name.)
- **Trying to get done:** what they want to achieve, in their terms.
- **Frustrations today:** what goes wrong for them now. Link back to the
  Problem.
- **Context:** where they are and what they're holding when they'd use
  the app: at a desk on a laptop, standing in a crowd on a phone, in a
  hurry, skilled or new to this. **Ask about the device explicitly.** It
  decides whether each part of the app is designed phone-first or
  desktop-first.

Read each persona back and adjust until the user recognizes them.

## 3. Save it

`PRODUCT.md`: add (or replace) the **People** section after Problem,
following `<plugin>/shared/product-template.md`:

```markdown
## People

### Presenter
- Trying to get done: give a talk where everyone can follow the slides.
- Frustrations today: people at the back can't read the screen; nobody
  opens the slides link afterwards.
- Context: prepares on a laptop at home; presents from a laptop on stage.
```

**Devices for testing.** The end-to-end tests run on the device types in
`playwright.config.ts` (`desktop` and `mobile` to start). If a persona
uses something else (a tablet, say), add a project for it (for example
`{ name: "tablet", use: { ...devices["iPad (gen 7)"] } }`; Chromium-based
devices keep CI to one browser download), and run `npm run test:e2e` to
check it passes. If nobody uses one of the two, leave it anyway: it's
cheap and catches layout bugs.

**`README.md`**: the **Who it's for** section (right under the title and
purpose line) lists each persona with a link to their full description,
so anyone opening the repo finds them first. Replace the section's
contents, or add the section there if it's missing:

```markdown
## Who it's for

- **[Presenter](PRODUCT.md#presenter)**: give a talk everyone in the room can follow.
- **[Audience Member](PRODUCT.md#audience-member)**: follow the slides on their phone, live.
```

The link is the persona's heading in `PRODUCT.md`, lowercased, with spaces
as hyphens. The one-liner is their "trying to get done", shortened.

`journey.json`: `stage` = `"meet-it"` if it was earlier.

**After Claim It**, commit to `dev` and push (this is a plan change, not
code, so no PR is needed):

```bash
git switch dev
git pull
git add PRODUCT.md README.md journey.json playwright.config.ts
git commit -m "Meet It: the people <Name> is for"
git push
```

Before Claim It, don't commit; Claim It makes the first commit.

## 4. What next?

After Claim It, point them to where the personas live: the repo's front
page (`https://github.com/<owner>/<repo>`), whose README now opens with
**Who it's for**, linking to the full descriptions in `PRODUCT.md`. (`PRODUCT.md` stays the source: skills
read it every time, and it's versioned with the code.)

**First time:** "Next is **Dream It**: getting every feature idea for
these people out of your heads and onto the table. Ready?" Meet It, Dream
It and Trim It often happen in one sitting.

**A rerun that added someone:** a new persona has no Features yet. Offer
**Dream It focused on them** ("What would <new persona> love to be able
to do?"), then **Trim It** to decide whether any of it belongs in the
next release. Also check the existing Backlog and Todo Features: does
any of them serve the new persona too? If so, add their `persona:`
label (`gh issue edit <n> --add-label "persona:<name>"`, creating the
label first if it doesn't exist).

**A rerun that changed or retired someone:** offer **Trim It**, since
priorities may have shifted.
