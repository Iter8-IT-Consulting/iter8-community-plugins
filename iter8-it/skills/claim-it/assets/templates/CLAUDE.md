@AGENTS.md

# {{NAME}}

{{PURPOSE}}

This project is built with the **iter8-it** Claude Code plugin, one step at a
time: Spot It, Name It, Claim It, Meet It, Dream It, Trim It, Build It, Ship
It, Fix It, Grow It.

- **What the product is and who it's for:** [PRODUCT.md](PRODUCT.md). Don't
  repeat it here.
- **Where the project is in the journey, and its links:**
  [journey.json](journey.json). Every iter8-it step reads and updates it.
- **The work:** GitHub Issues (Epic -> Feature -> Story) on the project
  board, Kanban: Todo / In Progress / In Review / Done. Work is Done when
  it's live in production, not when it's merged.

## Links

{{LINKS}}

## Stack

- **Next.js** (TypeScript, App Router, Tailwind, `src/`), UI and API route
  handlers in one app. No separate backend.
- **Vitest** + Testing Library for unit tests (`src/**/*.test.tsx`).
- **Playwright** for end-to-end tests (`e2e/`), with `desktop` and `mobile`
  projects.
- **Vercel** hosts it. Only `main` deploys (see `vercel.json`).
- **GitHub** for code, CI (`.github/workflows/ci.yml`) and the board.
- **Supabase** (Auth + Postgres) only if the app needs it. None yet.
  `journey.json` `needs` records whether it does.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the app locally at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen && tsc --noEmit` (route types live in the gitignored `.next/types`, so they're generated first) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; starts the app itself) |
| `BASE_URL=<url> npm run test:e2e` | End-to-end tests against a deployed site |

## Branches and environments

```
feature/<issue>-<slug> --PR--> dev --release PR--> main --> Vercel production
```

- `dev` is the default branch. Day-to-day PRs target it.
- `main` is production. It's only updated by release PRs from `dev` (Ship
  It) and hotfixes (Fix It).
- CI (lint, typecheck, unit, e2e) runs on every PR into `dev` or `main`,
  and on pushes to `main`.

## Branding

The app starts with light Iter8 Community branding. It's yours to keep,
restyle or remove.

- **Restyle:** change the values in `src/app/brand.css`.
- **Remove:** delete `src/components/Iter8Credit.tsx` and its
  `<Iter8Credit />` in `src/app/layout.tsx`, delete `public/brand/`, delete
  `src/app/brand.css` and its import in `src/app/globals.css` (then replace
  the `brand-*` classes in `src/app/page.tsx`), and replace
  `src/app/favicon.ico` and `src/app/apple-icon.png`.
