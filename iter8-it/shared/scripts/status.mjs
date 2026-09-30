#!/usr/bin/env node
// iter8-it: everything What's Next needs to know, as JSON. Read-only.
// Run from the project folder:
//
//   node <plugin>/shared/scripts/status.mjs
//
// Works at any stage: before Claim It it only reports the local files.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const here = path.dirname(fileURLToPath(import.meta.url));

function run(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

const status = { folder: root };

// --- Local files ---------------------------------------------------------
const productPath = path.join(root, "PRODUCT.md");
const product = fs.existsSync(productPath) ? fs.readFileSync(productPath, "utf8") : null;
status.product = product && {
  named: !/^#\s*\(unnamed\)/m.test(product),
  problem: /^##\s+Problem/m.test(product),
  people: /^##\s+People/m.test(product),
  firstVersion: /^##\s+First Version/m.test(product),
};

const journeyPath = path.join(root, "journey.json");
const journey = fs.existsSync(journeyPath) ? JSON.parse(fs.readFileSync(journeyPath, "utf8")) : null;
status.journey = journey && {
  stage: journey.stage,
  name: journey.name,
  liveUrl: journey.vercel?.url ?? null,
  needs: journey.needs,
  database: { local: journey.supabase?.local ?? false, production: journey.supabase?.projectRef ?? null },
  lastRelease: journey.lastRelease?.tag ?? null,
};

// --- Git -----------------------------------------------------------------
if (fs.existsSync(path.join(root, ".git"))) {
  const branch = run("git", ["branch", "--show-current"]);
  const dirty = run("git", ["status", "--short"]);
  status.git = { branch, uncommittedChanges: dirty ? dirty.split("\n").length : 0 };
  if (journey?.github?.repo && run("git", ["fetch", "--quiet", "origin"]) !== null) {
    const ahead = run("git", ["log", "--oneline", "origin/main..origin/dev"]);
    status.git.unreleasedCommits = ahead ? ahead.split("\n") : [];
  }
}

// --- GitHub ----------------------------------------------------------------
if (journey?.github?.repo) {
  const repo = `${journey.github.owner}/${journey.github.repo}`;
  const prs = run("gh", ["pr", "list", "-R", repo, "--state", "open", "--json", "number,title,baseRefName,headRefName"]);
  status.openPullRequests = prs ? JSON.parse(prs) : null;

  const board = run("node", [path.join(here, "board.mjs"), "list"]);
  if (board) {
    const items = JSON.parse(board);
    const by = (s) => items.filter((i) => i.status === s && i.state === "OPEN");
    const brief = (i) => ({ number: i.number, type: i.type, title: i.title });
    status.board = {
      todo: by("Todo").map(brief),
      inProgress: by("In Progress").map(brief),
      inReview: by("In Review").map(brief),
      done: items.filter((i) => i.status === "Done").length,
    };
  }

  const later = run("gh", ["issue", "list", "-R", repo, "--label", "later", "--state", "open", "--json", "number", "--jq", "length"]);
  status.laterIdeas = later === null ? null : Number(later);
}

console.log(JSON.stringify(status, null, 2));
