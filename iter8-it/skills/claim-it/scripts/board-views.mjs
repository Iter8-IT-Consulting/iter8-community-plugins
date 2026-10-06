#!/usr/bin/env node
// Claim It: give a new GitHub Project the two standard views.
//
//   node <skill-dir>/scripts/board-views.mjs <owner> <project-number> [--dry-run]
//
//   Issue List      table: Title, Status, Sub-issues progress
//   Tracking Board  board: Title, Assignees, Status, Linked pull requests,
//                   Sub-issues progress (columns grouped by Status)
//
// Run it after board-status.mjs, so Status already has its five options when
// the Tracking Board's columns are made. Views that already exist (by name)
// are left alone, so it's safe to rerun. GitHub's API can create views but
// not update or delete them: the default "View 1" has to be deleted by hand
// (on the board: the ▾ on the "View 1" tab -> Delete view).
//
// Exit codes: 0 done, 1 error.

import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const [owner, number] = args.filter((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
if (!owner || !number) {
  console.error("usage: board-views.mjs <owner> <project-number> [--dry-run]");
  process.exit(1);
}

const VIEWS = [
  { name: "Issue List", layout: "table", fields: ["Title", "Status", "Sub-issues progress"] },
  {
    name: "Tracking Board",
    layout: "board",
    fields: ["Title", "Assignees", "Status", "Linked pull requests", "Sub-issues progress"],
  },
];

function fail(message) {
  console.error(`board-views: ${message}`);
  process.exit(1);
}

function gh(ghArgs, input) {
  try {
    return execFileSync("gh", ghArgs, { encoding: "utf8", input, stdio: ["pipe", "pipe", "pipe"] });
  } catch (err) {
    fail(String(err.stderr || err.stdout || err.message).trim());
  }
}

// Org or personal account: the REST paths and GraphQL roots differ.
const type = gh(["api", `users/${owner}`, "--jq", ".type"]).trim();
const isOrg = type === "Organization";
const base = `${isOrg ? "orgs" : "users"}/${owner}/projectsV2/${number}`;
const root = isOrg ? "organization" : "user";

function existingViews() {
  const out = gh([
    "api",
    "graphql",
    "-f",
    `query=query($login:String!,$n:Int!){${root}(login:$login){projectV2(number:$n){views(first:50){nodes{name layout verticalGroupByFields(first:5){nodes{... on ProjectV2FieldCommon{name}}}}}}}}`,
    "-f",
    `login=${owner}`,
    "-F",
    `n=${number}`,
  ]);
  const project = JSON.parse(out).data?.[root]?.projectV2;
  if (!project) fail(`project #${number} not found under ${owner}.`);
  return project.views.nodes.map((v) => ({
    name: v.name,
    layout: v.layout,
    groupBy: v.verticalGroupByFields.nodes.map((f) => f.name),
  }));
}

// Field IDs differ per project: look them up by name.
const fieldIds = new Map(
  JSON.parse(gh(["api", `${base}/fields`, "--paginate"])).map((f) => [f.name, f.id]),
);

const before = existingViews();
for (const view of VIEWS) {
  if (before.some((v) => v.name === view.name)) {
    console.log(`"${view.name}" already exists; left as it is.`);
    continue;
  }
  const missing = view.fields.filter((f) => !fieldIds.has(f));
  if (missing.length) fail(`the project has no field named ${missing.map((m) => `"${m}"`).join(", ")}.`);
  const body = { name: view.name, layout: view.layout, visible_fields: view.fields.map((f) => fieldIds.get(f)) };
  if (dryRun) {
    console.log(`Would create "${view.name}" (${view.layout}): ${view.fields.join(", ")}`);
    continue;
  }
  gh(["api", "-X", "POST", `${base}/views`, "--input", "-"], JSON.stringify(body));
  console.log(`Created "${view.name}" (${view.layout}): ${view.fields.join(", ")}`);
}

if (!dryRun) {
  const after = existingViews();
  const board = after.find((v) => v.name === "Tracking Board");
  if (board && !board.groupBy.includes("Status")) {
    console.log(
      `Note: "Tracking Board" isn't grouped by Status (${board.groupBy.join(", ") || "no grouping"}). ` +
        "Set it on the board: the view's ▾ -> Column by -> Status.",
    );
  }
  if (after.some((v) => v.name === "View 1")) {
    console.log('The default "View 1" is still there: delete it on the board (▾ on its tab -> Delete view).');
  }
}
