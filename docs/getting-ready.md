# Before you start

**What you need on your computer, and the accounts to sign up for, before
Spot It.**

Most of it is free, and you only do it once per computer. Allow about
30-45 minutes, mostly downloads. If anything here is new to you, that's
fine: Claim It checks all of it again before it creates anything, and
tells you exactly what's missing.

## What it costs

| | Cost |
|---|---|
| **Claude Pro** (or Max, Team or Enterprise) | **Paid: the one thing you need to pay for.** Claude Code isn't included in Claude's free plan. Pro is enough for building an app; its limits rarely get in the way. |
| GitHub, Vercel, Supabase accounts | Free plans cover everything iter8-it does. |
| VS Code, Git, Node.js, the GitHub and Vercel tools, Docker Desktop | Free. Docker Desktop is free for personal use and small businesses. |
| Your own web address (optional) | Whatever your domain costs at the company you buy it from. |

## 1. Accounts

Sign up for these in a web browser. Use the same email for all of them if
you can. Vercel and Supabase both let you sign up **with your GitHub
account**, which keeps things simple.

- [ ] **Claude**: claude.ai, on the **Pro** plan (or higher)
- [ ] **GitHub**: github.com (free). Your code and your project board live here.
- [ ] **Vercel**: vercel.com, the **Hobby** plan (free). Hosts your live app.
- [ ] **Supabase**: supabase.com (free). The database and sign-in, only
  needed once your app saves data or has accounts. You can sign up later.

## 2. Install on your computer

On **Windows 11**, open **PowerShell** and paste these one at a time
(`winget` comes with Windows):

```powershell
winget install Microsoft.VisualStudioCode
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install GitHub.cli
winget install Docker.DockerDesktop
```

Then **close PowerShell, open a new one** (so it finds Node.js), and:

```powershell
npm install -g vercel
```

On a **Mac**, install [Homebrew](https://brew.sh) first, then in Terminal:

```bash
brew install --cask visual-studio-code docker
brew install git node gh
npm install -g vercel
```

What each one is for:

| Tool | What it's for |
|---|---|
| **VS Code** | Where you'll work: Claude Code runs inside it. |
| **Git** | Keeps every version of your code. |
| **Node.js** (the LTS version) | Runs your app on your computer while you build it. |
| **GitHub CLI** (`gh`) | Lets Claude create your repo, board and pull requests. |
| **Vercel CLI** (`vercel`) | Lets Claude set up hosting and check your live site. |
| **Docker Desktop** | Runs a local copy of your database. Only needed once your app saves data; you can install it later. Start it once after installing. |

You **don't** need to install the Supabase tools or the test browsers:
Build It and Claim It add those to each project themselves.

## 3. Claude Code in VS Code

1. Open VS Code, go to **Extensions** (the squares icon on the left), search
   for **Claude Code**, and install it (it's by Anthropic).
2. Open the Claude Code panel and **sign in** with your Claude account.

## 4. Sign in to the tools (once)

In a terminal (in VS Code: **Terminal -> New Terminal**):

```bash
gh auth login        # GitHub: choose GitHub.com, HTTPS, and log in with a browser
vercel login         # Vercel: log in with a browser
```

And later, the first time your app needs a database online (Ship It will
remind you):

```bash
npx supabase login   # Supabase: log in with a browser
```

## 5. Add iter8-it to Claude Code

In the Claude Code panel, type:

```
/plugin marketplace add Iter8-IT-Consulting/iter8-community-plugins
/plugin install iter8-it@iter8-community-plugins
```

Then type `/iter8-it` and you should see the steps (`spot-it`,
`name-it`, ...). To get updates later:
`/plugin marketplace update iter8-community-plugins`.

## Nice to have

- **A phone** to try your app on. Most apps are used on phones.
- **A password manager.** Ship It gives you a database password to keep
  safe.
- **A domain name**, if you want your app on its own address. Not needed
  to start: see [Your own web address](extras/custom-domain.md).
- **A partner.** Two heads are better for Spot It, Meet It and Dream It.

## Check you're ready

In a new terminal, each of these should print a version number:

```bash
git --version
node --version       # 20 or newer
gh --version
vercel --version
docker --version     # only once you've installed Docker Desktop
```

And `gh auth status` and `vercel whoami` should show your accounts.

**Next:** make a new, empty folder for your idea, open it in VS Code,
and start [Spot It](steps/01-spot-it.md).
