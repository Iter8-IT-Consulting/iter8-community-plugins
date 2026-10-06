# Ship It

**Put what you've built live for real people, and check it works there.**

Work isn't done when it's built. It's done when real people can use it.
Ship It takes everything Build It has finished and puts it live in one
careful release, then checks the live site itself, not just your
computer's copy.

## What happens

1. **What's going out.** A plain list of what people will be able to do
   after this release, plus any changes to the database, with anything
   risky flagged.
2. **A version number.** Claude suggests one and explains it: a small
   bump for fixes, a bigger one for new features, and **1.0.0** when your
   whole first version is live. You confirm.
3. **The first time your app needs a database online**, Ship It sets it
   up: a Supabase project on the free plan (or your paid one, with the
   cost stated first), connected to the live site. You save one password;
   it does the rest. If people sign in, it also points sign-in at your
   live address, and asks whether you have an **email sending service**
   (Resend, SendGrid and the like; Resend's free plan is plenty). With
   one, people confirm their email and can reset a forgotten password.
   Without one, sign-up still works, but reset emails only reach you and
   your team, so it reminds you to add one.
4. **The final checks.** Every test runs one last time on GitHub,
   including the ones that click through the app. Nothing goes live
   unless they pass.
5. **Go live.** The new version is published, and any database changes
   are applied automatically. Nobody ever edits the live database by
   hand.
6. **Check it live.** The tests run against your real web address, and
   you're asked to try the headline change yourself, on the device it's
   for.
7. **Close the loop.** A release page lists what's new, the finished
   cards move to **Done**, and the app's one-page **product brief**
   (in `PRODUCT.md`) is brought up to date: what it does today, and
   what's up next.

**If something goes wrong:** a failed build changes nothing for your
users, and the old version stays live. If a problem only shows up after
it's live, Ship It offers to roll back to the previous version in
seconds.

## What you end up with

- A new version live at your web address.
- A release page on GitHub, a running history of "what's new".
- A board where **Done** means live.

## What it asks of you

| | |
|---|---|
| **Time** | 10-15 minutes, mostly waiting on checks and the deploy |
| **Decisions** | Go ahead with the release; the version number; trying it live |
| **Cost** | Nothing, unless your app needs a database on a paid Supabase plan (stated up front) |

Then: back to Build It for the next piece, or Trim It to choose what's
next.

**Next:** [Fix It](10-fix-it.md) when something breaks, [Grow It](11-grow-it.md)
as people use it, and [your own web address](../extras/custom-domain.md)
whenever you're ready to share it.
