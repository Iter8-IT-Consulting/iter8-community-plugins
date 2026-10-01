#!/usr/bin/env node
// Build docs/template/journey-reference.docx: the Word template
// scripts/build-docs-docx.mjs uses (pandoc --reference-doc). Starts from
// pandoc's default template and sets:
//
//   - a folded booklet: Letter paper, landscape, "Book fold", so each sheet
//     holds two half-letter pages; print double-sided, flip on short edge
//   - Iter8 Community branding: the palette from the app branding kit
//     (Vivid Blue headings, Charcoal text), Montserrat headings, Open Sans
//     body, Consolas for code. The fonts must be installed where the
//     document is opened or printed; Word substitutes silently otherwise.
//   - a header with the 8 mark and "The iter8-it journey", and a footer with
//     "Iter8 Community · www.iter8.community" and the page number
//
//   node scripts/make-docx-template.mjs
//
// Needs pandoc, and Windows 10+ tar.exe (or bsdtar elsewhere) to unzip and zip.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(repo, "docs", "template", "journey-reference.docx");
const logo = path.join(repo, "iter8-it", "skills", "claim-it", "assets", "brand", "iter8-mark.png");

const BRAND = { primary: "1356CF", ink: "2B2B2B", muted: "6C757D" };
const FONTS = { body: "Open Sans", heading: "Montserrat", code: "Consolas" };

// Letter landscape, book fold: each half is 5.5" x 8.5". Units are twips
// (1/1440 inch) for the page and EMUs (1/914400 inch) for images.
const PAGE = { w: 15840, h: 12240, margin: 720, header: 360, footer: 360 };
const HALF_TEXT_WIDTH = PAGE.w / 2 - PAGE.margin * 2;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "iter8-ref-"));
const dir = path.join(tmp, "x");
fs.mkdirSync(dir);

// Windows' own tar.exe reads and writes zip; Git Bash's GNU tar (often first
// on the PATH) doesn't, and reads "C:" as a remote host.
const TAR =
  process.platform === "win32" ? path.join(process.env.SystemRoot ?? "C:\Windows", "System32", "tar.exe") : "bsdtar";

function sh(cmd, args, options = {}) {
  return execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"], ...options });
}
const read = (p) => fs.readFileSync(path.join(dir, p), "utf8");
const write = (p, s) => {
  fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
  fs.writeFileSync(path.join(dir, p), s);
};
function replace(p, from, to) {
  const s = read(p);
  if (!(typeof from === "string" ? s.includes(from) : from.test(s))) {
    throw new Error(`make-docx-template: expected text not found in ${p}: ${from}`);
  }
  write(p, s.replace(from, to));
}

