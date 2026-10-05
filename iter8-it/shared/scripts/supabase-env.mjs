#!/usr/bin/env node
// iter8-it: point the app at this project's local Supabase by writing the
// Supabase lines of .env.local from `npx supabase status`. Other lines in
// .env.local are kept. Run from the project folder while Supabase is
// running (`npx supabase start`):
//
//   node <plugin>/shared/scripts/supabase-env.mjs
//
// The names match what the Supabase <-> Vercel integration sets in
// production, so the same code works in both places.
//
// Exit: 0 ok, 1 error.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");

let status;
try {
  // stdin is closed on purpose: some supabase commands wait for piped input.
  const out = execSync("npx supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  status = JSON.parse(out.slice(out.indexOf("{")));
} catch (err) {
  console.error("supabase-env: couldn't read `npx supabase status`. Is local Supabase running? (`npx supabase start`)");
  console.error(String(err.stderr ?? err.message).trim());
  process.exit(1);
}

const values = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: status.SECRET_KEY,
  // The local mail viewer, where sign-up and password-reset emails land.
  MAILPIT_URL: status.MAILPIT_URL ?? status.INBUCKET_URL,
};
for (const [name, value] of Object.entries(values)) {
  if (!value) {
    console.error(`supabase-env: \`supabase status\` gave no value for ${name}.`);
    process.exit(1);
  }
}

const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split(/\r?\n/) : [];
const kept = existing.filter((line) => !Object.keys(values).some((name) => line.startsWith(`${name}=`)));
while (kept.length && kept[kept.length - 1] === "") kept.pop();
const lines = [...kept, ...Object.entries(values).map(([name, value]) => `${name}=${value}`)];
fs.writeFileSync(envPath, lines.join("\n") + "\n");

console.log(`.env.local now points at local Supabase (${values.NEXT_PUBLIC_SUPABASE_URL}).`);
