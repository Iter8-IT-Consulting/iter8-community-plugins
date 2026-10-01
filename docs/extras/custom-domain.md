# Your own web address

**Move your app from `something.vercel.app` to a name you own.**

Claim It gives your app a free address like `slideit-two.vercel.app`.
It works, but it's not yours. Once the app is live and you're happy to
share it, give it a proper name: `slideit.apps.iter8.community`, or
`www.yourname.com`. One record at the company you bought the domain
from, and the rest is done for you.

## What happens

1. **Pick the name.** A part of a domain you already own
   (`slideit.apps.iter8.community`) is easiest: one record. The domain
   itself (`yourname.com`) works too.
2. **Vercel gets ready.** Claude connects the name to your app and asks
   Vercel for exactly the record it wants.
3. **You add one record.** Claude gives you step-by-step instructions for
   your registrar (GoDaddy, Namecheap, Cloudflare...): which page, which
   type, what to type in each box.
4. **It checks it's working.** Usually minutes, sometimes up to an hour,
   while the internet catches up. Vercel adds the padlock (https) by
   itself.
5. **Sign-in follows.** If your app has accounts, Claude points sign-in at
   the new address, so links in emails and sign-in redirects go to the
   right place. (This is the step people usually forget.)
6. **It checks it live,** and asks you to open the new address on your
   phone.

Your old `.vercel.app` address keeps working. You can make it forward to
the new one if you like.

## What you end up with

- Your app at your own address, with https.
- Sign-in, the project's links, and future releases all using it.

## What it asks of you

| | |
|---|---|
| **Time** | 10-20 minutes, plus a short wait for DNS |
| **Decisions** | The name |
| **You'll need** | A domain you own, and a login for wherever you bought it |
| **Cost** | Nothing extra from Vercel. You pay your registrar for the domain, as usual. |

**Do it before signing up yourself.** Your phone's password manager saves
your password against the address you used, so creating your account on
the final address keeps things tidy.

**When:** any time after the app is live. Just ask Claude for "a custom
domain", or put it on your board as a Feature.
