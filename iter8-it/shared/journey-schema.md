# `journey.json` schema

`journey.json` lives at the root of every project built with iter8-it and is
committed. It's the machine-readable handoff between skills: each step reads
what earlier steps wrote and fills in its own fields.

**This file is the contract between skills. Change it deliberately**, and
update every skill that reads or writes the field you change.

## Example

```json
{
  "stage": "build-it",
  "name": "SlideIt",
  "slug": "slideit",
  "purpose": "Markdown slides delivered live to your audience's phones.",
  "needs": {
    "auth": true,
    "database": true,
    "decidedIn": "trim-it"
  },
  "github": { "owner": "Iter8-IT-Consulting", "repo": "slideit", "project": 3 },
  "vercel": { "scope": "iter8-community", "project": "slideit", "url": "https://slideit.vercel.app" },
  "supabase": {
    "local": true,
    "org": "<org-id>",
    "projectRef": null,
    "region": "us-east-1"
  },
  "lastRelease": { "tag": null, "at": null }
}
```

## Rules

- Fields are `null` until the step that owns them runs.
- `stage` is the **furthest** step completed. It's a hint for "what's next",
  not a lock: any step can be rerun, and rerunning an earlier step never
  moves `stage` backwards.
- A skill that needs a field that's still `null` says what's missing and
  offers to run the step that owns it. It never guesses.

## Fields

| Field | Type | Owner | Meaning |
|---|---|---|---|
| `stage` | string | every step | Furthest step completed: `spot-it`, `name-it`, `claim-it`, `meet-it`, `dream-it`, `trim-it`, `build-it`, `ship-it`. (`fix-it` and `grow-it` don't advance it.) |
| `name` | string | Name It | Display name, e.g. `SlideIt`. |
| `slug` | string | Name It | Lowercase slug used for the GitHub repo, Vercel project and Supabase project, e.g. `slideit`. |
| `purpose` | string | Name It | One-line purpose. Same text as the line under the title in `PRODUCT.md`. |
| `needs.auth` | boolean | Trim It | Do people sign in? |
| `needs.database` | boolean | Trim It | Does the app store data that must survive a refresh or be shared between people? |
| `needs.decidedIn` | string | Trim It | Which step recorded the needs (normally `trim-it`; Grow It may revise them). |
| `github.owner` | string | Claim It | GitHub org or user that owns the repo. |
| `github.repo` | string | Claim It | Repo name (normally the slug). |
| `github.project` | number | Claim It | GitHub Project (board) number. |
| `vercel.scope` | string | Claim It | Vercel team/scope. |
| `vercel.project` | string | Claim It | Vercel project name. |
| `vercel.url` | string | Claim It | Production URL. |
| `supabase.local` | boolean | Build It | `true` once local Supabase (Docker) is set up. |
| `supabase.org` | string | Ship It | Supabase org ID the production project lives in. |
| `supabase.projectRef` | string | Ship It | Production project ref. `null` means there's no production database yet. |
| `supabase.region` | string | Ship It | Region of the production project. |
| `lastRelease.tag` | string | Ship It | Tag of the most recent release. |
| `lastRelease.at` | string | Ship It | ISO 8601 timestamp of the most recent release. |

## Starting value

Spot It writes the file with every field present so later steps only fill
values in:

```json
{
  "stage": "spot-it",
  "name": null,
  "slug": null,
  "purpose": null,
  "needs": { "auth": null, "database": null, "decidedIn": null },
  "github": { "owner": null, "repo": null, "project": null },
  "vercel": { "scope": null, "project": null, "url": null },
  "supabase": { "local": false, "org": null, "projectRef": null, "region": null },
  "lastRelease": { "tag": null, "at": null }
}
```
