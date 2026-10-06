---
name: skin-it
description: "Skin It — Choose how your app looks: colours, fonts, shapes, light or dark, and the feel of it all. Part of iter8-it: shows a few style directions using the app's own screens (on a Design canvas when available), lets the user pick, mix and tweak, checks readability, and applies the result as the app's skin, visible on its public /style-guide page. Run it any time; it's fine to build first and skin later. Use when someone wants to change or choose the look, colours, fonts, theme, dark mode or style, or says 'skin it', 'make it look nicer', or 'it needs a look'."
---

# Skin It

**Part of the iter8-it journey.** Choose how your app looks.

The app starts in the Iter8 Community starter skin. Skin It replaces it
with the app's own: colours, fonts, corner shapes, spacing, button style,
the overall feel, and optionally a dark version. Everything comes from a
handful of **tokens** (`src/app/brand.css`) and the fonts in
`src/app/layout.tsx`, so changing the skin changes the whole app at once,
and the public **`/style-guide`** page always shows the current skin.

**Not knowing yet is fine.** Many people only know what they want after
they've seen a few screens. Offer it without pushing: "If you don't know
yet what it should look like, let's build some first. You can skin it
any time." Rerunning it later re-skins the app.

## How to talk

- Visual and concrete: show, don't describe. Name each direction ("Stage
  Lights", "Paper Notes") so it's easy to talk about.
- One question at a time; offer a default.
- Use their words for the feel ("calm", "fun", "serious").

## 0. Where are we?

`<plugin>` is the iter8-it plugin folder (two levels up from this
SKILL.md). Helpers: `<plugin>/shared/scripts/contrast.mjs`.

1. Needs Claim It (a live app). `PRODUCT.md` People and the Layout
   (`journey.json` `layout`) make the directions far better: if they're
   missing, offer Meet It / Trim It first, but carry on if the user wants.
2. Read the current skin: `src/app/brand.css`, the fonts in
   `src/app/layout.tsx`, `journey.json` `skin` (null = still the starter
   skin), and `PRODUCT.md`'s **Look** section if there is one (a re-skin:
   ask what they'd keep and what bothers them).
3. **Older apps** (claimed before iter8-it 0.19) may lack the newer
   tokens (`--brand-on-primary`, `--brand-raised`, `--brand-border`,
   `--brand-radius`) and the `/style-guide` page: this run adds them
   (step 5).

## 1. Ask about the feel

One at a time, briefly:

1. **The feel**, in a few words: calm, playful, bold, professional, warm,
   techy, elegant... Who it's for (`PRODUCT.md`) usually suggests one.
2. **Light, dark, or both?** Offer dark as an option: some apps suit it
   (used in dim rooms, at night, on stage), most are fine light-only.
   "Both" follows the device's setting.
3. **Colours that must or mustn't appear**: a club's or company's
   colours, a logo, a colour they dislike.
4. **Anything they like the look of**: an app or website. (Use it for
   the feel, never copy a brand.)
5. **Fonts**, only if they have views; otherwise you'll suggest pairings.

## 2. Three directions

Make **three distinct directions** that fit the answers and the people.
Each one is:

- a **name** and a one-line feel ("Paper Notes: light, warm, friendly");
- a **palette** for every token (`--brand-primary`, `--brand-on-primary`,
  `--brand-accent`, `--brand-ink`, `--brand-muted`, `--brand-surface`,
  `--brand-raised`, `--brand-border`, the three `--status-*`), plus dark
  values if dark is wanted;
- a **font pairing** from Google Fonts (a heading font and a body font;
  `next/font/google` loads them, so nothing is installed);
