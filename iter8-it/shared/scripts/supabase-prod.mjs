#!/usr/bin/env node
// iter8-it: production database helpers for Ship It (see
// shared/supabase-prod.md). Run from the project folder. Secrets are never
// printed: they're passed through environment variables and stdin.
//
//   node supabase-prod.mjs password
//     Prints a strong random database password (letters and digits only).
//
//   node supabase-prod.mjs wait <project-ref> [minutes]
//     Waits (default 10 minutes) until the project is ACTIVE_HEALTHY.
//     Exit: 0 healthy, 2 not healthy in time, 1 error.
//
//   SUPABASE_DB_PASSWORD=... node supabase-prod.mjs github-secret <owner>/<repo>
//     Builds the session-pooler connection string from
//     supabase/.temp/pooler-url (written by `supabase link`) and the password
//     (percent-encoded), and stores it as the GitHub Actions secret
//     SUPABASE_DB_URL. The migrate Action uses it.
//
//   node supabase-prod.mjs vercel-env <project-ref> <vercel-scope>
//     Sets the production environment variables on the linked Vercel project:
//     NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and
//     SUPABASE_SECRET_KEY (sensitive). Overwrites existing values.

import { execFileSync, execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

class ProdError extends Error {}
function fail(message) {
  throw new ProdError(message);
}

// Supabase CLI with stdin closed (some commands wait for piped input).
function supabase(args) {
  try {
    const out = execSync(`npx supabase ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return out;
  } catch (err) {
    fail(`\`supabase ${args.split(" ")[0]} ...\` failed: ${String(err.stderr || err.message).trim()}`);
  }
}

function json(out) {
  const start = out.search(/[[{]/);
  return JSON.parse(out.slice(start));
}

function password() {
  // 32 characters from [A-Za-z0-9]: strong, and needs no escaping anywhere.
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(64);
  let result = "";
  for (const b of bytes) {
    if (b < 248) result += chars[b % 62];
    if (result.length === 32) break;
  }
  console.log(result);
  return 0;
}

async function wait(ref, minutes = "10") {
  if (!ref) fail("usage: wait <project-ref> [minutes]");
  const deadline = Date.now() + Number(minutes) * 60_000;
  console.error(`Waiting for the Supabase project ${ref} to be ready (up to ${minutes} minutes)...`);
  let status = "UNKNOWN";
  while (Date.now() < deadline) {
    const listed = json(supabase("projects list -o json"));
    const projects = Array.isArray(listed) ? listed : (listed.projects ?? []);
    status = projects.find((p) => p.ref === ref)?.status ?? "NOT_FOUND";
    if (status === "ACTIVE_HEALTHY") break;
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }
  console.log(JSON.stringify({ ref, status }));
  return status === "ACTIVE_HEALTHY" ? 0 : 2;
}

function githubSecret(repo) {
  if (!repo?.includes("/")) fail("usage: SUPABASE_DB_PASSWORD=... github-secret <owner>/<repo>");
  const pw = process.env.SUPABASE_DB_PASSWORD;
  if (!pw) fail("set SUPABASE_DB_PASSWORD to the production database password.");
  const file = path.join(process.cwd(), "supabase", ".temp", "pooler-url");
  if (!fs.existsSync(file)) fail("supabase/.temp/pooler-url not found. Run `npx supabase link --project-ref <ref>` first.");
  const pooler = new URL(fs.readFileSync(file, "utf8").trim());
  if (pooler.port !== "5432") fail(`expected the session pooler (port 5432), got port ${pooler.port}.`);
  pooler.password = encodeURIComponent(pw);
  execFileSync("gh", ["secret", "set", "SUPABASE_DB_URL", "--repo", repo], {
    input: pooler.toString(),
    stdio: ["pipe", "inherit", "inherit"],
  });
  console.log(`Stored SUPABASE_DB_URL for ${repo} (session pooler ${pooler.hostname}).`);
  return 0;
}

function vercelEnv(ref, scope) {
  if (!ref || !scope) fail("usage: vercel-env <project-ref> <vercel-scope>");
  const listed = json(supabase(`projects api-keys --project-ref ${ref} -o json`));
  const keys = Array.isArray(listed) ? listed : (listed.keys ?? listed.api_keys ?? []);
  const publishable = keys.find((k) => k.type === "publishable")?.api_key;
  const secret = keys.find((k) => k.type === "secret")?.api_key;
  if (!publishable || !secret) fail("the project has no publishable/secret API keys yet. Create them in the dashboard (Settings -> API Keys).");

  const vars = [
    ["NEXT_PUBLIC_SUPABASE_URL", `https://${ref}.supabase.co`, false],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishable, false],
    ["SUPABASE_SECRET_KEY", secret, true],
  ];
  for (const [name, value, sensitive] of vars) {
    const args = ["env", "add", name, "production", "--scope", scope, "--force", "--yes"];
    if (sensitive) args.push("--sensitive");
    try {
      execFileSync("vercel", args, { input: value, stdio: ["pipe", "pipe", "pipe"], shell: process.platform === "win32" });
    } catch (err) {
      fail(`couldn't set ${name} on Vercel: ${String(err.stderr || err.message).trim()}`);
    }
    console.log(`Set ${name} (production)${sensitive ? " [sensitive]" : ""}`);
  }
  return 0;
}

const [command, ...args] = process.argv.slice(2);
const commands = { password, wait, "github-secret": githubSecret, "vercel-env": vercelEnv };
try {
  if (!commands[command]) fail("usage: supabase-prod.mjs password | wait <ref> [minutes] | github-secret <owner>/<repo> | vercel-env <ref> <scope>");
  process.exitCode = await commands[command](...args);
} catch (err) {
  if (!(err instanceof ProdError)) throw err;
  console.error(`supabase-prod: ${err.message}`);
  process.exitCode = 1;
}
