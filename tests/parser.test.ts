import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseReport, parseManifestEntry } from "../src/data/parser";

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

describe("parseReport - funnel", () => {
  it("parses overall funnel totals", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    expect(r.funnel.collected).toBe(103);
    expect(r.funnel.rejected).toBe(93);
    expect(r.funnel.dedup).toBe(1);
    expect(r.funnel.governed).toBe(7);
    expect(r.funnel.final).toBe(7);
  });

  it("parses per-bucket rows", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    expect(r.funnel.buckets).toHaveLength(5);
    expect(r.funnel.buckets[0]).toEqual({
      name: "blogs",
      collected: 8,
      rejected: 25,
      governed: 6,
      final: 6,
    });
    expect(r.funnel.buckets[4]).toEqual({
      name: "product_updates",
      collected: 0,
      rejected: 4,
      governed: 0,
      final: 0,
    });
  });
});

describe("parseReport - footer", () => {
  it("parses model, counts, and generatedAt", () => {
    const r = parseReport(golden, "/reports/2026/05/19-morning.md");
    expect(r.footer.model).toBe("minimax-portal/MiniMax-M2.7");
    expect(r.footer.itemCount).toBe(7);
    expect(r.footer.governanceFiltered).toBe(2);
    expect(r.footer.enrichmentAi).toBe(6);
    expect(r.footer.enrichmentDeterministic).toBe(1);
    expect(r.footer.generatedAt).toBe("2026-05-18T23:24:31.918296+00:00");
  });
});

describe("parseManifestEntry", () => {
  it("extracts manifest fields without throwing", () => {
    const e = parseManifestEntry(golden, "/reports/2026/05/19-morning.md");
    expect(e).toEqual({
      date: "2026-05-19",
      edition: "morning",
      title: "晓报 · 早报 — 2026-05-19",
      takeaway: expect.stringContaining("盖洛普民调"),
      path: "/reports/2026/05/19-morning.md",
      sourceCount: 7,
    });
  });
});
