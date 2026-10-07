# The iter8-it journey

**From "I have a problem" to "my app is live and getting better", one step
at a time.**

iter8-it is a set of steps for Claude Code. You run them in order, and
each one picks up where the last left off. You bring the idea and make
the decisions. Claude asks the questions, writes the code, runs the
checks and handles the setup.

You don't need to be a developer. Every step explains what it's doing in
plain words, asks one thing at a time, and checks with you before
anything important.

**New here?** Start with [Before you start](getting-ready.md): the accounts
and free tools to set up once.

**Already have an app?** [Adopt It](steps/adopt-it.md) is the other way in:
it takes the place of Spot It, Name It and Claim It, and brings your
app onto the journey.

| Step | In one line |
|---|---|
| [Spot It](steps/01-spot-it.md) | Find a real problem a simple app could fix. |
| [Name It](steps/02-name-it.md) | Give it a name, and decide what it's really for. |
| [Claim It](steps/03-claim-it.md) | Make it real: a live page at your own address. |
| [Meet It](steps/04-meet-it.md) | Get to know the people who'll use it. |
| [Dream It](steps/05-dream-it.md) | Get every idea out of your head and onto the board. |
| [Trim It](steps/06-trim-it.md) | Choose the smallest version worth building, and keep choosing. |
| [Skin It](steps/07-skin-it.md) | Choose how it looks: colors, fonts, the feel. Now, or after building a little. |
| [Build It](steps/08-build-it.md) | Build it one small, tested piece at a time. |
| [Ship It](steps/09-ship-it.md) | Put it live for real people, and check it works. |
| [Fix It](steps/10-fix-it.md) | When something breaks, find out why and fix it. *(coming soon)* |
| [Grow It](steps/11-grow-it.md) | Improve it from what real use teaches you. *(coming soon)* |

**Lost track of where you are?** Ask [What's Next](extras/whats-next.md): it
looks at your project and tells you the one thing to do now.

**Extras**, for when you need them:

| | In one line |
|---|---|
| [What's Next](extras/whats-next.md) | Lost track? It tells you where you are and what to do now. |
| [Your own web address](extras/custom-domain.md) | Move your app from `something.vercel.app` to a name you own. |

## How it fits together

```
Spot It -> Name It -> Claim It ---+                  (once: a new idea)
                                  |
Adopt It -------------------------+                  (once: an existing app)
                                  |
                                  v
        +--> Meet It -> Dream It -> Trim It ----+     (outer loop: what to build, for whom)
        |                    (Skin It, any time) |
        |                                        |
        |                                        v
     Grow It <--- Ship It <---> Build It <-------+    (inner loop: build and release)
                     ^             |
                     +-- Fix It <--+
```

**Once:** Spot It, Name It and Claim It, often in one sitting. They take
you from an idea to a live web address. **Already have an app?** Adopt It
takes their place: it brings your existing app onto the journey, then
you carry on with everyone else.

**The inner loop: Build It and Ship It.** This is where most of the time
goes. Build a few small pieces, put them live, repeat. Fix It jumps in
when something breaks.

**The outer loop: Meet It, Dream It, Trim It.** The first time through, it
plans your first version. After that, come back whenever real use has
taught you something: a new kind of person using the app, new ideas,
or a change of priorities. Then Trim It chooses what goes into the next
round of building. **Skin It** chooses how the app looks: right after
Trim It, or once you've built a little and know what you want. Grow It
(coming soon) will lead you around it;
until then, What's Next will nudge you when it's time.

## What it's built on

The same simple, mostly free tools for every app: a **Next.js** web app,
hosted on **Vercel**, with the code and the to-do board on **GitHub**,
and a **Supabase** database only if the app needs one. Free plans cover
all of those. The one thing to pay for is **Claude Pro** (Claude Code
isn't in Claude's free plan). Anything else paid is offered, never
assumed, and the cost is spelled out first.

## Our principles

- **Real from the start.** You'll have a live web address before you've
  built a single feature, and every step after keeps it working.
- **Nothing before it's needed.** No database until something needs to
  be saved. No accounts until someone needs to sign in.
- **Built for people.** Every feature is something a real person can do,
  never "set up the server".
- **Small and live.** Work isn't done when it's written. It's done when
  it's live and checked.
