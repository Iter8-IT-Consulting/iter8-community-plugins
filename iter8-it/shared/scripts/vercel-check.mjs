#!/usr/bin/env node
// Claim It: Vercel checks the CLI doesn't do. Run from the project root
// after `vercel link` (the team comes from .vercel/project.json).
//
//   node <plugin>/shared/scripts/vercel-check.mjs account
//     The signed-in Vercel account's username and email. Vercel blocks
//     deploys of commits whose author email it doesn't recognize, so commits
//     should use this email. Works before `vercel link`.
//
//   node <plugin>/shared/scripts/vercel-check.mjs visible <owner>/<repo>
//     Can the Vercel GitHub App see the repo? Check before
//     `vercel git connect` (which fails vaguely when it can't), and again
//     after the user changes the app's access.
//     Exit: 0 visible, 2 not visible (prints where to fix it), 1 error.
//
//   node <plugin>/shared/scripts/vercel-check.mjs project <project-name>
//     Prints the project's Git connection, production branch and
//     production URL as JSON.
//     Exit: 0 ok, 1 error.
//
//   node <plugin>/shared/scripts/vercel-check.mjs domain <domain>
//     How Vercel wants the domain's DNS set up, and whether it already is:
//     Vercel's first-choice CNAME and A values, and the current state.
//     Exit: 0 configured, 2 not configured yet, 1 error.
//
//   node <plugin>/shared/scripts/vercel-check.mjs deployment <project-name> <commit-sha> [minutes]
//     Waits (default 10 minutes) for the production deployment of that
//     commit to finish, then prints it as JSON. One blocking wait: it prints
//     one line when it starts waiting and nothing more until it's done.
//     Exit: 0 READY, 2 failed/blocked/canceled/timed out, 1 error.

import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [command, arg] = process.argv.slice(2);

// Errors are thrown and reported once at the bottom. (Calling process.exit()
// while fetch handles are closing crashes Node on Windows.)
class CheckError extends Error {}
function fail(message) {
  throw new CheckError(message);
}

if (
  !(
    command === "account" ||
    (["visible", "project", "domain"].includes(command) && arg) ||
    (command === "deployment" && arg && process.argv[4])
  )
) {
  console.error(
    "usage: vercel-check.mjs account | visible <owner>/<repo> | project <project-name> | domain <domain> | deployment <project-name> <sha> [minutes]",
  );
  process.exit(1);
}

// Where the Vercel CLI keeps its login, by platform.
function findToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const home = os.homedir();
  const candidates = [
    process.env.APPDATA && path.join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    path.join(home, "Library", "Application Support", "com.vercel.cli", "auth.json"),
    path.join(process.env.XDG_DATA_HOME || path.join(home, ".local", "share"), "com.vercel.cli", "auth.json"),
  ].filter(Boolean);
  const file = candidates.find((c) => fs.existsSync(c));
  if (file) {
    let auth = JSON.parse(fs.readFileSync(file, "utf8"));
    // Vercel CLI logins expire after a few hours; the CLI renews them when
    // it runs, so let it do that, then read the new token.
    if (auth.expiresAt && auth.expiresAt * 1000 < Date.now() + 60_000) {
      try {
        execSync("vercel whoami", { stdio: "ignore" });
      } catch {
        fail("the Vercel login has expired and couldn't be renewed. Run `vercel login`.");
      }
      auth = JSON.parse(fs.readFileSync(file, "utf8"));
    }
    if (auth.token) return auth.token;
  }
  fail(`no Vercel CLI login found (looked in ${candidates.join(", ")}). Run \`vercel login\`.`);
}

let teamId;
let headers;
function init() {
  headers = { Authorization: `Bearer ${findToken()}` };
  if (command === "account") return;
  const projectFile = path.join(process.cwd(), ".vercel", "project.json");
  if (!fs.existsSync(projectFile)) fail(".vercel/project.json not found. Run `vercel link` first.");
  teamId = JSON.parse(fs.readFileSync(projectFile, "utf8")).orgId;
}

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) fail(`${res.status} from ${url.split("?")[0]}: ${await res.text()}`);
  return res.json();
}

async function account() {
  const { user } = await get("https://api.vercel.com/v2/user");
  console.log(JSON.stringify({ username: user.username, email: user.email }, null, 2));
  return 0;
}

