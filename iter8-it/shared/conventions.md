# Conventions

Shared rules every iter8-it skill follows for the board, Issues, labels and
branches.

## Work item hierarchy

**Epic -> Feature -> Story**, linked as GitHub sub-issues.

| Level | What it is | Created by |
|---|---|---|
| Epic | A big area of the product. | Dream It |
| Feature | Something a persona can do. | Dream It |
| Story | One small deliverable to a persona, with acceptance criteria. | Build It (when it picks up a Feature) |
| Bug | Something broken. | Fix It |

- Every Feature and Story names the persona it's for. Nothing is
  infrastructure for its own sake: setup work (like adding a database)
  lands inside the first story that needs it.
- **Org-owned repos** use GitHub's native Issue Types (Epic, Feature,
  Story, Bug). If the org has no Story type, Claim It asks whether to add
  one (org-wide) or use the existing Task type for stories.
  **Personal-account repos** use labels instead: `epic`, `feature`,
  `story`, `bug`.
- The names actually used are recorded in `journey.json`
  `github.workItems`. Skills read them from there; they never hard-code
  "Story" or "Task".

## Other labels

| Label | Meaning | Set by |
|---|---|---|
| `later` | Not in the first version (or not in the current plan). The reason goes in a comment. | Trim It, Grow It |
| `persona:<name>` | Which persona the item is for. | Dream It, Build It |

## Board

A GitHub Project, **Kanban**, no sprints. Status options, in order:

1. **Backlog**: ideas, not planned yet. Dream It puts every new Feature
   here. Parked ones carry the `later` label.
2. **Todo**: ready to build, in priority order (top = next). Only Trim It
   (or the user, by hand) moves Features here.
3. **In Progress**: a branch exists and work is underway.
4. **In Review**: PR open, or merged to `dev` but not yet live.
5. **Done**: live in production and checked there by Ship It.

Work isn't Done when it's merged. It's Done when it's live.

**Grooming** is rerunning Trim It: pick what moves from Backlog to Todo,
reorder Todo, park ideas (`later`) or drop them (closed as "not planned").
The user can also drag cards between Backlog and Todo by hand at any time;
the skills follow whatever the board says.

## Branches

| Branch | Purpose | Updated by |
|---|---|---|
| `main` | Production. Every push deploys. | Ship It release PRs, Fix It hotfixes |
| `dev` | Integration. The GitHub default branch; day-to-day PRs target it. | Build It PRs |
| `feature/<issue>-<slug>` | One story. Branched off `dev`. | Build It, Fix It (normal path) |
| `hotfix/<issue>-<slug>` | Urgent production fix. Branched off `main`, merged back into `dev` afterwards. | Fix It (hotfix path) |

`<issue>` is the Issue number; `<slug>` is a few lowercase words joined
with hyphens, e.g. `feature/12-join-with-qr-code`.

## Pull requests

- PRs reference their Issues with `Refs #12`, never `Closes #12`. An Issue
  stays open until its work is live, and GitHub only auto-closes Issues
  for PRs merged into the default branch (`dev`), which isn't live yet.
  **Ship It closes Issues** once the release is checked in production,
  with a "Live in vX.Y.Z" comment.
- Release PRs (`dev -> main`) are merged with a **merge commit**, so
  `main`'s history shows each release.

## Adopted apps

Apps brought in with Adopt It may keep some of their own ways, listed in
`journey.json` `adopted.exceptions`. Before relying on a convention here
(branch names, the board's columns, how releases deploy), check that list
and work with the app's way instead, mentioning it to the user.

## Commit identity

Set per repo (`git config user.name` / `user.email`), confirmed with the
user before the first commit. Never rely on the global identity.
