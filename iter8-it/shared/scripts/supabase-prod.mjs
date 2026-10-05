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
//   node supabase-prod.mjs auth-config <project-ref> <https://live-url> [--dry-run]
//     Sets the live project's sign-in settings (site address, allowed
//     redirects, password length, email confirmation off). Only these.
//
//   node supabase-prod.mjs vercel-env <project-ref> <vercel-scope>
//     Sets the production environment variables on the linked Vercel project:
//     NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and
//     SUPABASE_SECRET_KEY (sensitive). Overwrites existing values.

import { execFileSync, execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
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
  // --reveal: without it the CLI masks secret keys ("sb_secret_mH9E3·········"),
  // and the masked text would be stored in Vercel as if it were the key.
  const listed = json(supabase(`projects api-keys --project-ref ${ref} --reveal -o json`));
  const keys = Array.isArray(listed) ? listed : (listed.keys ?? listed.api_keys ?? []);
  const publishable = keys.find((k) => k.type === "publishable")?.api_key;
  const secret = keys.find((k) => k.type === "secret")?.api_key;
  if (!publishable || !secret) fail("the project has no publishable/secret API keys yet. Create them in the dashboard (Settings -> API Keys).");
  // Never store a masked or truncated key.
  for (const [name, value] of [["publishable", publishable], ["secret", secret]]) {
    if (!/^sb_(publishable|secret)_[A-Za-z0-9_-]{20,}$/.test(value)) {
      fail(`the ${name} key from Supabase looks masked or incomplete, so it wasn't saved. Check \`supabase projects api-keys --reveal\`.`);
    }
  }

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

// Push only the sign-in settings to the production project. `config push`
// sends every property a config.toml declares, so push a temporary one
// that declares just these, never the project's own (which points at
// localhost). With --dry-run it only shows the differences.
//
// Email service (optional): with --smtp-host, the project sends its emails
// (confirm sign-up, reset password) through the user's own service instead
// of Supabase's built-in sender, which only reaches the Supabase team and
// sends very few. Only then is email confirmation turned on. The password
// comes from the SMTP_PASS environment variable, never the command line.
//   --smtp-host <host> --smtp-port <port> --smtp-user <user>
//   --smtp-sender <from address> --smtp-name <from name>
function authConfig(ref, liveUrl, ...rest) {
  const usage =
    "usage: auth-config <project-ref> <https://live-url> [--dry-run] " +
    "[--smtp-host <host> --smtp-port <port> --smtp-user <user> --smtp-sender <address> --smtp-name <name>] (SMTP_PASS in the environment)";
  if (!ref || !liveUrl?.startsWith("https://")) fail(usage);
  const flag = (name) => {
    const i = rest.indexOf(name);
    return i === -1 ? undefined : rest[i + 1];
  };
  const smtp = flag("--smtp-host")
    ? {
        host: flag("--smtp-host"),
        port: Number(flag("--smtp-port")),
        user: flag("--smtp-user"),
        sender: flag("--smtp-sender"),
        name: flag("--smtp-name"),
      }
    : null;
  if (smtp) {
    if (!smtp.port || !smtp.user || !smtp.sender || !smtp.name) fail(`all of the --smtp-* options are needed.\n${usage}`);
    if (!process.env.SMTP_PASS) fail("set SMTP_PASS to the email service's password or API key.");
  }
  const quote = (v) => JSON.stringify(String(v));
  const site = liveUrl.replace(/\/+$/, "");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "iter8-auth-"));
  try {
    fs.mkdirSync(path.join(dir, "supabase"));
    fs.writeFileSync(
      path.join(dir, "supabase", "config.toml"),
      [
        `project_id = "iter8-auth-config"`,
        ``,
        `[auth]`,
        `site_url = ${quote(site)}`,
        `additional_redirect_urls = [${quote(`${site}/**`)}]`,
        `minimum_password_length = 8`,
        ``,
        `[auth.email]`,
        // Confirming email only makes sense when emails can reach everyone.
        `enable_confirmations = ${smtp ? "true" : "false"}`,
        ``,
        ...(smtp
          ? [
              `[auth.email.smtp]`,
              `enabled = true`,
              `host = ${quote(smtp.host)}`,
              `port = ${smtp.port}`,
              `user = ${quote(smtp.user)}`,
              `pass = "env(SMTP_PASS)"`,
              `admin_email = ${quote(smtp.sender)}`,
              `sender_name = ${quote(smtp.name)}`,
              ``,
            ]
          : []),
      ].join("\n"),
    );
    const flags = rest;
    const workdir = `--project-ref ${ref} --workdir "${dir}"`;
    const result = json(supabase(`config diff ${workdir} --output-format json`));
    const declared = (result.changes ?? []).filter((c) => c.declared);
    for (const c of declared) {
      console.log(`${c.path.join(".")}: ${JSON.stringify(c.remote)} -> ${JSON.stringify(c.local)}`);
    }
    if (declared.length === 0) {
      console.log("Sign-in settings already match.");
      return 0;
    }
    if (flags.includes("--dry-run")) {
      console.log("(dry run: nothing changed)");
      return 0;
    }
    supabase(`config push ${workdir} --yes`);
    const after = json(supabase(`config diff ${workdir} --output-format json`));
    const left = (after.changes ?? []).filter((c) => c.declared);
    if (left.length) fail(`these sign-in settings didn't change: ${left.map((c) => c.path.join(".")).join(", ")}`);
    console.log("Sign-in settings updated.");
    return 0;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const [command, ...args] = process.argv.slice(2);
const commands = { password, wait, "github-secret": githubSecret, "vercel-env": vercelEnv, "auth-config": authConfig };
try {
  if (!commands[command]) {
    fail(
      "usage: supabase-prod.mjs password | wait <ref> [minutes] | github-secret <owner>/<repo> | vercel-env <ref> <scope> | auth-config <ref> <https://live-url> [--dry-run]",
    );
  }
  process.exitCode = await commands[command](...args);
} catch (err) {
  if (!(err instanceof ProdError)) throw err;
  console.error(`supabase-prod: ${err.message}`);
  process.exitCode = 1;
}
