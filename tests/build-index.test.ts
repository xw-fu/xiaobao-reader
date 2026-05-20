import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { buildIndex } from "../scripts/build-index";

let tmpRoot: string;
let publicReports: string;

const golden = readFileSync(resolve(__dirname, "fixtures/golden.md"), "utf8");
const evening = readFileSync(resolve(__dirname, "fixtures/evening.md"), "utf8");

beforeEach(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), "xiaobao-"));
  publicReports = join(tmpRoot, "public", "reports");
  mkdirSync(join(publicReports, "2026", "05"), { recursive: true });
  writeFileSync(join(publicReports, "2026", "05", "19-morning.md"), golden);
  writeFileSync(join(publicReports, "2026", "05", "19-evening.md"), evening);
});

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

describe("buildIndex", () => {
  it("writes a manifest with one entry per markdown file", () => {
    buildIndex(publicReports);
    const indexPath = join(publicReports, "index.json");
    expect(existsSync(indexPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(indexPath, "utf8"));
    expect(manifest.entries).toHaveLength(2);
    expect(manifest.entries.map((e: { path: string }) => e.path).sort()).toEqual([
      "/reports/2026/05/19-evening.md",
      "/reports/2026/05/19-morning.md",
    ]);
  });

  it("entries include date, edition, title, takeaway, sourceCount", () => {
    buildIndex(publicReports);
    const manifest = JSON.parse(readFileSync(join(publicReports, "index.json"), "utf8"));
    const morning = manifest.entries.find((e: { edition: string }) => e.edition === "morning");
    expect(morning).toMatchObject({
      date: "2026-05-19",
      edition: "morning",
      title: "晓报 · 早报 — 2026-05-19",
      sourceCount: 7,
    });
    expect(morning.takeaway).toMatch(/^盖洛普民调/);
  });

  it("sorts entries by date desc, then edition (evening after morning of same date)", () => {
    buildIndex(publicReports);
    const manifest = JSON.parse(readFileSync(join(publicReports, "index.json"), "utf8"));
    expect(manifest.entries[0].edition).toBe("evening");
    expect(manifest.entries[1].edition).toBe("morning");
  });

  it("includes generatedAt as ISO timestamp", () => {
    buildIndex(publicReports);
    const manifest = JSON.parse(readFileSync(join(publicReports, "index.json"), "utf8"));
    expect(manifest.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
