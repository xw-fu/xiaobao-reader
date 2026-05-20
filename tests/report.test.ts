import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { http, HttpResponse } from "msw";
import { server } from "./setup";
import { loadReport, ReportFetchError, ReportNotFoundError, _clearCache } from "../src/data/report";

const golden = readFileSync(resolve(__dirname, "fixtures/golden.md"), "utf8");

beforeEach(() => _clearCache());

describe("loadReport", () => {
  it("fetches and parses a report from the given path", async () => {
    server.use(
      http.get("/reports/2026/05/19-morning.md", () => HttpResponse.text(golden)),
    );
    const report = await loadReport("/reports/2026/05/19-morning.md");
    expect(report.meta.date).toBe("2026-05-19");
    expect(report.sections).toHaveLength(2);
    expect(report.funnel.collected).toBe(103);
  });

  it("returns the cached value on the second call (no second HTTP request)", async () => {
    let calls = 0;
    server.use(
      http.get("/reports/2026/05/19-morning.md", () => {
        calls++;
        return HttpResponse.text(golden);
      }),
    );
    await loadReport("/reports/2026/05/19-morning.md");
    await loadReport("/reports/2026/05/19-morning.md");
    expect(calls).toBe(1);
  });

  it("throws ReportNotFoundError on 404", async () => {
    server.use(http.get("/reports/x.md", () => new HttpResponse(null, { status: 404 })));
    await expect(loadReport("/reports/x.md")).rejects.toBeInstanceOf(ReportNotFoundError);
  });

  it("throws ReportFetchError on a non-404 failure", async () => {
    server.use(http.get("/reports/y.md", () => new HttpResponse(null, { status: 500 })));
    await expect(loadReport("/reports/y.md")).rejects.toBeInstanceOf(ReportFetchError);
  });
});
