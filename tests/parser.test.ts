import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseReport } from "../src/data/parser";

const golden = readFileSync(resolve(__dirname, "fixtures/golden.md"), "utf8");

describe("parseReport - header + takeaway", () => {
  it("extracts the title, date, and edition from the H1", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    expect(r.meta.title).toBe("晓报 · 早报 — 2026-05-19");
    expect(r.meta.date).toBe("2026-05-19");
    expect(r.meta.edition).toBe("morning");
    expect(r.meta.path).toBe("/reports/2026/05/19-morning.md");
  });

  it("extracts the takeaway paragraph (今日要点)", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    expect(r.takeaway).toMatch(/^盖洛普民调显示/);
    expect(r.takeaway).toContain("土地占用");
  });
});
