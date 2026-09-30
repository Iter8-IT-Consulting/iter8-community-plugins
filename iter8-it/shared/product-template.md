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
```

## Rules

- Before Name It runs, the title is `# (unnamed)` and the purpose line is
  left out.
- A section that hasn't been written yet is left out entirely, not left
  with placeholder text.
- Write it in plain, everyday language. The builder should recognize every
  sentence as something they said or agreed to.
