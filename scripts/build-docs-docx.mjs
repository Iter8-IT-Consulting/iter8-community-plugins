#!/usr/bin/env node
// Build one Word document from the journey explainers: a title page and
// front matter (docs/booklet/front.md), then docs/README.md, then
// docs/getting-ready.md, then each page in docs/steps/ in order, then
// docs/extras/, each starting on a new page. Links between the
// pages become links within the document.
//
//   node scripts/build-docs-docx.mjs [output.docx] [--pdf]
//     --pdf: also save a PDF next to it, made by Word (Windows, with Word
//     installed), with the contents page numbers filled in.
//   node scripts/build-docs-docx.mjs --sample --reference <template.docx> <output.docx>
//     (used by make-docx-template.mjs: just the title page, front matter and
//     one step chapter, built with the given template)
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
const args = process.argv.slice(2);
const sample = args.includes("--sample");
const pdf = args.includes("--pdf");
const referenceIndex = args.indexOf("--reference");
const template = referenceIndex === -1 ? path.join(docs, "template", "journey-reference.docx") : path.resolve(args[referenceIndex + 1]);
const positional = args.filter((a, i) => !a.startsWith("--") && (referenceIndex === -1 || i !== referenceIndex + 1));
const output = path.resolve(positional[0] ?? path.join(repo, "dist", "iter8-it-journey.docx"));

// The sample (the template's own body) is one chapter with every component:
// title, intro, section headings, tables, bullets and a diagram.
const pages = sample
  ? ["steps/06-trim-it.md"]
  : [
      "README.md",
      "getting-ready.md",
      "steps/adopt-it.md",
      ...fs
        .readdirSync(path.join(docs, "steps"))
        .filter((f) => f.endsWith(".md") && f !== "adopt-it.md")
        .sort((a, b) => a.localeCompare(b))
        .map((f) => `steps/${f}`),
      ...fs
        .readdirSync(path.join(docs, "extras"))
        .filter((f) => f.endsWith(".md"))
        // What's Next first, then your own web address, then the rest.
        .sort((a, b) => {
          const order = ["whats-next.md", "custom-domain.md"];
          const rank = (f) => (order.includes(f) ? order.indexOf(f) : order.length);
          return rank(a) - rank(b) || a.localeCompare(b);
        })
        .map((f) => `extras/${f}`),
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

// Front matter: title page, About this booklet, Contents. {{VERSION}} and
// {{DATE}} come from the plugin and today's date. The 8 mark is copied next
// to the combined markdown so pandoc can embed it.
const pluginVersion = JSON.parse(fs.readFileSync(path.join(repo, "iter8-it", ".claude-plugin", "plugin.json"), "utf8")).version;
const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const front = fs
  .readFileSync(path.join(docs, "booklet", "front.md"), "utf8")
  .replace(/<!--[\s\S]*?-->\s*/, "")
  .replaceAll("{{VERSION}}", `v${pluginVersion}`)
  .replaceAll("{{DATE}}", today);

const combined = front + pageBreak + sources
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
fs.copyFileSync(
  path.join(repo, "iter8-it", "skills", "claim-it", "assets", "brand", "iter8-mark.png"),
  path.join(tmp, "iter8-mark.png"),
);
fs.writeFileSync(input, combined);
fs.mkdirSync(path.dirname(output), { recursive: true });

// Word locks a document while it's open; say so instead of failing deep in pandoc.
if (fs.existsSync(output)) {
  try {
    fs.closeSync(fs.openSync(output, "r+"));
  } catch (err) {
    if (["EBUSY", "EPERM", "EACCES"].includes(err.code)) {
      console.error(`build-docs-docx: ${path.relative(process.cwd(), output)} is open in Word (or another program). Close it and run this again.`);
      fs.rmSync(tmp, { recursive: true, force: true });
      process.exit(1);
    }
    throw err;
  }
}

try {
  execFileSync(
    "pandoc",
    [
      input,
      "--from",
      "markdown+raw_attribute+fenced_divs-implicit_figures",
      "--resource-path",
      tmp,
      "--to",
      "docx",
      "--reference-doc",
      template,
      "-o",
      output,
    ],
    { stdio: "inherit" },
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`Wrote ${path.relative(process.cwd(), output)} (${pages.length} pages: ${pages.join(", ")})`);
if (!sample) console.log("To print it as a booklet, see docs/booklet/printing.md.");

// A PDF made by Word itself, so the booklet layout and the contents page
// numbers match what Word prints.
if (pdf) {
  if (process.platform !== "win32") {
    console.error("build-docs-docx: --pdf needs Windows with Word installed.");
    process.exit(1);
  }
  const pdfPath = output.replace(/\.docx$/i, ".pdf");
  const ps = [
    "$ErrorActionPreference = 'Stop'",
    "$word = New-Object -ComObject Word.Application",
    "$word.Visible = $false",
    "$word.DisplayAlerts = 0",
    "try {",
    `  $doc = $word.Documents.Open('${output.replace(/'/g, "''")}', $false, $false)`,
    "  foreach ($toc in $doc.TablesOfContents) { $toc.Update() }",
    `  $doc.ExportAsFixedFormat('${pdfPath.replace(/'/g, "''")}', 17)`,
    "  $doc.Close($false)",
    "} finally { $word.Quit() }",
  ].join("\n");
  try {
    execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: "inherit" });
  } catch {
    console.error("build-docs-docx: Word couldn't make the PDF. Is the PDF open somewhere? Close it and try again.");
    process.exit(1);
  }
  console.log(`Wrote ${path.relative(process.cwd(), pdfPath)} (made by Word)`);
}
