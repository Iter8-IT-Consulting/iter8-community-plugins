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
| | [What's Next](steps/whats-next.md) | Lost track? It tells you where you are and what to do now. |

## How it fits together

```
Spot It -> Name It -> Claim It -> Meet It -> Dream It -> Trim It
                                                            |
                         +---------> Build It -> Ship It ---+
                         |                         |
                         +---- Fix It, Grow It <---+
```

The first steps happen once, often in one or two sittings: Spot, Name and
Claim together, then Meet, Dream and Trim together. After that, **Build
It and Ship It are a loop**: build a few pieces, put them live, repeat.
Trim It comes back whenever you need to choose what's next.

## What it's built on

The same simple, mostly free tools for every app: a **Next.js** web app,
hosted on **Vercel**, with the code and the to-do board on **GitHub**,
and a **Supabase** database only if the app needs one. Free plans cover
almost everything. Anything paid is offered, never assumed, and the cost
is spelled out first.

## Our principles

- **Real from the start.** You'll have a live web address before you've
  built a single feature, and every step after keeps it working.
- **Nothing before it's needed.** No database until something needs to
  be saved. No accounts until someone needs to sign in.
- **Built for people.** Every feature is something a real person can do,
  never "set up the server".
- **Small and live.** Work isn't done when it's written. It's done when
  it's live and checked.
