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

describe("parseReport - sections and items", () => {
  it("parses two sections with the expected item counts", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    expect(r.sections.map((s) => s.title)).toEqual(["AI 前沿", "国际动态"]);
    expect(r.sections[0].items).toHaveLength(2);
    expect(r.sections[1].items).toHaveLength(5);
  });

  it("extracts title, source, dateLabel, url, what, soWhat for the first item", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    const item = r.sections[0].items[0];
    expect(item.title).toBe("The AI trial of the century ends with a whimper");
    expect(item.source).toBe("Gary Marcus");
    expect(item.dateLabel).toBe("5月19日");
    expect(item.url).toBe("https://garymarcus.substack.com/p/the-ai-trial-of-the-century-ends");
    expect(item.what).toBe("The AI trial of the century ends with a whimper");
    expect(item.soWhat).toBe("and so there are some things we will never know");
  });

  it("counts total items across sections in meta.sourceCount", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    expect(r.meta.sourceCount).toBe(7);
  });
});
