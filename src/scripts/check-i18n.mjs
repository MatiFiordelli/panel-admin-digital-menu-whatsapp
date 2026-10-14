// scripts/check-i18n.mjs
// Run with:  node scripts/check-i18n.mjs   (or add "i18n:check": "node scripts/check-i18n.mjs" to package.json)
// Compares every locale against Spanish (the reference): missing keys, extra keys, and mismatched {{placeholders}}.
// Exits with code 1 when something is wrong, so it can run in CI or before a commit.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "src/core/i18n/locales";
const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? flatten(v, prefix + k + ".") : [[prefix + k, String(v)]],
  );
const load = (file) => new Map(flatten(JSON.parse(readFileSync(join(dir, file), "utf8"))));
const vars = (text) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort().join(",");

const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const reference = load("es.json");
let problems = 0;

for (const file of files.filter((f) => f !== "es.json")) {
  const other = load(file);
  for (const [key, text] of reference) {
    if (!other.has(key)) { console.log(`${file}: MISSING  ${key}`); problems++; }
    else if (vars(text) !== vars(other.get(key))) { console.log(`${file}: PLACEHOLDERS differ  ${key}  (es: ${vars(text) || "-"} / ${file}: ${vars(other.get(key)) || "-"})`); problems++; }
  }
  for (const key of other.keys()) if (!reference.has(key)) { console.log(`${file}: EXTRA    ${key}`); problems++; }
}
console.log(problems === 0 ? `i18n OK (${reference.size} keys x ${files.length} languages)` : `\n${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
