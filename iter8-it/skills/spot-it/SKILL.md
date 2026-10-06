---
name: spot-it
description: "Spot It — Find a real problem in your life or work that a simple app could fix. Where the iter8-it journey starts: turns a vague idea or itch into a clear problem statement in PRODUCT.md. Use when someone wants to start a new app, has an idea or a problem to explore, or says 'I want to build an app', 'I have an idea', 'where do I start', or 'spot it'."
---

# Spot It

**Part of the iter8-it journey.** Find a real problem in your life or
work that a simple app could fix.

Spot It is a conversation. It turns "I want to build an app that..." into
a few sentences about a **problem**: who has it, what happens today, why it
matters, and how you'd know it's solved. Everything later (the name, the
people, the features) is judged against this.

It works in an empty folder and creates nothing online. Someone can stop
after it with nothing to tear down.

## How to talk

- Warm, curious, plain. The user may never have built software. No
  jargon: say "the people who'd use it", not "users" or "stakeholders".
- **One question at a time.** Wait for the answer. Build on what they
  said, in their words.
- There may be **more than one person** at the keyboard (a partner, a
  co-founder). If answers come from two voices, welcome both, and check
  that they agree before writing anything down.
- Keep it short: this usually takes 10-20 minutes. Don't turn it into an
  interview for its own sake. When you have enough, stop asking.

## 0. Where are we?

Look at the current folder.

- **`PRODUCT.md` already has a Problem section:** this is a rerun. Show
  the problem as written and ask whether to sharpen it or start over.
  Keep everything else in the file.
- **The folder holds an existing app** (a `package.json`, source code,
  a git history): that's Adopt It's job, not Spot It's. Offer
  **Adopt It**, which brings an existing app onto the journey.
- **The folder has unrelated files** (another project, code that isn't
  this app's): say so and ask whether this is the right folder. A new app
  wants its own empty folder, named after the idea for now (it can be
  renamed later).
- **Empty** (or only `.git/`, `.vscode/`, `.claude/`): start.

## 1. The conversation

Start open: "What's the problem you'd like to fix? It can be something
from your life or your work, big or small."

Then fill in these, in whatever order the conversation goes:

1. **Who has the problem?** A real kind of person, as specific as
   possible: "presenters at meetups", not "everyone". Is the user one of
   them?
2. **What happens today?** How do they deal with it now: a workaround, a
   spreadsheet, a group chat, nothing?
3. **What goes wrong?** Where does it hurt: time lost, mistakes, stress,
   money, missing out? Ask for a recent, concrete example: "Tell me about
   the last time that happened."
4. **How often, and how many?** Daily or yearly? One person or many? A
   rare problem can still be worth fixing, but it changes what "simple"
   means.
5. **Why does it matter?** What changes for them if it's fixed?
6. **How would you know it's solved?** Something you could notice or
   count: "Nobody asks me for the slides afterwards", "Signing up takes
   one minute, not ten."

**Gently steer solution-first answers to the problem.** If they say "an
app that does X", ask what X would fix: "Say the app existed. What would
be different for them? What do they do today instead?" Their solution
idea is welcome; note it for Dream It, but don't let it replace the
problem.

**Ask whether an app is the right fix at all.** Sometimes a shared
spreadsheet, a form or an existing product does the job. Say so honestly
if it looks that way, and let them decide. If they want to build it
anyway, to learn, that's a fine reason.

## 2. Write it down

Draft the problem in **3-6 plain sentences**, in their words, covering
who, what happens today, what goes wrong, why it matters, and how they'll
know it's solved. Read it back:

> Here's the problem as I understand it:
>
> *Presenters at meetups share their slides as a link at the end, but
> most of the audience never opens it, and people at the back can't read
> the screen during the talk. ... We'll know it's solved when people in
> the audience can follow every slide on their phone, live.*
>
> Does that sound right? Anything to change?

Adjust until they say yes.

## 3. Save it

1. `git init -b main` if the folder isn't a git repo yet. **Don't commit
   anything**: Claim It sets the right commit identity first and makes the
   first commit.
2. `PRODUCT.md`, following `<plugin>/shared/product-template.md` (`<plugin>`
   is the iter8-it plugin folder, two levels up from this SKILL.md):

   ```markdown
   # (unnamed)

   ## Problem

   <the agreed problem statement>
   ```

3. `journey.json`: the starting value from
   `<plugin>/shared/journey-schema.md`, with `stage` = `"spot-it"`. On a
   rerun, only update the Problem section; keep `journey.json` as it is.

## 4. What next?

"Next is **Name It**: giving your project a name, which also forces us to
decide what it's really for. Shall we do that now?" Spot It, Name It and
Claim It often happen in one sitting.