- **shape and style**: corner radius (`--brand-radius`: sharp 0.125rem,
  soft 0.5rem, round 1rem), button style (filled, outlined, pill), density
  (airy or compact), and a sentence of style rules ("big friendly
  buttons, no shadows, generous white space").

Show them on **the app's real screens**, using its real words from
`PRODUCT.md` and the layout: the front page (if it has one), the main
screen, and both on a phone.

**Use the Design canvas when it's available.** Check with your Artifact
tool: `quickstart` with intent `design`. If it offers a **Design** type,
create a Design artifact ("<Name> skins") with one row of artboards per
direction (front page desktop, main screen desktop, main screen phone),
labelled with the direction's name, palette and fonts. Open it for the
user and talk through the differences. Tweaks ("Paper Notes with Stage
Lights' blue") update the artboards.

**Otherwise, preview in the app itself.** Add a temporary page,
`src/app/skin-preview/page.tsx` (never committed), that shows the three
directions side by side (and stacked on a phone): each a section that
sets the tokens as CSS variables on its own wrapper and loads its fonts,
with the same sample screens. Ask the user to open
`http://localhost:3000/skin-preview` (`npm run dev`) on their computer
and phone. Delete the page when they've chosen.

## 3. Pick, mix and tweak

Let them pick one, combine parts, or adjust ("warmer", "less purple",
"rounder buttons"). Update the canvas or the preview until they say it
looks right. If they want none of them, ask what's off and make a new
set.

## 4. Check it's readable

Every text colour must be readable on what it sits on, in light and (if
used) dark:

```bash
node <plugin>/shared/scripts/contrast.mjs \\
  "<ink>:<surface>" "<ink>:<raised>" "<muted>:<surface>" "<muted>:<raised>" \\
  "<on-primary>:<primary>" "<primary>:<surface>" "<primary>:<raised>" \\
  "<border>:<raised>:large"
```

(Large text and outlines need 3:1, so mark those `:large`.) Any FAIL:
nudge that colour darker or lighter until it passes, keeping the feel,
and tell the user what changed and why ("the grey was a bit faint for
small text").

## 5. Apply it

On a branch, as a small piece of work:

```bash
git switch dev && git pull
git switch -c feature/skin-<name>
```

1. **`src/app/brand.css`**: the new token values (keep the token names
   and the `@theme inline` block). For dark: fill in the
   `@media (prefers-color-scheme: dark)` block. Update the comment at the
   top with the skin's name.
2. **Fonts** in `src/app/layout.tsx`: swap `Open_Sans` for the body
   font (`next/font/google`, same `--font-open-sans`-style variable
   wiring), and set `--brand-font-headline` to the heading font (load it
   too, and use its CSS variable).
3. **Older apps** (no `--brand-raised` etc.): add the missing tokens and
   copy `/style-guide` from Claim It's templates
   (`<plugin>/skills/claim-it/assets/templates/src/app/style-guide/` and
   `e2e/style-guide.spec.ts`).
4. **Hard-coded colours.** Search the app for colours that bypass the
   tokens (`bg-white`, `text-white`, `text-gray-*`, `bg-black`, hex values
   in `className`) and switch them to tokens (`bg-brand-raised`,
   `text-brand-on`, `text-brand-muted`...), or the new skin (and dark
   mode especially) will look patchy.
5. **The footer credit**: ask whether to keep "Started with tools from
   the Iter8 Community" (it's theirs to remove; see `CLAUDE.md`
   Branding).
6. **`PRODUCT.md`**: add or replace a **Look** section after Layout:

   ```markdown
   ## Look

   **<Skin name>**: <one-line feel>. Light <and dark>. <Heading font> for
   headings, <body font> for text. <The style rules in a sentence or
   two.> The full skin: /style-guide.
   ```

7. **`journey.json`**: `skin` = `{ "name": "<name>", "dark": <bool>, "at": "<ISO date>" }`,
   and `stage` = `"skin-it"` if it was earlier.

Then check, as Build It does: `npm run lint`, `npm run typecheck`,
`npm test`, `npm run build`, `npm run test:e2e`. Some e2e tests may look
for exact colours or text styles; update them. Open `/style-guide` with
the user (and the main screens) to confirm it all looks right: their
"looks good" is the approval.

Commit, push, open a PR into `dev` (`Refs` nothing; title "Skin: <name>"),
and merge when the checks pass (as in Build It, steps 6-7). The new look
goes live with the next Ship It.

## 6. What next?

"Your app's new look goes live with the next release. **Build It** next,
or **Ship It** now to put the new look live?" Mention `/style-guide` as
the place to see the skin any time, at the live address too.
