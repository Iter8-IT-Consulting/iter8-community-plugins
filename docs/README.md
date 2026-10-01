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

| | Step | In one line |
|---|---|---|
| 1 | [Spot It](steps/01-spot-it.md) | Find a real problem a simple app could fix. |
| 2 | [Name It](steps/02-name-it.md) | Give it a name, and decide what it's really for. |
| 3 | [Claim It](steps/03-claim-it.md) | Make it real: a live page at your own address. |
| 4 | [Meet It](steps/04-meet-it.md) | Get to know the people who'll use it. |
| 5 | [Dream It](steps/05-dream-it.md) | Get every idea out of your head and onto the board. |
| 6 | [Trim It](steps/06-trim-it.md) | Choose the smallest version worth building, and keep choosing. |
| 7 | [Build It](steps/07-build-it.md) | Build it one small, tested piece at a time. |
| 8 | [Ship It](steps/08-ship-it.md) | Put it live for real people, and check it works. |
| 9 | [Fix It](steps/09-fix-it.md) | When something breaks, find out why and fix it. *(coming soon)* |
| 10 | [Grow It](steps/10-grow-it.md) | Improve it from what real use teaches you. *(coming soon)* |

**Lost track of where you are?** Ask [What's Next](extras/whats-next.md): it
looks at your project and tells you the one thing to do now.

**Extras**, for when you need them:

| | In one line |
|---|---|
| [What's Next](extras/whats-next.md) | Lost track? It tells you where you are and what to do now. |
| [Your own web address](extras/custom-domain.md) | Move your app from `something.vercel.app` to a name you own. |
| [Adopt It](extras/adopt-it.md) | Bring an app you've already started onto the journey. *(coming soon)* |

## How it fits together

```
Spot It -> Name It -> Claim It                        (once)
                         |
                         v
        +--> Meet It -> Dream It -> Trim It ----+     (outer loop: what to build, for whom)
        |                                        |
        |                                        v
     Grow It <--- Ship It <---> Build It <-------+    (inner loop: build and release)
                     ^             |
                     +-- Fix It <--+
```

**Once:** Spot It, Name It and Claim It, often in one sitting. They take
you from an idea to a live web address.

**The inner loop: Build It and Ship It.** This is where most of the time
goes. Build a few small pieces, put them live, repeat. Fix It jumps in
when something breaks.

**The outer loop: Meet It, Dream It, Trim It.** The first time through, it
plans your first version. After that, come back whenever real use has
taught you something: a new kind of person using the app, new ideas,
or a change of priorities. Then Trim It chooses what goes into the next
round of building. Grow It (coming soon) will lead you around it;
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
