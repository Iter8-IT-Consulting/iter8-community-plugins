---
name: name-it
description: "Name It — Give your project a name. It forces you to decide what it's really for. Part of iter8-it: settles the display name, the web-safe slug and a one-line purpose, and checks the name is free. Use when someone needs a name for their app, or says 'name it', 'what should we call it', or 'help me pick a name'."
---

# Name It

**Part of the iter8-it journey.** Give your project a name. It forces you
to decide what it's really for.

Name It settles three things:

| | Example | Used for |
|---|---|---|
| **Display name** | SlideIt | The app's title, the page heading, the board. |
| **Slug** | `slideit` | The web address, the GitHub repo, the Vercel and Supabase projects. |
| **One-line purpose** | Markdown slides delivered live to your audience's phones. | Under the title everywhere; the app's description. |

It creates nothing online. It checks the name is free so Claim It won't
hit a surprise.

## How to talk

- Playful but focused. Naming is fun; enjoy it, then decide.
- One question at a time. With more than one person at the keyboard, make
  sure both are happy with the final choice.

## 0. Where are we?

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md).

- No `PRODUCT.md` with a Problem section: Name It needs the problem first.
  Offer to run Spot It. Stop.
- `journey.json` already has a `name`: a rerun. If `github.repo` is set,
  the project has been claimed; **renaming now means renaming the repo and
  Vercel project too**. Say so, and only change the display name and
  purpose unless the user really wants the full rename (then stop and
  explain it's a manual job for now).
- Otherwise start.

## 1. The purpose line first

Read the Problem back briefly, then ask: "If you had one sentence to tell
someone what this app does for them, what would it be?"

Help them get to **one plain sentence, under about 12 words**, that says
what it does for whom. Not a slogan. "Markdown slides delivered live to
your audience's phones", not "Revolutionizing presentations".

## 2. The name

Propose **4-6 names** tied to the problem and purpose, with a few words
on each. Mix styles: descriptive ("MeetupSlides"), short and brandable
("SlideIt"), playful. Invite theirs too.

Good names are easy to say and spell, and still make sense in a year.
Check each candidate against the purpose line: does the name fit what the
app is *for*? This is where "what it's really for" gets decided. If none
fit, the purpose may need another look.

## 3. The slug

Derive it from the display name: **lowercase letters, digits and
hyphens**, starting with a letter, 3-40 characters. `SlideIt` -> `slideit`;
`Meetup Slides` -> `meetup-slides`. Offer a shorter one if it's long.
Explain: "This is the web-address version of the name."

## 4. Is it free?

Check, if the tools are signed in (skip any that aren't, and say Claim It
checks again):

- **GitHub:** ask where the project will live (their account or an
  organization), then `gh repo view <owner>/<slug>`. "Could not resolve to
  a Repository" means free.
- **Vercel:** `vercel project inspect <slug>` (with `--scope <team>` if
  they use a team). "No project" means free in their account.
- **The web address:** `curl -s -o /dev/null -w "%{http_code}" https://<slug>.vercel.app`
  (or open it). **404** with `DEPLOYMENT_NOT_FOUND` means the address is
  free; anything else means someone already has it. If it's taken, Vercel will
  add a suffix (like `slideit-rouge.vercel.app`); mention it, and let them
  decide whether that matters.

If something's taken, say what, and offer to tweak the slug or pick
another name.

## 5. Save it

Read back all three and confirm. Then:

- `PRODUCT.md`: replace `# (unnamed)` with `# <Display Name>`, and put the
  purpose line on its own line under the title.
- `journey.json`: `name`, `slug`, `purpose`, and `stage` = `"name-it"`
  (unless it's already later).

Don't commit; Claim It makes the first commit.

## 6. What next?

"Next is **Claim It**: making it real, with a live page at your new
address. It takes about 15-20 minutes, mostly waiting. Want to do it
now?"
