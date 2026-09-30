#!/usr/bin/env node
// Claim It: make a GitHub Project's Status field read
// Todo / In Progress / In Review / Done.
//
//   node <skill-dir>/scripts/board-status.mjs <owner> <project-number> [--dry-run]
//
// `gh project create` gives Todo / In Progress / Done. GitHub's API replaces
// the whole option list and regenerates option IDs, which would clear the
// Status of any items already on the board, so this only changes an EMPTY
// board. Existing options keep their color and description; options that
// aren't part of the convention are kept at the end.
//
// Exit codes: 0 done (or already correct), 1 error.

import { execFileSync } from "node:child_process";

const [owner, number] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");
if (!owner || !number) {
  console.error("usage: board-status.mjs <owner> <project-number>");
  process.exit(1);
}

const WANTED = [
  { name: "Todo", color: "GREEN", description: "Planned, in priority order" },
  { name: "In Progress", color: "YELLOW", description: "Being worked on" },
  { name: "In Review", color: "BLUE", description: "PR open, or merged to dev but not live yet" },
  { name: "Done", color: "PURPLE", description: "Live in production and checked" },
];

function fail(message) {
  console.error(`board-status: ${message}`);
  process.exit(1);
}

function graphql(query, variables) {
  const out = execFileSync("gh", ["api", "graphql", "--input", "-"], {
    input: JSON.stringify({ query, variables }),
    encoding: "utf8",
  });
  const json = JSON.parse(out);
  if (json.errors) fail(JSON.stringify(json.errors));
  return json.data;
}

const project = JSON.parse(
  execFileSync("gh", ["project", "view", number, "--owner", owner, "--format", "json"], { encoding: "utf8" }),
);

const data = graphql(
  `query($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        items(first: 1) { totalCount }
        field(name: "Status") {
          ... on ProjectV2SingleSelectField { id options { name color description } }
        }
      }
    }
  }`,
  { id: project.id },
);

const field = data.node.field;
if (!field) fail("the project has no Status field.");

const names = field.options.map((o) => o.name);
const wantedNames = WANTED.map((o) => o.name);
if (wantedNames.every((n) => names.includes(n))) {
  console.log(`Status already has all four: ${names.join(" / ")}`);
  process.exit(0);
}

if (data.node.items.totalCount > 0) {
  fail(
    `the board already has ${data.node.items.totalCount} item(s); changing Status options now would clear their ` +
      `Status. Current options: ${names.join(" / ")}. Change it by hand in the board's settings instead.`,
  );
}

const existing = new Map(field.options.map((o) => [o.name, o]));
const options = [
  ...WANTED.map((w) => {
    const o = existing.get(w.name) ?? w;
    return { name: o.name, color: o.color, description: o.description ?? "" };
  }),
  ...field.options
    .filter((o) => !wantedNames.includes(o.name))
    .map((o) => ({ name: o.name, color: o.color, description: o.description ?? "" })),
];

if (dryRun) {
  console.log(`Would set Status to: ${options.map((o) => o.name).join(" / ")}`);
  process.exit(0);
}

const updated = graphql(
  `mutation($fieldId: ID!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
    updateProjectV2Field(input: { fieldId: $fieldId, singleSelectOptions: $options }) {
      projectV2Field { ... on ProjectV2SingleSelectField { options { name } } }
    }
  }`,
  { fieldId: field.id, options },
);

console.log(`Status now reads: ${updated.updateProjectV2Field.projectV2Field.options.map((o) => o.name).join(" / ")}`);
