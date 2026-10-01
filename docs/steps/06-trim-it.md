# Trim It

**Cut the list down to the smallest version someone would actually use,
and keep choosing what's next.**

Dream It filled the Backlog. Trim It decides what's worth building
*now*. The question for every idea is simple: **would anyone miss this in
the next version?** If not, it waits. Cutting isn't failure. It's how you
get something real into people's hands quickly, and then learn what
actually matters.

## What happens

First, one sentence: what should someone be able to do, start to finish,
when this version is live? That's the test for every idea. Then Claude
walks the Backlog with you, one idea at a time. Each gets one of four
decisions:

| Decision | What happens |
|---|---|
| **Next** | Moves to **Todo**, in the order to build it. |
| **Later** | Stays in Backlog with a `later` tag and the reason, so you remember why. |
| **Never** | Closed as "not planned", with the reason. It can be reopened. |
| **Not decided** | Stays in Backlog. Fine for brand-new ideas. |

Then you put Todo in **build order**, aiming for something usable end to
end as early as possible. A thin version of the whole journey beats one
perfect piece.

The first time, Trim It also asks two questions that shape everything
under the hood: **Do people sign in? Does the app need to remember
anything?** If not, there's no database at all: simpler, and free
forever.

And it helps you choose the app's **layout**, its overall shape. Claude
recommends one from your people and their devices, with a reason:

| Layout | In one line |
|---|---|
| **Single-purpose tool** | One focused screen that does one job well. |
| **Signed-in app with navigation** | Lists of "my things", detail pages, and a menu between areas. |
| **Mobile-first with bottom tabs** | A phone app in the browser: a few main areas, one tap apart. |
| **Two-sided** | One person creates on a big screen; others follow on their phones. |

Or none of these: describe what you picture, and that becomes the plan.

Separately: does it need a **front page**? That's a public page that
explains the app to newcomers, with "Get started" leading in. It works
with any layout.
Build It's first story builds the frame, so every later feature lands in
the same place.

## Grooming: Trim It again and again

Trim It isn't only for the first version. **Run it whenever Todo is
getting short**, new ideas have piled up, or plans have changed. It
looks again at the parked `later` ideas ("is that reason still true?"),
picks the next batch and puts them in order. What's Next and Ship It
will both suggest it when Todo runs out.

And you can always drag cards between Backlog and Todo yourself. The
board is the plan, and every step follows it.

## What you end up with

```
Backlog -> Todo -> In Progress -> In Review -> Done
 ideas     next      building      checking     live
```

- A Todo column that says exactly what to build, in what order.
- A Backlog of everything else, with reasons attached.
- A short description of the first version in `PRODUCT.md`.

## What it asks of you

| | |
|---|---|
| **Time** | 20-30 minutes the first time; 10 minutes to groom |
| **Decisions** | What's in, what waits, what goes, and the order |
| **Cost** | Nothing |

**Next:** [Build It](07-build-it.md)
