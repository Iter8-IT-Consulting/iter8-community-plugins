#!/usr/bin/env node
// iter8-it: give this project's local Supabase its own ports, so it can run
// alongside other projects' local Supabase on the same machine.
//
// Run from the project folder right after `npx supabase init`:
//
//   node <plugin>/shared/scripts/supabase-ports.mjs
//
// `supabase init` uses ports 54320-54329 for every project, so a second
// project fails with "port is already allocated". This finds the first free
// block of ten (54320-54329, 55320-55329, ... 64320-64329), moves every
// port in supabase/config.toml into it, sets project_id to the slug from
// journey.json, and turns off the local analytics stack (logs dashboard;
// not needed, and it's the heaviest container). Rerunning keeps the
// current block if it's still free.
//
// Exit: 0 ok, 1 error.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const configPath = path.join(process.cwd(), "supabase", "config.toml");
const journeyPath = path.join(process.cwd(), "journey.json");

function fail(message) {
  console.error(`supabase-ports: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(configPath)) fail("supabase/config.toml not found. Run `npx supabase init` first.");
let config = fs.readFileSync(configPath, "utf8");

// Ports published by running Docker containers (any project's).
function dockerPorts() {
  try {
    const out = execFileSync("docker", ["ps", "--format", "{{.Ports}}"], { encoding: "utf8" });
    return new Set([...out.matchAll(/:(\d+)->/g)].map((m) => Number(m[1])));
  } catch {
    fail("couldn't list Docker containers. Is Docker Desktop running? (`docker info`)");
  }
}

function portFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "0.0.0.0");
  });
}

// The block this config uses now, e.g. 54 for 54321.
const current = Number(config.match(/^\s*port\s*=\s*(\d{2})32\d\s*$/m)?.[1] ?? 54);
const used = dockerPorts();
const ownContainers = (() => {
  // Our own project's containers hold our ports while running; that's fine.
  const id = config.match(/^project_id\s*=\s*"([^"]+)"/m)?.[1];
  if (!id) return false;
  const out = execFileSync("docker", ["ps", "--format", "{{.Names}}"], { encoding: "utf8" });
  return out.split("\n").some((n) => n.endsWith(`_${id}`));
})();

async function blockFree(prefix) {
  for (let p = prefix * 1000 + 320; p <= prefix * 1000 + 329; p++) {
    if (used.has(p) || !(await portFree(p))) return false;
  }
  return true;
}

let prefix = null;
if (ownContainers || (await blockFree(current))) {
  prefix = current;
} else {
  for (let candidate = 54; candidate <= 64; candidate++) {
    if (candidate !== current && (await blockFree(candidate))) {
      prefix = candidate;
      break;
    }
  }
}
if (prefix === null) fail("no free block of ports between 54320 and 64329. Stop another local Supabase (`npx supabase stop` in its folder).");

// Move every 5x32y / 6x32y port number (settings and comments) into the block.
config = config.replace(/\b(\d{2})(32\d)\b/g, (match, block, rest) =>
  Number(block) >= 54 && Number(block) <= 64 ? `${prefix}${rest}` : match,
);

if (fs.existsSync(journeyPath)) {
  const { slug } = JSON.parse(fs.readFileSync(journeyPath, "utf8"));
  if (slug) config = config.replace(/^project_id\s*=\s*"[^"]*"/m, `project_id = "${slug}"`);
}

config = config.replace(/(\[analytics\]\s*\n\s*enabled\s*=\s*)true/, "$1false");

fs.writeFileSync(configPath, config);
console.log(
  JSON.stringify(
    {
      block: `${prefix}320-${prefix}329`,
      api: `http://127.0.0.1:${prefix}321`,
      db: `postgresql://postgres:postgres@127.0.0.1:${prefix}322/postgres`,
      studio: `http://127.0.0.1:${prefix}323`,
      mail: `http://127.0.0.1:${prefix}324`,
    },
    null,
    2,
  ),
);
