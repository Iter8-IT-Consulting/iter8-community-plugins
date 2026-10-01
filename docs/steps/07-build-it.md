# Build It

**Add the features one small piece at a time, checking each one as you
go.**

Build It turns the top card in Todo into working, tested code. Each
feature is broken into small **stories**: pieces small enough to build,
check and try in one go, each one something a real person can do. You
see every piece working before it's kept.

## What happens

1. **How far this time?** Just one story, the whole feature (the
   default), or everything in Todo.
2. **Stories.** For a feature that hasn't been started, Claude drafts one
   to five stories, each with a short checklist of what "working" means.
   You approve them before anything is built.
3. **For each story:**
   - Claude builds it in its own workspace, writing tests alongside the
     code.
   - It runs every check on your computer, including tests that click
     through the app on a desktop and on a phone.
   - **You try it.** Open it on your computer (or your phone) and say
     whether it's right. Feedback gets built in before anything is kept.
   - **When you say it looks good,** it goes to GitHub for a quick
     automatic check (about a minute) and, once that passes, it's added
     to the version waiting to go live. No second "are you sure?".
4. **Next story**, until the run is done. Stop whenever you like.

**The first story also builds your app's frame**: the layout you chose
in Trim It, with its navigation, ready for everything that follows.

**The first time your app needs to remember something**, Build It quietly
adds a database on your computer, plus sign-in if people need accounts.
That goes into the same story as the feature that needed it. Nothing
gets set up before it's needed. With sign-in, it also adds a note to
your Backlog for later: making the app's account emails (sign-up,
password reset) look like they come from your app, once it has its own
look.

## What you end up with

- Working features, tested and checked, waiting to go live.
- A board that shows exactly where each piece is: **In Progress** while
  it's being built, **In Review** once it's done and waiting for Ship It.

## What it asks of you

| | |
|---|---|
| **Time** | Varies. Most stories take 15-45 minutes, mostly Claude working. |
| **Decisions** | Approving the stories; trying each one and saying when it looks good |
| **You'll need** | Docker Desktop (free), but only once your app needs a database |
| **Cost** | Nothing |

Nothing goes live in Build It. That's Ship It's job, so you can build
several pieces and release them together.

**Next:** [Ship It](08-ship-it.md)
