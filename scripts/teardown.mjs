#!/usr/bin/env node
// Test helper (not a skill): remove everything a test run of the iter8-it
// skills created online for one slug, so the next run starts clean.
//
//   node scripts/teardown.mjs <slug> --owner <github-owner> --scope <vercel-scope> [--yes] [--any-slug]
//
// Without --yes it only lists what it would delete. Run it once, check the
// list, then run it again with --yes.
//
// It deletes:
//   - the GitHub repo <owner>/<slug>
//   - GitHub Projects linked to that repo
//   - the Vercel project <slug> in <scope>
//   - Supabase projects named <slug> (in any org the Supabase CLI can see)
// It never touches org settings (Issue Types, app installations) or the
// local folder. (Stop the local Supabase yourself: `npx supabase stop` in
// the project folder.)
//
// Only slugs starting with "itplug-test-" are allowed, unless --any-slug is
// given (e.g. to tear down an earlier real attempt).
//
// Deleting a repo needs gh's delete_repo scope:
//   gh auth refresh -h github.com -s delete_repo
// (the browser confirmation is easy to miss; without it the scope isn't added).

import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const slug = args[0]?.startsWith("--") ? undefined : args[0];
const owner = flag("--owner");
const scope = flag("--scope");
const yes = args.includes("--yes");

if (!slug || !owner || !scope) {
  console.error("usage: teardown.mjs <slug> --owner <github-owner> --scope <vercel-scope> [--yes] [--any-slug]");
  process.exit(1);
}
if (!slug.startsWith("itplug-test-") && !args.includes("--any-slug")) {
  console.error(`teardown: "${slug}" isn't a test slug (itplug-test-*). Pass --any-slug if you really mean it.`);
  process.exit(1);
}

function gh(ghArgs, input) {
  return execFileSync("gh", ghArgs, { encoding: "utf8", input, stdio: ["pipe", "pipe", "pipe"] });
}

function vercelToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const home = os.homedir();
  const candidates = [
    process.env.APPDATA && path.join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    path.join(home, "Library", "Application Support", "com.vercel.cli", "auth.json"),
    path.join(process.env.XDG_DATA_HOME || path.join(home, ".local", "share"), "com.vercel.cli", "auth.json"),
  ].filter(Boolean);
  for (const file of candidates) {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")).token;
  }
  return null;
}

async function vercel(method, url) {
  const token = vercelToken();
  if (!token) throw new Error("no Vercel CLI login found. Run `vercel login`.");
  const res = await fetch(`https://api.vercel.com${url}`, { method, headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} from Vercel ${url.split("?")[0]}: ${await res.text()}`);
  return res.status === 204 ? {} : res.json();
}

// Supabase CLI with stdin closed (some commands wait for piped input).
function supabase(args) {
  return execSync(`npx supabase ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

// --- Find what exists -------------------------------------------------------

const found = [];

let repoExists = false;
let projects = [];
try {
  const out = gh(["api", "graphql", "--input", "-"], JSON.stringify({
    query: `query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        nameWithOwner
        projectsV2(first: 20) { nodes { number title url } }
      }
    }`,
    variables: { owner, name: slug },
  }));
  const repo = JSON.parse(out).data?.repository;
  if (repo) {
    repoExists = true;
    projects = repo.projectsV2.nodes;
    found.push(`GitHub repo      ${repo.nameWithOwner}`);
    for (const p of projects) found.push(`GitHub project   #${p.number} "${p.title}" ${p.url}`);
  }
} catch (err) {
  // gh exits non-zero when the repo doesn't exist; that's fine.
  if (!String(err.stderr ?? "").includes("Could not resolve to a Repository")) throw err;
}

const team = await vercel("GET", `/v2/teams/${encodeURIComponent(scope)}`);
const teamQuery = team ? `?teamId=${team.id}` : "";
const vproject = await vercel("GET", `/v9/projects/${encodeURIComponent(slug)}${teamQuery}`);
if (vproject) found.push(`Vercel project   ${scope}/${vproject.name}`);

let supabaseProjects = [];
try {
  const out = supabase("projects list -o json");
  const listed = JSON.parse(out.slice(out.search(/[[{]/)));
  supabaseProjects = (Array.isArray(listed) ? listed : (listed.projects ?? [])).filter((p) => p.name === slug);
  for (const p of supabaseProjects) {
    found.push(`Supabase project ${p.name} (ref ${p.ref}, org ${p.organization_id}, ${p.status})`);
  }
} catch (err) {
  const reason = String(err.stderr ?? err.message).trim().split("\n")[0];
  console.error(`(Couldn't list Supabase projects, so they're not checked: ${reason})`);
}

if (found.length === 0) {
  console.log(`Nothing found online for "${slug}". Already clean.`);
  process.exit(0);
}

console.log(`Found for "${slug}":`);
for (const line of found) console.log(`  ${line}`);

if (!yes) {
  console.log("\nNothing deleted. Run again with --yes to delete all of the above.");
  process.exit(0);
}

// --- Delete -----------------------------------------------------------------

let failed = false;

for (const p of projects) {
  try {
    gh(["project", "delete", String(p.number), "--owner", owner]);
    console.log(`Deleted GitHub project #${p.number}`);
  } catch (err) {
    failed = true;
    console.error(`Couldn't delete GitHub project #${p.number}: ${String(err.stderr ?? err.message).trim()}`);
  }
}

if (repoExists) {
  try {
    gh(["repo", "delete", `${owner}/${slug}`, "--yes"]);
    console.log(`Deleted GitHub repo ${owner}/${slug}`);
  } catch (err) {
    failed = true;
    const message = String(err.stderr ?? err.message).trim();
    console.error(`Couldn't delete GitHub repo ${owner}/${slug}: ${message}`);
    if (message.includes("delete_repo")) {
      console.error("Run `gh auth refresh -h github.com -s delete_repo`, finish the browser step, then run this again.");
    }
  }
}

if (vproject) {
  try {
    await vercel("DELETE", `/v9/projects/${encodeURIComponent(vproject.id)}${teamQuery}`);
    console.log(`Deleted Vercel project ${scope}/${vproject.name}`);
  } catch (err) {
    failed = true;
    console.error(`Couldn't delete Vercel project: ${err.message}`);
  }
}

for (const p of supabaseProjects) {
  try {
    supabase(`projects delete ${p.ref} --yes`);
    console.log(`Deleted Supabase project ${p.name} (${p.ref})`);
  } catch (err) {
    failed = true;
    console.error(`Couldn't delete Supabase project ${p.ref}: ${String(err.stderr ?? err.message).trim()}`);
  }
}

process.exitCode = failed ? 1 : 0;
