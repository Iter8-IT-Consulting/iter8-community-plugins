# `PRODUCT.md` template

`PRODUCT.md` lives at the root of every project built with iter8-it and is
committed. It's the human-readable source of truth for **what** the product
is and **who** it's for. Skills fill it in section by section; the comment
after each heading says which step owns it.

`CLAUDE.md` points to this file and must not duplicate it. The feature list
itself lives on the GitHub board, not here.

## Skeleton

```markdown
# <Display Name>

<one-line purpose>

## Problem
<!-- Spot It -->
Who has it, what happens today, why it matters, how we'll know it's solved.

## People
<!-- Meet It -->

### <Persona name>
- Trying to get done: ...
- Frustrations today: ...
- Context: device, setting, skill level (e.g. "on a phone, in an audience")

## First Version
<!-- Trim It -->
The goal of the first version in a paragraph, what's explicitly out (for
now), and what the app needs (sign-in? stored data?).

## Layout
<!-- Trim It -->
The app's overall shape, from shared/layouts.md (or described by the
user), and why it fits these people. Whether it has a public front page,
and why.

## What it does today
<!-- Ship It, every release (Adopt It drafts the first) -->
_Updated with v1.5.0 on 2026-10-06._

**Speakers** can:
- write a deck in markdown and see it as slides (v0.1.0)
- share a link to a deck (v1.0.0)

**Audience Members** can:
- follow the slides live on their phone, without signing in (v1.0.0)

## Up next
<!-- Ship It, every release; Trim It, when grooming -->
_Updated with v1.5.0 on 2026-10-06._

- <the top of Todo, in order, 3-7 items, as "<Persona> can ...">
- Parked for later: <one line on notable `later` ideas>
```

## The product brief

`PRODUCT.md` doubles as the app's **product brief**, read by people (and
Claude projects) who need its context without the code:

| Part | Sections | Kind |
|---|---|---|
| Vision | name and purpose line, Problem, People, Layout, Look | human intent: confirmed with the owner, changes rarely |
| History | First Version | the plan before building started; never rewritten |
| Status | What it does today, Up next | generated from releases and the board, refreshed by Ship It |

Keep the whole file to **about one page**: Problem 3-6 sentences; each
persona 3 lines; What it does today up to ~12 bullets (group small things);
Up next up to 7 bullets. Plain words for a non-developer: what people can
do, never how it's built.

**What it does today lists live features only**, each with the version it
went live in. Work merged to `dev` but not released isn't "today" yet.
The freshness line (`_Updated with vX.Y.Z on <date>._`) and
`journey.json` `brief` say which release it describes.

## Rules

- Before Name It runs, the title is `# (unnamed)` and the purpose line is
  left out.
- A section that hasn't been written yet is left out entirely, not left
  with placeholder text.
- Sections drafted from code, not yet confirmed by the owner (Adopt It),
  start with `<!-- DRAFT: drafted from the code; please confirm the intent -->`,
  removed once confirmed.
- Write it in plain, everyday language. The builder should recognize every
  sentence as something they said or agreed to.
