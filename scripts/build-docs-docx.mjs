#!/usr/bin/env node
// Build one Word document from the journey explainers: docs/README.md, then
// each page in docs/steps/ in order, each step starting on a new page.
// Links between the pages become links within the document.
//
//   node scripts/build-docs-docx.mjs [output.docx]
//
// Default output: dist/iter8-it-journey.docx (dist/ is gitignored).
// Styling, page setup (a folded booklet) and the branded header and footer
// come from docs/template/journey-reference.docx; regenerate that with
// scripts/make-docx-template.mjs. Needs pandoc on the PATH.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(repo, "docs");
const template = path.join(docs, "template", "journey-reference.docx");
const output = path.resolve(process.argv[2] ?? path.join(repo, "dist", "iter8-it-journey.docx"));

const pages = [
  "README.md",
  ...fs
    .readdirSync(path.join(docs, "steps"))
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => (a === "whats-next.md") - (b === "whats-next.md") || a.localeCompare(b))
    .map((f) => `steps/${f}`),
];

// The anchor pandoc gives a page's first heading: lowercase, punctuation
// dropped, spaces to hyphens ("What's Next" -> "whats-next").
function anchorOf(markdown) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? "";
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

const sources = pages.map((p) => ({ page: p, text: fs.readFileSync(path.join(docs, p), "utf8") }));
const anchors = new Map(sources.map(({ page, text }) => [page, anchorOf(text)]));

const pageBreak = "\n```{=openxml}\n<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>\n```\n";

const combined = sources
  .map(({ page, text }) => {
    const dir = path.posix.dirname(page);
    // [text](other.md) -> [text](#other-page-title), resolved from this page.
    return text.replace(/\]\(([^)#\s]+\.md)\)/g, (match, target) => {
      const resolved = path.posix.normalize(path.posix.join(dir, target));
      const anchor = anchors.get(resolved);
      return anchor ? `](#${anchor})` : match;
    });
  })
  .join(pageBreak);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "iter8-docs-"));
const input = path.join(tmp, "journey.md");
fs.writeFileSync(input, combined);
fs.mkdirSync(path.dirname(output), { recursive: true });

try {
  execFileSync(
    "pandoc",
    [
      input,
      "--from",
      "gfm+raw_attribute",
      "--to",
      "docx",
      "--reference-doc",
      template,
      "--metadata",
      "title=The iter8-it journey",
      "-o",
      output,
    ],
    { stdio: "inherit" },
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`Wrote ${path.relative(process.cwd(), output)} (${pages.length} pages: ${pages.join(", ")})`);