try {
  const base = path.join(tmp, "default.docx");
  sh("pandoc", ["-o", base, "--print-default-data-file", "reference.docx"]);
  sh(TAR, ["-xf", base, "-C", dir]);

  // --- Styles -------------------------------------------------------------
  const runFonts = (font) => `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}" />`;

  replace(
    "word/styles.xml",
    /<w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi" \/>\s*<w:sz w:val="24" \/>\s*<w:szCs w:val="24" \/>/,
    `${runFonts(FONTS.body)}<w:color w:val="${BRAND.ink}" /><w:sz w:val="19" /><w:szCs w:val="19" />`,
  );
  replace("word/styles.xml", /<w:spacing w:after="200" \/>(\s*<\/w:pPr>\s*<\/w:pPrDefault>)/, `<w:spacing w:after="120" w:line="264" w:lineRule="auto" />$1`);

  // Headings: Montserrat, brand colors, sizes for a half-letter page.
  const headingSizes = { Title: 40, Heading1: 32, Heading2: 24, Heading3: 21, Heading4: 19 };
  let styles = read("word/styles.xml");
  for (const [id, size] of Object.entries(headingSizes)) {
    const color = id === "Title" || id === "Heading1" ? BRAND.primary : BRAND.ink;
    styles = styles.replace(
      new RegExp(`(<w:style [^>]*w:styleId="${id}">[\\s\\S]*?<w:rPr>)[\\s\\S]*?(</w:rPr>)`),
      `$1${runFonts(FONTS.heading)}<w:b /><w:bCs /><w:color w:val="${color}" /><w:sz w:val="${size}" /><w:szCs w:val="${size}" />$2`,
    );
  }
  // A thin blue rule under each step's title (Heading 1).
  styles = styles.replace(
    /(<w:style [^>]*w:styleId="Heading1">[\s\S]*?<w:pPr>)([\s\S]*?)(<\/w:pPr>)/,
    `$1$2<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="4" w:color="${BRAND.primary}" /></w:pBdr>$3`,
  );
  // Links in the brand blue; code (the journey diagram) in small Consolas.
  styles = styles.replace(
    /(<w:style [^>]*w:styleId="Hyperlink">[\s\S]*?<w:rPr>)[\s\S]*?(<\/w:rPr>)/,
    `$1<w:color w:val="${BRAND.primary}" /><w:u w:val="single" />$2`,
  );
  styles = styles.replace(
    /(<w:style [^>]*w:styleId="VerbatimChar">[\s\S]*?<w:rPr>)[\s\S]*?(<\/w:rPr>)/,
    `$1${runFonts(FONTS.code)}<w:sz w:val="14" /><w:szCs w:val="14" />$2`,
  );
  write("word/styles.xml", styles);

  // --- Header and footer ------------------------------------------------
  const ns = `xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"`;
  const small = (color) => `<w:rPr><w:rFonts w:ascii="${FONTS.body}" w:hAnsi="${FONTS.body}" /><w:color w:val="${color}" /><w:sz w:val="15" /><w:szCs w:val="15" /></w:rPr>`;
  const markEmu = 0.22 * 914400;

  write(
    "word/header1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr ${ns}>
  <w:p>
    <w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="4" w:color="${BRAND.primary}" /></w:pBdr><w:spacing w:after="0" /></w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${markEmu}" cy="${markEmu}" />
          <wp:docPr id="1" name="Iter8 mark" descr="Iter8 Community" />
          <a:graphic>
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic>
                <pic:nvPicPr><pic:cNvPr id="1" name="iter8-mark.png" /><pic:cNvPicPr /></pic:nvPicPr>
                <pic:blipFill><a:blip r:embed="rIdMark" /><a:stretch><a:fillRect /></a:stretch></pic:blipFill>
                <pic:spPr><a:xfrm><a:off x="0" y="0" /><a:ext cx="${markEmu}" cy="${markEmu}" /></a:xfrm><a:prstGeom prst="rect"><a:avLst /></a:prstGeom></pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
    <w:r>${small(BRAND.primary).replace("<w:rPr>", "<w:rPr><w:b />")}<w:t xml:space="preserve">  The iter8-it journey</w:t></w:r>
  </w:p>
</w:hdr>`,
  );
  write(
    "word/_rels/header1.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdMark" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/iter8-mark.png" /></Relationships>`,
  );
  fs.mkdirSync(path.join(dir, "word", "media"), { recursive: true });
  fs.copyFileSync(logo, path.join(dir, "word", "media", "iter8-mark.png"));

  write(
    "word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr ${ns}>
  <w:p>
    <w:pPr><w:tabs><w:tab w:val="right" w:pos="${HALF_TEXT_WIDTH}" /></w:tabs><w:spacing w:after="0" /></w:pPr>
    <w:r>${small(BRAND.muted)}<w:t xml:space="preserve">Iter8 Community · www.iter8.community</w:t></w:r>
    <w:r>${small(BRAND.muted)}<w:tab /></w:r>
    <w:r>${small(BRAND.muted)}<w:fldChar w:fldCharType="begin" /></w:r>
    <w:r>${small(BRAND.muted)}<w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r>${small(BRAND.muted)}<w:fldChar w:fldCharType="separate" /></w:r>
    <w:r>${small(BRAND.muted)}<w:t>1</w:t></w:r>
    <w:r>${small(BRAND.muted)}<w:fldChar w:fldCharType="end" /></w:r>
  </w:p>
</w:ftr>`,
  );

  replace(
    "word/_rels/document.xml.rels",
    "</Relationships>",
    `<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Id="rIdHeader1" Target="header1.xml" /><Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Id="rIdFooter1" Target="footer1.xml" /></Relationships>`,
  );
  replace(
    "[Content_Types].xml",
    "</Types>",
    `<Default Extension="png" ContentType="image/png" /><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml" /><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml" /></Types>`,
  );

  // --- Page setup: Letter landscape, book fold --------------------------
  replace(
    "word/document.xml",
    /<w:sectPr>[\s\S]*?<\/w:sectPr>/,
    `<w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader1" />
      <w:footerReference w:type="default" r:id="rIdFooter1" />
      <w:footnotePr><w:numRestart w:val="eachSect" /></w:footnotePr>
      <w:pgSz w:w="${PAGE.w}" w:h="${PAGE.h}" w:orient="landscape" />
      <w:pgMar w:top="${PAGE.margin}" w:right="${PAGE.margin}" w:bottom="${PAGE.margin}" w:left="${PAGE.margin}" w:header="${PAGE.header}" w:footer="${PAGE.footer}" w:gutter="0" />
    </w:sectPr>`,
  );
  if (!read("word/document.xml").includes('xmlns:r="')) {
    replace("word/document.xml", "<w:document ", `<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" `);
  }
  replace("word/settings.xml", "<w:defaultTabStop", `<w:bookFoldPrinting /><w:defaultTabStop`);

  // --- Zip it back up ---------------------------------------------------
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const zip = path.join(tmp, "out.zip");
  sh(TAR, ["-a", "-c", "-f", zip, "-C", dir, "[Content_Types].xml", "_rels", "docProps", "word"]);
  fs.copyFileSync(zip, output);
  console.log(`Wrote ${path.relative(process.cwd(), output)}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
