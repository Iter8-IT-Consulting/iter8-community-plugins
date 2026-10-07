#!/usr/bin/env node
// iter8-it: are these color pairs readable? Checks WCAG contrast ratios.
//
//   node contrast.mjs <text>:<background>[:large] ...
//   node contrast.mjs "#2b2b2b:#f1f3f5" "#ffffff:#1356cf" "#6c757d:#ffffff"
//
// Normal text needs 4.5:1, large text (headings, 24px+ or bold 19px+) and
// button outlines 3:1 (add ":large"). Exit: 0 all pass, 2 some fail.

function luminance(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = process.argv.slice(2);
if (pairs.length === 0) {
  console.error('usage: contrast.mjs "<text>:<background>[:large]" ...');
  process.exit(1);
}

let failed = false;
for (const pair of pairs) {
  const [text, background, size] = pair.split(":");
  if (!/^#[0-9a-f]{3,6}$/i.test(text ?? "") || !/^#[0-9a-f]{3,6}$/i.test(background ?? "")) {
    console.error(`contrast: "${pair}" isn't <#text>:<#background>`);
    process.exit(1);
  }
  const need = size === "large" ? 3 : 4.5;
  const r = ratio(text, background);
  const ok = r >= need;
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${text} on ${background}: ${r.toFixed(2)}:1 (needs ${need}:1${size === "large" ? ", large" : ""})`);
}
process.exitCode = failed ? 2 : 0;
