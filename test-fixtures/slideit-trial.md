# SlideIt trial run

The acceptance test from PLAN.md section 7: rebuild SlideIt from scratch with
iter8-it, from Spot It to the first release. Run it before Saturday. Note
anything that fails, confuses, or asks a question twice, and bring it back to
the plugin session.

## Before you start

- [ ] Plugin updated to the latest version: `/plugin marketplace update iter8-community-plugins`
- [ ] `C:\Source\SlideIt` is empty
- [ ] Nothing named `slideit` online (`node scripts/teardown.mjs slideit --owner Iter8-IT-Consulting --scope iter8-community --any-slug` lists nothing)
- [ ] Docker Desktop running (needed at the first data story)
- [ ] `gh auth status`: active account **Adam-Iter8**
- [ ] Open `C:\Source\SlideIt` in VS Code and start a new Claude session there

Answers to give when asked:

| Question | Answer |
|---|---|
| GitHub owner | `Iter8-IT-Consulting`, private |
| Commit identity | Adam Goss <adam@iter8itconsulting.com> |
| Story Issue Type | your call (Task avoids changing the org) |
| Vercel scope | `iter8-community` |
| Supabase org | Iter8 IT Consulting (`iammfjftjecqxvcfdpeu`), Pro |

## The run

Tip: `/iter8-it:whats-next` at any point should name the step you're about
to run. If it doesn't, note it.

| Step | Run | Expect |
|---|---|---|
| 1 | `/iter8-it:spot-it` | One question at a time; ends with a problem statement you agree with. `PRODUCT.md` (unnamed) + `journey.json`, `git init`, **no commit**. |
| 2 | `/iter8-it:name-it` | Purpose line first, then names. Slug `slideit`. Checks GitHub, Vercel and `slideit.vercel.app`. The address is probably taken, so expect a warning that Vercel will add a suffix. |
| 3 | `/iter8-it:claim-it` | Commit email defaults to your Vercel email. Live starter page; `dev` default; board with In Review; CI green; `mainProtected: false` with a plain explanation. **No Supabase, no Docker.** |
| 4 | `/iter8-it:meet-it` | At least **Presenter** (desktop-first authoring) and **Audience Member** (mobile-first, joins by QR). README gets "Who it's for". Playwright keeps `desktop` + `mobile`. |
| 5 | `/iter8-it:dream-it` | Grouped Epics/Features shown first; then created as typed sub-issues with `persona:` labels. **Not** on the board. |
| 6 | `/iter8-it:trim-it` | First-version Features on the board in build order; rest labelled `later` with reasons. `needs.auth = true`, `needs.database = true`. First Version section in `PRODUCT.md`. |
| 7 | `/iter8-it:build-it` | Top Feature split into stories. First data/auth story sets up local Supabase (own port block), migration checked with `db reset`, CI green with Supabase in the runner, merged to `dev`. |
| 8 | `/iter8-it:ship-it` | Proposes v0.1.0. Creates the production Supabase project, Vercel env vars, `SUPABASE_DB_URL`, migrate dry run. Release merges; migrate Action applies; live check passes; stories Done; release page. |

Sign-in (auth) is the one thing not yet exercised by the test project. If the
first story is sign-in, watch step 7 closely (the proxy and Supabase Auth
setup).

## Afterwards

Decide whether to keep SlideIt live. If not, run
`node scripts/teardown.mjs slideit --owner Iter8-IT-Consulting --scope iter8-community --any-slug`
(then `--yes`). That removes the repo, board, Vercel project and Supabase
project. The production Supabase project costs about $10/month on the Pro
org until it's deleted.
