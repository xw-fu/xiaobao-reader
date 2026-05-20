import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parseManifestEntry } from "../src/data/parser";
import type { Manifest, ManifestEntry } from "../src/types";

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (stat.isFile() && full.endsWith(".md")) yield full;
  }
}

function toUrlPath(reportsDir: string, absPath: string): string {
  const rel = relative(reportsDir, absPath).split(sep).join("/");
  return "/reports/" + rel;
}

export function buildIndex(reportsDir: string): Manifest {
  const entries: ManifestEntry[] = [];
  for (const file of walk(reportsDir)) {
    const source = readFileSync(file, "utf8");
    const path = toUrlPath(reportsDir, file);
    try {
      entries.push(parseManifestEntry(source, path));
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(`failed to parse ${path}: ${reason}`);
    }
  }
  // Sort: date desc, then evening before morning so evening lands first on same date.
  entries.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    if (a.edition === b.edition) return 0;
    return a.edition === "evening" ? -1 : 1;
  });

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    entries,
  };
  writeFileSync(join(reportsDir, "index.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return manifest;
}

// CLI entry — only runs when invoked directly, not when imported by tests.
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const reportsDir = join(process.cwd(), "public", "reports");
  const manifest = buildIndex(reportsDir);
  console.log(`Wrote index.json with ${manifest.entries.length} entries.`);
}
