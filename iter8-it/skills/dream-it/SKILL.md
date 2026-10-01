---
name: dream-it
description: "Dream It — Get every feature idea out of your head and onto the table, big or small. Step 5 of iter8-it: brainstorms features for each persona and records them as Epic and Feature issues, with the Features in the board's Backlog column (the idea pile, not the plan). Rerunnable any time to add ideas. Use when someone wants to brainstorm features, add ideas, or says 'dream it', 'what could it do', or 'I have more ideas'."
---

# Dream It

**Step 5 of the iter8-it journey.** Get every feature idea out of your
head and onto the table, big or small.

Dream It is a brainstorm with **no judging yet**. Ideas become GitHub
Issues: **Epics** (big areas of the app) and **Features** (things a
persona can do), linked as sub-issues. Each Feature goes on the board in
the **Backlog** column: the idea pile, visible next to the plan. Trim It
decides what moves to Todo.

Rerun it any time to add ideas.

## How to talk

- Energetic and generous. "Big or silly ideas welcome. We'll trim later."
- Brainstorm **per persona**: "What would make the Presenter's day
  easier?" Offer ideas of your own too, clearly labelled as suggestions.
- Don't evaluate or estimate. If they start debating an idea, note it and
  say "Trim It will sort that out."
- If two people are brainstorming, give both room.

## 0. Where are we?

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md).

1. `journey.json` must have `github.owner`, `github.repo` (Claim It) and
   `github.workItems` (the Issue Type or label names to use). Missing:
   offer Claim It and stop.
2. `PRODUCT.md` should have **People** (Meet It). Missing: offer Meet It
   first; features are written for personas.
3. **Existing ideas** (a rerun):

   ```bash
   gh issue list -R <owner>/<repo> --state open --limit 200 --json number,title,labels,issueType
   ```

   Show the current Epics and Features briefly so new ideas don't
   duplicate them.

## 1. Brainstorm

For each persona in turn: "What would <Persona> love to be able to do?"
Collect everything as short phrases. Then ask across personas: "Anything
that would make them come back? Anything that would make them tell a
friend?"

Keep going until they run dry ("Anything else, even a wild one?").

## 2. Shape it

Turn the pile into a draft:

- **Features:** each one "<Persona> can <do something>". One ability, not
  a whole area. Split vague ones ("better sharing") into concrete ones.
  Merge duplicates.
- **Epics:** group the Features into 2-6 big areas ("Presenting",
  "Joining a talk", "Accounts"). A Feature belongs to exactly one Epic.

Show the draft as a grouped list and ask for changes:

> **Presenting**
> - Presenter can write slides in Markdown
> - Presenter can present from a laptop, advancing slides with the keyboard
>
> **Joining a talk**
> - Audience Member can join a talk by scanning a QR code
> - Audience Member can follow along on their phone as slides change

Nothing is created until they agree.

## 3. Create the Issues

Names come from `journey.json` `github.workItems` (for example
`epic` = `Epic`, `feature` = `Feature`). If `kind` is `labels`, use
`--label <name>` instead of `--type <name>`.

Make sure a persona label exists for each persona (colors: pick distinct
ones):

```bash
gh label create "persona:<Persona>" -R <owner>/<repo> --color <hex> --description "For the <Persona>" --force
```

Create each Epic, then its Features under it:

```bash
gh issue create -R <owner>/<repo> --type "<workItems.epic>" --title "<Epic>" --body "<one or two sentences: what this area covers>"
gh issue create -R <owner>/<repo> --type "<workItems.feature>" --parent <epic-number> \
  --label "persona:<Persona>" --title "<Persona> can <do something>" --body-file <file>
```

Feature body:

```markdown
**For:** <Persona>

<A sentence or two: what they can do and why it helps them, tied to their
frustration in PRODUCT.md.>
```

Put each new Feature on the board in **Backlog** (Epics stay off the
board; they group Features through the sub-issue link):

```bash
node <plugin>/shared/scripts/board.mjs set <feature> Backlog
```

Say progress in one line per Epic, not per command. Never put anything in
Todo; that's Trim It's call.

## 4. Record and hand off

`journey.json`: `stage` = `"dream-it"` if it was earlier. Commit to `dev`
and push:

```bash
git switch dev && git pull
git add journey.json
git commit -m "Dream It: ideas recorded as issues"
git push
```

(Skip the commit if nothing changed.)

Give them the board link (`https://github.com/orgs/<owner>/projects/<number>`
for an org, `https://github.com/users/<owner>/projects/<number>` for a
personal account) so they can see the Backlog. Then:
"Next is **Trim It**: cutting this down to the smallest first version
someone would actually use. Ready?"
