import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parseManifestEntry } from "../src/data/parser";

interface BackfillReport {
  injected: number;
  skipped: number;
  errors: number;
}

const MAX_LEDE_CHARS = 40;
const STOP_CHARS = ["。", "！", "？", "!", "?"];
const COMMA_CHARS = ["，", ","];

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (stat.isFile() && full.endsWith(".md")) yield full;
  }
}

function deriveLede(takeaway: string): string {
  // Take everything up to the first sentence-ending punctuation.
  let endIdx = takeaway.length;
  for (const ch of STOP_CHARS) {
    const i = takeaway.indexOf(ch);
    if (i !== -1 && i < endIdx) endIdx = i;
  }
  let lede = takeaway.slice(0, endIdx).trim();

  // If still over the cap, trim at the nearest comma within MAX_LEDE_CHARS.
  if (lede.length > MAX_LEDE_CHARS) {
    let trimAt = -1;
    for (const ch of COMMA_CHARS) {
      const i = lede.lastIndexOf(ch, MAX_LEDE_CHARS - 1);
      if (i > trimAt) trimAt = i;
    }
    if (trimAt > 0) lede = lede.slice(0, trimAt).trim();
    else lede = lede.slice(0, MAX_LEDE_CHARS).trim();
  }

  return lede;
}

function injectLede(source: string, lede: string): string {
  // Insert "## 概要\n\n<lede>\n\n" immediately after the H1 header line.
  const lines = source.split("\n");
  const headerIdx = lines.findIndex((l) => l.startsWith("# "));
  if (headerIdx === -1) return source;
  const before = lines.slice(0, headerIdx + 1);
  const after = lines.slice(headerIdx + 1);
  while (after[0] === "") after.shift();
  while (after[0] && !after[0].startsWith("## ")) after.shift();
  return [...before, "", "## 概要", "", lede, "", ...after].join("\n");
}

export function backfillLede(reportsDir: string): BackfillReport {
  const report: BackfillReport = { injected: 0, skipped: 0, errors: 0 };
  for (const file of walk(reportsDir)) {
    const source = readFileSync(file, "utf8");
    if (source.includes("\n## 概要\n") || source.startsWith("## 概要\n")) {
      report.skipped++;
      continue;
    }
    try {
      const entry = parseManifestEntry(source, "");
      if (entry.lede) {
        report.skipped++;
        continue;
      }
      const lede = deriveLede(entry.takeaway);
      if (!lede) {
        report.skipped++;
        continue;
      }
      const updated = injectLede(source, lede);
      writeFileSync(file, updated, "utf8");
      const rel = relative(reportsDir, file).split(sep).join("/");
      console.log(`[backfill] injected lede into ${rel}: "${lede}"`);
      report.injected++;
    } catch (err) {
      const rel = relative(reportsDir, file).split(sep).join("/");
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[backfill] skipped ${rel}: ${reason}`);
      report.errors++;
    }
  }
  return report;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const reportsDir = join(process.cwd(), "public", "reports");
  const r = backfillLede(reportsDir);
  console.log(`[backfill] done. injected=${r.injected} skipped=${r.skipped} errors=${r.errors}`);
}
