# Give the app its own web address (custom domain)

Moves the live app from its `*.vercel.app` address to a name the user
owns, such as `slideit.apps.iter8.community`. Run it once, after the app
is live, whenever the user asks (a Feature on the board, or Grow It's
upgrade list). It works for a domain bought anywhere: GoDaddy, Namecheap,
Cloudflare and so on.

`<plugin>` is the iter8-it plugin folder. Read `journey.json` for
`vercel.scope`, `vercel.project`, `vercel.url` and `supabase.projectRef`.

## Tell the user first

> I'll connect **<domain>** to your app. Vercel does most of it; you'll
> add one record in **<registrar>**'s DNS settings, which I'll spell out.
> Once it's verified (usually minutes, sometimes an hour), I'll point
> sign-in at the new address and check it all works. There's no cost from
> Vercel; you already own the domain.

## 1. Decide the name

- A **subdomain** (`slideit.apps.iter8.community`, `app.example.com`)
  needs one CNAME record. Easiest, and the usual choice.
- The **bare domain** (`example.com`) needs an A record, and usually a
  `www` CNAME too. Fine, but say there are two records.

Check it's free: `nslookup <domain> 8.8.8.8` should say it doesn't exist
(or point somewhere the user is happy to replace). Find where its DNS is
managed: `nslookup -type=NS <parent domain> 8.8.8.8`
(`domaincontrol.com` = GoDaddy, `cloudflare.com` = Cloudflare, ...).

## 2. Attach it in Vercel

```bash
vercel domains add <domain> <vercel.project> --scope <vercel.scope>
vercel domains inspect <domain> --scope <vercel.scope>
```

`inspect` shows the DNS record Vercel wants (type, name, value). **Use
exactly that value.** Vercel gives project-specific targets (like
`600d5ac992f47442.vercel-dns-017.com`), not a generic one.

## 3. The DNS record (the user does this)

Give the user exact, copy-pasteable steps for their registrar. For
GoDaddy:

> 1. Sign in to GoDaddy -> **My Products** -> next to **<parent domain>**,
>    **DNS** (or **Manage DNS**).
> 2. **Add New Record**:
>    - **Type:** CNAME
>    - **Name:** `<the part before the parent domain>` (for
>      `slideit.apps.iter8.community` it's `slideit.apps`)
>    - **Value:** `<the value from vercel domains inspect>`
>    - **TTL:** default (1 hour is fine)
> 3. **Save.**

Wait for them to say it's saved. Then check it's visible:

```bash
nslookup -type=CNAME <domain> 8.8.8.8
```

It should show the value from step 2. If not yet: say DNS can take a few
minutes to spread, and check again when they're ready (one check per
request, no polling loop).

## 4. Wait for Vercel

```bash
vercel domains inspect <domain> --scope <vercel.scope>
node <plugin>/shared/scripts/vercel-check.mjs project <vercel.project>
```

The domain should show as configured, and `aliases` in `vercel-check`
should include it. Then open `https://<domain>`: the certificate
(https) is issued by Vercel automatically, sometimes a minute or two
after the DNS check passes.

## 5. Point sign-in at the new address (apps with sign-in)

If the app has accounts (`journey.json` `needs.auth`, or
`src/lib/auth.ts` exists), Supabase's sign-in settings must use the new
address, or links in its emails and sign-in redirects go to the old one:

```bash
node <plugin>/shared/scripts/supabase-prod.mjs auth-config <supabase.projectRef> https://<domain> --dry-run
node <plugin>/shared/scripts/supabase-prod.mjs auth-config <supabase.projectRef> https://<domain>
```

(It replaces the allowed redirects with the new address. The old
`*.vercel.app` address keeps working for browsing, but sign-in links will
use the new one.)

## 6. Check it live

```bash
BASE_URL=https://<domain> npm run test:e2e -- --grep-invert @writes
```

Then ask the user to open `https://<domain>` on their phone, and, with
sign-in, to sign in there.

## 7. Record it

- `journey.json`: `vercel.url` = `https://<domain>`. Every later step
  (Ship It's live checks, What's Next) uses it.
- `CLAUDE.md` **Links**: `Live:` -> the new address (keep the old one on a
  line below as "also").
- `README.md`: if it mentions the address, update it.

Commit to `dev` ("Custom domain: <domain>") and push. If a Feature or
story on the board covers it, comment on it and move it to Done: it's
live as soon as DNS and sign-in are switched, with no release needed.

## Optional: send the old address to the new one

To make `*.vercel.app` redirect to the new name, in Vercel: the project
-> **Settings -> Domains** -> the `.vercel.app` entry -> **Edit** ->
**Redirect to** `<domain>` (308). Offer it; it's the user's call.