async function visible(ownerRepo) {
  const [owner, repo] = ownerRepo.split("/");
  if (!owner || !repo) fail("expected <owner>/<repo>");

  // The GitHub accounts/orgs the Vercel app is installed on. This endpoint
  // rejects a teamId parameter.
  const namespaces = await get("https://api.vercel.com/v1/integrations/git-namespaces?provider=github");
  const namespace = namespaces.find((n) => n.slug?.toLowerCase() === owner.toLowerCase());
  if (!namespace) {
    console.log(`NOT VISIBLE: the Vercel GitHub App isn't installed on "${owner}".`);
    console.log("Install it at https://github.com/apps/vercel/installations/new and give it access to the repo.");
    return 2;
  }

  const found = (repos) =>
    (repos ?? []).some(
      (r) => r.namespace?.toLowerCase() === owner.toLowerCase() && r.name?.toLowerCase() === repo.toLowerCase(),
    );
  const base =
    "https://api.vercel.com/v1/integrations/search-repo" +
    `?provider=github&teamId=${teamId}&namespaceId=${namespace.id}`;
  if (found((await get(`${base}&query=${encodeURIComponent(repo)}`)).repos) || found((await get(base)).repos)) {
    console.log(`VISIBLE: Vercel can see ${owner}/${repo}.`);
    return 0;
  }

  const settings =
    namespace.ownerType === "user"
      ? "https://github.com/settings/installations"
      : `https://github.com/organizations/${owner}/settings/installations`;
  console.log(`NOT VISIBLE: the Vercel GitHub App on "${owner}" can't see ${repo}.`);
  console.log(`Fix: open ${settings}, click Configure next to Vercel,`);
  console.log(`add "${repo}" under Repository access (or choose All repositories), and Save.`);
  return 2;
}

async function project(name) {
  const p = await get(`https://api.vercel.com/v9/projects/${encodeURIComponent(name)}?teamId=${teamId}`);
  const aliases = p.targets?.production?.alias ?? [];
  // The first *.vercel.app alias that isn't a branch alias is the one Vercel
  // shows as the production URL (e.g. slug.vercel.app, or slug-xyz.vercel.app
  // when that's taken).
  const url = aliases.find((a) => a.endsWith(".vercel.app") && !a.includes("-git-"));
  console.log(
    JSON.stringify(
      {
        project: p.name,
        git: p.link ? `${p.link.org}/${p.link.repo}` : null,
        productionBranch: p.link?.productionBranch ?? null,
        productionUrl: url ? `https://${url}` : null,
        productionState: p.targets?.production?.readyState ?? null,
        aliases,
      },
      null,
      2,
    ),
  );
  return 0;
}

async function domain(name) {
  const config = await get(`https://api.vercel.com/v6/domains/${encodeURIComponent(name)}/config?teamId=${teamId}`);
  const first = (list) => (list ?? []).find((r) => r.rank === 1)?.value;
  const cname = first(config.recommendedCNAME);
  const a = first(config.recommendedIPv4);
  const isApex = name.split(".").length <= 2;
  console.log(
    JSON.stringify(
      {
        domain: name,
        configured: config.misconfigured === false,
        configuredBy: config.configuredBy ?? null,
        // A subdomain takes one CNAME; a bare domain takes A records.
        addThisRecord: isApex
          ? { type: "A", values: Array.isArray(a) ? a : [a] }
          : { type: "CNAME", value: typeof cname === "string" ? cname.replace(/.$/, "") : cname },
        currentA: config.aValues ?? [],
        currentCNAME: config.cnames ?? [],
      },
      null,
      2,
    ),
  );
  return config.misconfigured === false ? 0 : 2;
}

async function deployment(name) {
  const sha = process.argv[4];
  const minutes = Number(process.argv[5] ?? 10);
  const deadline = Date.now() + minutes * 60_000;
  const done = ["READY", "ERROR", "CANCELED", "BLOCKED"];
  console.error(`Waiting for Vercel to build and deploy ${sha.slice(0, 7)} (up to ${minutes} minutes)...`);
  let latest = null;
  while (Date.now() < deadline) {
    const { deployments } = await get(
      `https://api.vercel.com/v6/deployments?app=${encodeURIComponent(name)}&target=production&limit=20&teamId=${teamId}`,
    );
    latest = deployments.find((d) => d.meta?.githubCommitSha === sha) ?? null;
    if (latest && done.includes(latest.state ?? latest.readyState)) break;
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  const state = latest ? (latest.state ?? latest.readyState) : "NOT_FOUND";
  console.log(
    JSON.stringify(
      {
        sha,
        state: done.includes(state) || state === "NOT_FOUND" ? state : `TIMED_OUT (${state})`,
        url: latest ? `https://${latest.url}` : null,
        inspectorUrl: latest?.inspectorUrl ?? null,
      },
      null,
      2,
    ),
  );
  return state === "READY" ? 0 : 2;
}

try {
  init();
  process.exitCode = await { account, visible, project, domain, deployment }[command](arg);
} catch (err) {
  if (!(err instanceof CheckError)) throw err;
  console.error(`vercel-check: ${err.message}`);
  process.exitCode = 1;
}
