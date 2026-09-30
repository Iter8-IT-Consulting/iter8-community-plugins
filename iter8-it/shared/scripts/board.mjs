#!/usr/bin/env node
// iter8-it: read and change the project board. Used by Trim It, Build It,
// Ship It and Fix It. Reads the owner and project number from journey.json
// in the current folder.
//
//   node <plugin>/shared/scripts/board.mjs list [--status "<status>"]
//     Board items in board order (top first), as JSON:
//     [{ number, title, url, type, status, parent, state }]
//
//   node <plugin>/shared/scripts/board.mjs set <issue-number> "<status>"
//     Put the issue on the board (if it isn't already) with that status.
//
//   node <plugin>/shared/scripts/board.mjs order <issue-number>...
//     Reorder the board so these issues come first, in this order.
//
// Statuses: Todo, In Progress, In Review, Done.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

class BoardError extends Error {}
function fail(message) {
  throw new BoardError(message);
}

function graphql(query, variables) {
  let out;
  try {
    out = execFileSync("gh", ["api", "graphql", "--input", "-"], {
      input: JSON.stringify({ query, variables }),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err) {
    // gh exits non-zero on GraphQL errors but still prints the response.
    out = err.stdout;
    if (!out) fail(String(err.stderr || err.message).trim());
  }
  const json = JSON.parse(out);
  if (json.errors) fail(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

function readJourney() {
  const file = path.join(process.cwd(), "journey.json");
  if (!fs.existsSync(file)) fail("journey.json not found. Run this from the project folder.");
  const { github } = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!github?.owner || !github?.repo || !github?.project) {
    fail("journey.json has no github owner/repo/project. Run Claim It first.");
  }
  return github;
}

const OWNER_QUERY = `query($owner: String!, $number: Int!, $cursor: String) {
  repositoryOwner(login: $owner) {
    ... on ProjectV2Owner {
      projectV2(number: $number) {
        id
        field(name: "Status") {
          ... on ProjectV2SingleSelectField { id options { id name } }
        }
        items(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
            content {
              ... on Issue {
                number title url state
                repository { nameWithOwner }
                issueType { name }
                parent { number }
                labels(first: 20) { nodes { name } }
              }
            }
          }
        }
      }
    }
  }
}`;

function loadBoard(github) {
  let cursor = null;
  let project;
  const items = [];
  do {
    const data = graphql(OWNER_QUERY, { owner: github.owner, number: Number(github.project), cursor });
    project = data.repositoryOwner?.projectV2;
    if (!project) fail(`project #${github.project} not found under ${github.owner}.`);
    items.push(...project.items.nodes);
    cursor = project.items.pageInfo.hasNextPage ? project.items.pageInfo.endCursor : null;
  } while (cursor);
  return { project, items };
}

// Work item type: the Issue Type, or (personal accounts) a type label.
const TYPE_LABELS = ["epic", "feature", "story", "bug"];
function typeOf(issue) {
  if (issue.issueType?.name) return issue.issueType.name;
  const label = issue.labels?.nodes.map((l) => l.name).find((n) => TYPE_LABELS.includes(n));
  return label ?? null;
}

function toRow(item) {
  const c = item.content;
  return {
    number: c.number,
    title: c.title,
    url: c.url,
    type: typeOf(c),
    status: item.fieldValueByName?.name ?? null,
    parent: c.parent?.number ?? null,
    state: c.state,
  };
}

function repoItems(items, github) {
  const repo = `${github.owner}/${github.repo}`.toLowerCase();
  return items.filter((i) => i.content?.repository?.nameWithOwner?.toLowerCase() === repo);
}

function list(args) {
  const github = readJourney();
  const statusIndex = args.indexOf("--status");
  const status = statusIndex === -1 ? null : args[statusIndex + 1];
  const { items } = loadBoard(github);
  const rows = repoItems(items, github)
    .map(toRow)
    .filter((r) => !status || r.status === status);
  console.log(JSON.stringify(rows, null, 2));
}

function issueNodeId(github, number) {
  const data = graphql(
    `query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) { issue(number: $number) { id } }
    }`,
    { owner: github.owner, repo: github.repo, number },
  );
  const id = data.repository?.issue?.id;
  if (!id) fail(`issue #${number} not found in ${github.owner}/${github.repo}.`);
  return id;
}

function set(args) {
  const [numberArg, status] = args;
  const number = Number(numberArg);
  if (!number || !status) fail('usage: board.mjs set <issue-number> "<status>"');
  const github = readJourney();
  const { project, items } = loadBoard(github);
  const option = project.field?.options.find((o) => o.name.toLowerCase() === status.toLowerCase());
  if (!option) {
    fail(`no "${status}" status on the board. It has: ${project.field?.options.map((o) => o.name).join(", ")}.`);
  }

  let item = repoItems(items, github).find((i) => i.content.number === number);
  let itemId = item?.id;
  if (!itemId) {
    const added = graphql(
      `mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) { item { id } }
      }`,
      { projectId: project.id, contentId: issueNodeId(github, number) },
    );
    itemId = added.addProjectV2ItemById.item.id;
  }

  graphql(
    `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId, itemId: $itemId, fieldId: $fieldId,
        value: { singleSelectOptionId: $optionId }
      }) { projectV2Item { id } }
    }`,
    { projectId: project.id, itemId, fieldId: project.field.id, optionId: option.id },
  );
  console.log(`#${number} -> ${option.name}${item ? "" : " (added to the board)"}`);
}

function order(args) {
  const numbers = args.map(Number);
  if (numbers.length === 0 || numbers.some((n) => !n)) fail("usage: board.mjs order <issue-number>...");
  const github = readJourney();
  const { project, items } = loadBoard(github);
  const byNumber = new Map(repoItems(items, github).map((i) => [i.content.number, i.id]));
  const missing = numbers.filter((n) => !byNumber.has(n));
  if (missing.length) fail(`not on the board: ${missing.map((n) => `#${n}`).join(", ")}. Add them with \`set\` first.`);

  // Each item goes after the previous one; the first goes to the top.
  let afterId = null;
  for (const n of numbers) {
    const itemId = byNumber.get(n);
    graphql(
      `mutation($projectId: ID!, $itemId: ID!, $afterId: ID) {
        updateProjectV2ItemPosition(input: { projectId: $projectId, itemId: $itemId, afterId: $afterId }) {
          clientMutationId
        }
      }`,
      { projectId: project.id, itemId, afterId },
    );
    afterId = itemId;
  }
  console.log(`Board order: ${numbers.map((n) => `#${n}`).join(", ")}, then everything else`);
}

const [command, ...rest] = process.argv.slice(2);
try {
  const commands = { list, set, order };
  if (!commands[command]) fail('usage: board.mjs list [--status "<status>"] | set <issue> "<status>" | order <issue>...');
  commands[command](rest);
} catch (err) {
  if (!(err instanceof BoardError)) throw err;
  console.error(`board: ${err.message}`);
  process.exitCode = 1;
}
