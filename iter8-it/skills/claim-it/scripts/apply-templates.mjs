#!/usr/bin/env node
// Claim It: copy the starter templates and branding into a freshly
// scaffolded Next.js app and fill in the project's name and purpose.
//
// Run from the project root (the folder holding journey.json), after
// create-next-app and the test dependencies are installed:
//
//   node <skill-dir>/scripts/apply-templates.mjs [--force]
//
// It reads name/slug/purpose from journey.json. It refuses to run twice
// (it would overwrite later work) unless --force is given.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = path.join(skillDir, "assets", "templates");
const brandDir = path.join(skillDir, "assets", "brand");
const root = process.cwd();
const force = process.argv.includes("--force");

const GITIGNORE_MARKER = "# --- Added by iter8-it (Claim It) ---";
// Template files that are instructions for this script, not project files.
const META_FILES = new Set(["gitignore-additions.txt", "package-scripts.json"]);
// Only these files have {{PLACEHOLDERS}}. (ci.yml has ${{ }} expressions
// that must be left alone.)
const FILLED_FILES = new Set(["src/app/site.ts", ".nvmrc", "CLAUDE.md", "README.md"]);
const BRAND_FILES = {
  "favicon.ico": "src/app/favicon.ico",
  "apple-icon.png": "src/app/apple-icon.png",
  "iter8-mark.png": "public/brand/iter8-mark.png",
  "brand.css": "src/app/brand.css",
  "Iter8Credit.tsx": "src/components/Iter8Credit.tsx",
};
// create-next-app's starter images, replaced by the branding.
const STARTER_FILES = ["file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg"].map((f) =>
  path.join("public", f),
);

function fail(message) {
  console.error(`apply-templates: ${message}`);
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

for (const required of ["journey.json", "package.json", "src/app"]) {
  if (!fs.existsSync(path.join(root, required))) {
    fail(`${required} not found. Run this from the project root after create-next-app.`);
  }
}

const journey = readJson("journey.json");
for (const field of ["name", "slug", "purpose"]) {
  if (!journey[field]) fail(`journey.json has no "${field}". Run Name It first.`);
}

const gitignorePath = path.join(root, ".gitignore");
const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
if (gitignore.includes(GITIGNORE_MARKER) && !force) {
  fail("templates were already applied here (see .gitignore). Pass --force to apply them again.");
}

const values = {
  NAME: journey.name,
  SLUG: journey.slug,
  PURPOSE: journey.purpose,
  NAME_JSON: JSON.stringify(journey.name),
  PURPOSE_JSON: JSON.stringify(journey.purpose),
  NODE_MAJOR: process.versions.node.split(".")[0],
  LINKS: "_Filled in by Claim It once the repo, board and live site exist._",
};

function fill(text, file) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => {
    if (!(key in values)) fail(`unknown placeholder ${match} in ${file}`);
    return values[key];
  });
}

function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [path.relative(base, full).split(path.sep).join("/")];
  });
}

const written = [];

function writeFile(rel, contents) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents);
  written.push(rel);
}

for (const rel of walk(templatesDir)) {
  if (META_FILES.has(rel)) continue;
  const source = path.join(templatesDir, rel);
  if (FILLED_FILES.has(rel)) {
    writeFile(rel, fill(fs.readFileSync(source, "utf8"), rel));
  } else {
    writeFile(rel, fs.readFileSync(source));
  }
}

for (const [file, rel] of Object.entries(BRAND_FILES)) {
  writeFile(rel, fs.readFileSync(path.join(brandDir, file)));
}

for (const rel of STARTER_FILES) {
  fs.rmSync(path.join(root, rel), { force: true });
}

if (!gitignore.includes(GITIGNORE_MARKER)) {
  const additions = fs.readFileSync(path.join(templatesDir, "gitignore-additions.txt"), "utf8");
  fs.writeFileSync(gitignorePath, gitignore.replace(/\n*$/, "\n") + additions);
  written.push(".gitignore (additions)");
}

const pkg = readJson("package.json");
const scripts = JSON.parse(fs.readFileSync(path.join(templatesDir, "package-scripts.json"), "utf8"));
pkg.name = journey.slug;
pkg.scripts = { ...pkg.scripts, ...scripts };
fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
written.push("package.json (name, scripts)");

console.log(`Applied Claim It templates for ${journey.name}:`);
for (const rel of written) console.log(`  ${rel}`);
