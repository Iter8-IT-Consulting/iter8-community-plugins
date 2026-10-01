# App layouts

Four common shapes for an app (the page frame and navigation that
features slot into), plus one separate choice: whether it has a public
**front page**. Trim It recommends one after the first trim, the user
picks (or says "none of these, design one with me"), and Build It's first
story builds the frame to match. They're descriptions, not code: Build It
builds them fresh with the app's Next.js and branding.

Each layout says what it's for, what it looks like on a desktop and on a
phone, the signals that point to it, and what the first story builds.
Everything is mobile-friendly; "mobile-first" means designed for the
phone first, then widened.

The choice is recorded in `journey.json` `layout` (`shape`: the id below;
`frontPage`: true or false) and in `PRODUCT.md` (a short **Layout**
section). It's a starting point, not a
cage: later stories can change it, and Grow It may suggest a change.

---

## `single-tool`: Single-purpose tool

**One focused screen that does one job well.**

- **Fits:** apps where people come to do one thing and leave. Little or no
  navigation; maybe a second page (about, results).
- **Desktop:** a centred column, max ~640px wide, with the app name at the
  top, the tool in the middle and a quiet footer. Generous white space.
- **Phone:** the same column, full width with side padding. Big touch
  targets; the main action within thumb reach.
- **Signals:** one persona (or one main one); one or two first-version
  Features; no sign-in, or sign-in only to save one thing. Usually no
  front page: the tool is the front page.
- **Examples:** a guestbook, a tip calculator, a sign-up sheet, a "which
  bin does this go in?" lookup.
- **First story builds:** the home page as the tool itself, with a small
  header (name, maybe a link to About) and the footer.

## `app-nav`: Signed-in app with navigation

**Lists of "my things", detail pages, and a menu to move between areas.**

- **Fits:** people sign in to manage their own stuff: create, list, open,
  edit. Three or more areas.
- **Desktop:** a top bar with the app name on the left, the main areas as
  links, and an account menu (name, sign out) on the right. Or, with many
  areas, a left sidebar. Content in a wide main column: a list page (cards
  or rows, a "New" button) and detail pages.
- **Phone:** the top bar collapses to the name plus a menu button that
  opens a full-screen menu. Lists stack as cards.
- **Signals:** `needs.auth`; Features like "Presenter can see all their
  decks", "... can create / edit / delete"; one main persona working at a
  desk.
- **Examples:** a presenter's "my decks", a recipe box, a small CRM.
- **First story builds:** the signed-in frame (top bar with account menu,
  sign-in redirect for its pages) and the first list page. Pages for
  people who aren't signed in (sign-in, a simple home) use a plain
  centred frame.

## `mobile-tabs`: Mobile-first with bottom tabs

**A phone app in the browser: a few main areas, one tap apart.**

- **Fits:** people mostly on phones, often on the move, switching between
  two to five areas.
- **Phone:** a tab bar fixed to the bottom of the screen (icon + short
  label per area, the current one highlighted), a slim title bar at the
  top, content in between, scrolling.
- **Desktop:** the same tabs become a top bar or a narrow left rail; the
  content stays a comfortable column, not stretched across a wide screen.
- **Signals:** the main persona's context says "on a phone"; Features
  spread across a few areas used in short bursts (today, history,
  profile).
- **Examples:** a team check-in, a habit tracker, an event companion.
- **First story builds:** the tab frame with the areas the first version
  needs (placeholders are fine for areas whose stories come later; hide
  them if they're empty) and the first area's content.

## `two-sided`: Two-sided

**One kind of person creates or controls on a big screen; another follows
on their phone.**

- **Fits:** apps with two (or three) personas in different roles and on
  different devices at the same moment: a host and guests, a speaker and
  an audience.
- **Creator side (desktop):** `app-nav`-style: signed in, with their
  things listed and a workspace to make or run one. Often a "live"
  control view with big, clear controls.
- **Follower side (phone):** no sign-in needed; joined by a link or QR
  code; one simple, full-screen view that updates by itself; large text.
- **A third side** (an operator, a moderator) gets its own minimal view,
  usually on whatever device they hold.
- **Signals:** personas whose contexts differ in device and role; Features
  like "... can join by scanning a QR code", "... sees it update live".
- **Examples:** SlideIt (speaker / operator / audience), a quiz night, a
  live poll, a queue display.
- **First story builds:** the frame for the side that story is for. The
  other side's frame arrives with its first story. Keep the follower side
  separate (its own route group and layout), so it stays light and fast
  on phones.

---

## The front page (any layout)

**A public page that explains the app, with "Get started" leading into
it.** A yes/no choice on top of the layout.

- **Yes, when:** people need to understand it before they try it; new
  people arrive from links or searches; it's for a community or the
  public; there's sign-in (the front page is where visitors land before
  they have an account).
- **No, when:** the people already know what it is (a team's own tool,
  an invite-only app), or the tool itself *is* the front page
  (`single-tool` usually says no).
- **What it is:** a hero (name, one-line purpose, a "Get started"
  button), then a few short sections written from `PRODUCT.md` (what it
  does, who it's for, how it works) and a footer. Mobile-first, readable
  without zooming. It uses its own plain frame, not the app's navigation.
- **With sign-in:** signed-in people skip it and land in the app.
- **Two-sided:** "Get started" leads to the creator side; the follower
  side keeps its direct links / QR codes and never needs the front page.
- **First story builds:** the front page is its own small piece of work.
  It goes in with the first story if that story is about getting people
  in (sign-up, joining); otherwise it's a Feature of its own, which Trim
  It adds to Todo (creating it as a Feature if Dream It didn't).

---

## Choosing (Trim It)

After the first trim, read the personas (roles, devices) and the
first-version Features, and **recommend one layout with a one-sentence
reason**, naming a runner-up if it's close. Then, separately, **recommend
yes or no on a front page**, with its reason:

> Your audience follows on their phones while speakers and operators
> work on laptops, so I'd go **two-sided**. And yes to a **front page**:
> new speakers will arrive from a link and need to see what SlideIt is
> before they sign up.

Show the recommendation and the alternatives as one line each (the bold
line under each heading above). The user picks, or says "none of these":
then ask them to describe what they picture, write it down in the same
shape (fits / desktop / phone / first story builds), and use `custom` as
the shape.

## Building (Build It)

The first story builds the frame its layout describes, alongside the
story's feature, using the brand tokens (`brand-*` colours, the fonts in
`layout.tsx`). Shared pieces (header, navigation, footer) go in
`src/components/`; route groups (`src/app/(app)/`, `src/app/(public)/`)
keep different frames apart. Test the frame on the device projects the
layout names: e2e checks that navigation works on desktop and phone.
Later stories add to the frame rather than reinventing it.
