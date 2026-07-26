import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backfillLede } from "../scripts/backfill-lede";

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), "xiaobao-bf-"));
});

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

const SAMPLE_NO_LEDE = `# 晓报 · 早报 — 2026-06-01

*早安！*

## 今日要点

盖洛普民调显示，美国人无论政治立场如何，对AI数据中心的建设普遍持反对态度，主要担忧集中在能源消耗、水资源使用和土地占用等问题上。

---

## AI 前沿

- **Foo**
- 📍 Bar · 6月1日 · [原文](https://example.com)
- 概要：x
- 影响：y
`;

const SAMPLE_HAS_LEDE = `# 晓报 · 早报 — 2026-06-02

*早安！*

## 概要

已经写好的摘要

## 今日要点

随便一段长内容。

---

## AI 前沿

- **Foo**
- 📍 Bar · 6月2日 · [原文](https://example.com)
- 概要：x
- 影响：y
`;

describe("backfillLede", () => {
  it("injects a ## 概要 block derived from the first sentence of the takeaway", () => {
    mkdirSync(join(tmpRoot, "2026/06"), { recursive: true });
    const file = join(tmpRoot, "2026/06/01-morning.md");
    writeFileSync(file, SAMPLE_NO_LEDE);

    const report = backfillLede(tmpRoot);

    expect(report.injected).toBe(1);
    expect(report.skipped).toBe(0);
    const updated = readFileSync(file, "utf8");
    expect(updated).toContain("## 概要\n\n");
    expect(updated).toContain("盖洛普民调显示");
    // Original takeaway block must be untouched.
    expect(updated).toContain("## 今日要点\n\n盖洛普民调显示");
  });

  it("skips files that already have a ## 概要 block", () => {
    mkdirSync(join(tmpRoot, "2026/06"), { recursive: true });
    const file = join(tmpRoot, "2026/06/02-morning.md");
    writeFileSync(file, SAMPLE_HAS_LEDE);

    const report = backfillLede(tmpRoot);

    expect(report.injected).toBe(0);
    expect(report.skipped).toBe(1);
    const updated = readFileSync(file, "utf8");
    expect(updated).toBe(SAMPLE_HAS_LEDE);
  });

  it("trims the lede at the nearest comma when the first sentence is over 40 chars", () => {
    mkdirSync(join(tmpRoot, "2026/06"), { recursive: true });
    const long = `# 晓报 · 早报 — 2026-06-03

*早安！*

## 今日要点

盖洛普民调显示，美国人无论政治立场如何，对AI数据中心的建设普遍持反对态度，主要担忧集中在能源消耗与水资源使用问题上。

---

## AI 前沿

- **Foo**
- 📍 Bar · 6月3日 · [原文](https://example.com)
- 概要：x
- 影响：y
`;
    const file = join(tmpRoot, "2026/06/03-morning.md");
    writeFileSync(file, long);

    backfillLede(tmpRoot);
    const updated = readFileSync(file, "utf8");
    const ledeMatch = updated.match(/## 概要\n\n(.+?)\n\n## 今日要点/s);
    expect(ledeMatch).not.toBeNull();
    const lede = ledeMatch![1];
    expect(lede.length).toBeLessThanOrEqual(40);
    expect(lede).not.toMatch(/[。！?]/); // trimmed before the full stop
  });
});
