#!/usr/bin/env node
// iter8-it Adopt It: look at an existing app and report how it differs
// from the iter8-it way. READ-ONLY: it changes nothing anywhere.
// Run from the app's folder:
//
//   node <plugin>/shared/scripts/adopt-scan.mjs
//
// Prints JSON: what was found (repo, GitHub, Vercel, Supabase) and a list
// of gaps, each with what the app has, what iter8-it expects, whether it's
// needed / recommended / optional, and the risk of changing it.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const here = path.dirname(fileURLToPath(import.meta.url));
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => (exists(p) ? fs.readFileSync(path.join(root, p), "utf8") : null);
function run(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" && ["vercel", "npx"].includes(cmd) }).trim();
  } catch {
    return null;
  }
}
const json = (text) => {
  try {
    return text ? JSON.parse(text.slice(text.search(/[[{]/))) : null;
  } catch {
    return null;
  }
};

const found = {};
const gaps = [];
const gap = (id, area, have, expected, need, risk, note = "") => gaps.push({ id, area, have, expected, need, risk, note });

// --- Repo ------------------------------------------------------------------
const pkg = json(read("package.json"));
const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
found.repo = {
  framework: deps.next ? `next ${deps.next}` : pkg ? "not Next.js" : "no package.json",
  typescript: !!deps.typescript,
  tailwind: !!deps.tailwindcss,
  supabaseJs: !!deps["@supabase/supabase-js"],
  tests: { vitest: !!deps.vitest, playwright: !!(deps["@playwright/test"] || deps.playwright) },
  scripts: Object.keys(pkg?.scripts ?? {}),
  migrations: exists("supabase/migrations") ? fs.readdirSync(path.join(root, "supabase/migrations")).filter((f) => f.endsWith(".sql")).length : 0,
  workflows: exists(".github/workflows") ? fs.readdirSync(path.join(root, ".github/workflows")) : [],
  iter8it: { product: exists("PRODUCT.md"), journey: exists("journey.json"), claude: exists("CLAUDE.md") },
  otherPlanningFiles: ["context.json", "po-backlog", "USER.md"].filter(exists),
  auth: exists("src/lib/auth.ts") ? "iter8-it helpers" : deps["@supabase/ssr"] ? "Supabase SSR (own helpers)" : "none found",
  proxy: exists("src/proxy.ts") ? "src/proxy.ts" : exists("src/middleware.ts") ? "src/middleware.ts" : exists("middleware.ts") ? "middleware.ts" : null,
  skin: exists("src/app/brand.css") ? "brand.css tokens" : "no brand tokens",
  styleGuide: exists("src/app/style-guide/page.tsx"),
  vercelJson: json(read("vercel.json")),
};

if (!deps.next) gap("stack", "Repo", found.repo.framework, "Next.js app", "needed", "high", "iter8-it's build steps assume Next.js; only the planning parts (board, Issues, PRODUCT.md, releases) can be adopted.");
if (!found.repo.typescript) gap("typescript", "Repo", "no TypeScript", "TypeScript", "recommended", "medium");
if (!found.repo.iter8it.product) gap("product-md", "Product", "no PRODUCT.md", "PRODUCT.md (problem, people, first version, layout)", "needed", "none", "Drafted from what exists, then confirmed with the user.");
if (!found.repo.iter8it.journey) gap("journey-json", "Product", "no journey.json", "journey.json", "needed", "none");
if (!found.repo.scripts.includes("typecheck")) gap("script-typecheck", "Tests", "no typecheck script", '"typecheck": "next typegen && tsc --noEmit"', "recommended", "none");
if (!found.repo.tests.vitest) gap("vitest", "Tests", "no unit tests", "Vitest", "recommended", "low");
if (!deps["@playwright/test"]) gap("playwright", "Tests", deps.playwright ? "playwright (library only, no test runner)" : "no end-to-end tests", "@playwright/test with desktop + mobile projects", "recommended", "low");
if (!found.repo.scripts.includes("test:e2e")) gap("script-e2e", "Tests", "no test:e2e script", '"test:e2e": "playwright test"', "recommended", "none");
if (found.repo.skin === "no brand tokens") gap("skin", "Look", "no brand tokens", "src/app/brand.css tokens + /style-guide (Skin It)", "optional", "low", "Skin It can capture the current look as tokens.");
if (found.repo.otherPlanningFiles.length) gap("old-planning", "Product", found.repo.otherPlanningFiles.join(", "), "PRODUCT.md + journey.json + the board", "optional", "none", "Keep them, or retire them once their content is in PRODUCT.md / the board.");
const deployOff = found.repo.vercelJson?.git?.deploymentEnabled;
if (!deployOff || deployOff["**"] !== false) gap("vercel-json", "Hosting", deployOff ? JSON.stringify(deployOff) : "every branch deploys", 'vercel.json: only main deploys ({"main": true, "**": false})', "recommended", "low", "Preview deploys of feature branches would point at a local database.");
if (!found.repo.workflows.includes("ci.yml")) gap("ci", "CI", "no ci.yml", "ci.yml: quick checks on every PR, e2e on PRs into main", "needed", "low");
if (found.repo.migrations > 0 && !found.repo.workflows.includes("migrate.yml")) gap("migrate-workflow", "Database", "migrations, no migrate workflow", "migrate.yml applies migrations on main", "needed", "medium");
for (const s of ["deploy:test", "deploy:prod", "deploy"]) {
  if (found.repo.scripts.includes(s)) gap(`script-${s}`, "Hosting", `npm run ${s}`, "Releases go live by merging into main (Ship It), not deploy scripts", "recommended", "medium", "Check what it does before retiring it.");
}

// --- Git and GitHub ---------------------------------------------------------
const remote = run("git", ["remote", "get-url", "origin"]);
const m = remote?.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
found.git = { remote, branches: (run("git", ["branch", "-r", "--format=%(refname:short)"]) ?? "").split("\n").filter(Boolean).map((b) => b.replace(/^origin\//, "")).filter((b) => b !== "HEAD" && b !== "origin") };
if (m) {
  const [owner, repo] = [m[1], m[2]];
  const info = json(run("gh", ["repo", "view", `${owner}/${repo}`, "--json", "defaultBranchRef,visibility,isInOrganization"]));
  const projects = json(run("gh", ["api", "graphql", "-f", `query=query{repository(owner:"${owner}",name:"${repo}"){projectsV2(first:10){nodes{number title views(first:20){nodes{name}} field(name:"Status"){... on ProjectV2SingleSelectField{options{name}}}}}}}`]));
  const secrets = (run("gh", ["secret", "list", "-R", `${owner}/${repo}`]) ?? "").split("\n").map((l) => l.split(/\s+/)[0]).filter(Boolean);
  const rulesets = json(run("gh", ["api", `repos/${owner}/${repo}/rulesets`])) ?? [];
  const types = json(run("gh", ["api", `orgs/${owner}/issue-types`]));
  const labels = (run("gh", ["label", "list", "-R", `${owner}/${repo}`, "--limit", "200", "--json", "name", "--jq", ".[].name"]) ?? "").split("\n").filter(Boolean);
  const openIssues = json(run("gh", ["issue", "list", "-R", `${owner}/${repo}`, "--state", "open", "--limit", "500", "--json", "number,issueType"])) ?? [];
  const byType = {};
  for (const i of openIssues) byType[i.issueType?.name ?? "(no type)"] = (byType[i.issueType?.name ?? "(no type)"] ?? 0) + 1;
  found.github = {
    owner,
    repo,
    visibility: info?.visibility,
    defaultBranch: info?.defaultBranchRef?.name,
    projects: (projects?.data?.repository?.projectsV2?.nodes ?? []).map((p) => ({ number: p.number, title: p.title, statuses: p.field?.options?.map((o) => o.name) ?? [], views: p.views?.nodes?.map((v) => v.name) ?? [] })),
    issueTypes: Array.isArray(types) ? types.map((t) => t.name) : "labels (personal account)",
    openIssuesByType: byType,
    labels: labels.filter((l) => /^(later|persona:)/.test(l) || ["epic", "feature", "story", "bug"].includes(l)),
    secrets,
    rulesets: rulesets.map((r) => r.name),
  };
  const g = found.github;
  if (!found.git.branches.includes("dev")) gap("branch-dev", "Branches", `branches: ${found.git.branches.slice(0, 6).join(", ")}${found.git.branches.length > 6 ? ", ..." : ""}`, "dev (default, where work merges) and main (production)", "needed", "medium", "Create dev from the current production code; existing branches can stay.");
  if (g.defaultBranch !== "dev") gap("default-branch", "Branches", `default branch: ${g.defaultBranch}`, "dev as the default branch", "needed", "low");
  if (!found.git.branches.includes("main")) gap("branch-main", "Branches", "no main branch", "main = what's live", "needed", "high", "Usually means production deploys from another branch: switch together with Vercel's production branch, with a rollback plan.");
  const board = g.projects[0];
  const want = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
  if (!board) gap("board", "Board", "no project board linked", `a board: ${want.join(" / ")}`, "needed", "none");
  else {
    const missing = want.filter((s) => !board.statuses.includes(s));
    const missingViews = ["Issue List", "Tracking Board"].filter((v) => !board.views.includes(v));
    if (missingViews.length) gap("board-views", "Board", `views: ${board.views.join(", ") || "none"}`, "Issue List (table) and Tracking Board (board, columns by Status)", "recommended", "none", "Adds views; existing ones stay. Run after the Status options are in place.");
    if (missing.length) gap("board-statuses", "Board", `#${board.number} "${board.title}": ${board.statuses.join(" / ")}`, want.join(" / "), "needed", "low", `Add: ${missing.join(", ")} (by hand in the board's settings: the board has items).`);
  }
  if (Array.isArray(types)) {
    const missing = ["Epic", "Feature", "Bug"].filter((t) => !types.map((x) => x.name).includes(t));
    if (missing.length) gap("issue-types", "Board", `types: ${types.map((t) => t.name).join(", ")}`, "Epic, Feature, Story (or Task), Bug", "recommended", "low");
  }
  if (!g.labels.includes("later")) gap("label-later", "Board", "no later label", "later label for parked ideas", "recommended", "none");
  if (found.repo.migrations > 0 && !g.secrets.includes("SUPABASE_DB_URL")) gap("secret-db-url", "Database", `secrets: ${g.secrets.join(", ") || "none"}`, "SUPABASE_DB_URL (session pooler) for migrate.yml", "needed", "low", "Check how migrations reach production today first.");
  if (!g.rulesets.length) gap("protect-main", "Branches", "main not protected", "a ruleset: CI must pass before merging into main (needs a public repo or a paid plan)", "optional", "none");
}

// --- Vercel --------------------------------------------------------------------
const vproj = json(read(".vercel/project.json"));
if (vproj) {
  const name = vproj.projectName ?? pkg?.name;
  const v = json(run("node", [path.join(here, "vercel-check.mjs"), "project", name]));
  const envList = run("vercel", ["env", "ls", "production"]) ?? "";
  found.vercel = { project: v?.project ?? name, git: v?.git, productionBranch: v?.productionBranch, url: v?.productionUrl, aliases: v?.aliases, envNames: [...envList.matchAll(/^\s*([A-Z0-9_]+)\s/gm)].map((x) => x[1]) };
  if (v?.productionBranch && v.productionBranch !== "main") gap("vercel-prod-branch", "Hosting", `Vercel production branch: ${v.productionBranch}`, "main", "needed", "high", "Switch at the same moment as the branch change, and check the live site right after.");
  const names = found.vercel.envNames;
  if (found.repo.supabaseJs && !names.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")) gap("env-names", "Hosting", `env: ${names.filter((n) => /SUPABASE/.test(n)).join(", ") || "none"}`, "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY", "recommended", "medium", "Code and Vercel must change together.");
} else {
  found.vercel = null;
  gap("vercel-link", "Hosting", "not linked here (.vercel/project.json missing)", "linked Vercel project", "needed", "none", "Run `vercel link` to look at it.");
}

// --- Supabase -------------------------------------------------------------------
if (exists("supabase/config.toml")) {
  const cfg = read("supabase/config.toml");
  const list = json(run("npx", ["supabase", "projects", "list", "-o", "json"]));
  const projects = Array.isArray(list) ? list : (list?.projects ?? []);
  found.supabase = {
    projectId: cfg.match(/^project_id\s*=\s*"([^"]+)"/m)?.[1],
    localPorts: cfg.match(/^port\s*=\s*(\d+)/m)?.[1],
    cloudProjects: projects.map((p) => ({ name: p.name, ref: p.ref, status: p.status })),
  };
  const active = projects.filter((p) => p.status === "ACTIVE_HEALTHY" && (p.name.includes(found.supabase.projectId ?? "~") || (found.github && p.name.includes(found.github.repo))));
  if (active.length > 1) gap("extra-cloud-db", "Database", `${active.length} active cloud projects: ${active.map((p) => p.name).join(", ")}`, "one cloud project (production); development runs locally in Docker", "recommended", "medium", "Extra active projects cost money on paid plans. Check what each is for before pausing or deleting anything.");
  if (/^port\s*=\s*5432[0-9]/m.test(cfg)) gap("local-ports", "Database", "default local ports (5432x)", "its own port block (supabase-ports.mjs), so it runs alongside other apps", "optional", "none");
}

const order = { needed: 0, recommended: 1, optional: 2 };
gaps.sort((a, b) => order[a.need] - order[b.need]);
console.log(JSON.stringify({ found, gaps, summary: { needed: gaps.filter((g) => g.need === "needed").length, recommended: gaps.filter((g) => g.need === "recommended").length, optional: gaps.filter((g) => g.need === "optional").length } }, null, 2));
