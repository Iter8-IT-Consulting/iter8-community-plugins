# iter8-community-plugins

Claude Code plugins from Iter8 for the community.

## iter8-it

**[iter8-it](iter8-it/)** walks you from "I have a problem" to "my app is
live and improving", one named step at a time:

| # | Step | What it does |
|---|------|--------------|
| 1 | **Spot It** | Find a real problem in your life or work that a simple app could fix. |
| 2 | **Name It** | Give your project a name. It forces you to decide what it's really for. |
| 3 | **Claim It** | Claim your name on the internet: a real project and a live page, so it's real from the start. |
| 4 | **Meet It** | Get to know the people who will use it: what they're trying to get done and what frustrates them today. |
| 5 | **Dream It** | Get every feature idea out of your head and onto the table, big or small. |
| 6 | **Trim It** | Cut the list down to the smallest version someone would actually use. |
| 7 | **Build It** | Add the features one small piece at a time, checking each one as you go. |
| 8 | **Ship It** | Put what you've built live for real users, and check it works there. |
| 9 | **Fix It** | Things will break. Find out why, fix it, and put the fix live. |
| 10 | **Grow It** | Keep improving your app with what you learn from real use. |

Build It and Ship It are a loop: you go around it for every release, and
Fix It and Grow It feed back into it.

### Principles

- **Journey, not roles.** Steps follow where your project is, not who you
  are. A solo builder runs all of them.
- **Plain language.** Every step explains what it's doing and why, and asks
  one clear question at a time.
- **Real from the start.** After Claim It there's a live URL, and every
  later step keeps it working.
- **Nothing before it's needed.** No database until your app needs one
  (usually because people sign in).
- **Mostly free.** GitHub, Vercel and Supabase free tiers by default.
  Anything paid is offered, never assumed, with the cost stated up front.
- **Every step checks the previous ones.** If something's missing, the step
  tells you and offers to run the earlier step.

### The stack

Next.js (TypeScript, Tailwind) on Vercel, GitHub for code and the project
board, and Supabase (Auth + Postgres) only when the app needs it. Local
development uses Supabase in Docker; there is one cloud database, for
production.

## Status

**Early scaffold.** The plugin installs and all its skills are listed, but
each one is a placeholder that says it isn't built yet. Skills are being
built one at a time, in the order in [PLAN.md](PLAN.md#5-build-order).

## Install

```
/plugin marketplace add Iter8-IT-Consulting/iter8-community-plugins
/plugin install iter8-it@iter8-community-plugins
```

To try a local checkout instead, point the marketplace at the folder:

```
/plugin marketplace add C:\Source\iter8-community-plugins
```

## Repository layout

```
.claude-plugin/marketplace.json   the marketplace (lists iter8-it)
iter8-it/
  .claude-plugin/plugin.json      name, version, description
  skills/<step>/SKILL.md          one skill per step
  shared/                         contracts and procedures used by several skills
scripts/                          test helpers (not skills)
test-fixtures/                    PRODUCT.md + journey.json at each stage
PLAN.md                           the design
```

Bump `version` in [iter8-it/.claude-plugin/plugin.json](iter8-it/.claude-plugin/plugin.json)
on every change users should pick up. Claude Code caches plugins by
version.
