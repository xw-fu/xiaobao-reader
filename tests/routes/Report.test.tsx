import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { server } from "../setup";
import { ManifestProvider } from "../../src/data/ManifestContext";
import { _clearCache } from "../../src/data/report";
import App from "../../src/App";
import Report from "../../src/routes/Report";

const golden = readFileSync(resolve(__dirname, "../fixtures/golden.md"), "utf8");

const MANIFEST = {
  generatedAt: "2026-05-19T07:00:00Z",
  entries: [
    {
      date: "2026-05-19",
      edition: "morning",
      title: "晓报 · 早报 — 2026-05-19",
      takeaway: "今日要点示例",
      path: "/reports/2026/05/19-morning.md",
      sourceCount: 7,
    },
  ],
};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ManifestProvider>
        <Routes>
          <Route element={<App />}>
            <Route path="/r/:date" element={<Report />} />
            <Route path="/r/:date/:edition" element={<Report />} />
          </Route>
        </Routes>
      </ManifestProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  _clearCache();
  server.use(http.get("/reports/index.json", () => HttpResponse.json(MANIFEST)));
});

describe("Report route", () => {
  it("fetches and renders the report markdown", async () => {
    server.use(http.get("/reports/2026/05/19-morning.md", () => HttpResponse.text(golden)));
    renderAt("/r/2026-05-19");
    expect(await screen.findByText("晓报 · 早报 — 2026-05-19")).toBeInTheDocument();
    expect(await screen.findByText(/AI 前沿/)).toBeInTheDocument();
    const matches = screen.getAllByText("The AI trial of the century ends with a whimper");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows '找不到这份报告' when the manifest has no entry for that date", async () => {
    renderAt("/r/2099-01-01");
    expect(await screen.findByText(/找不到这份报告/)).toBeInTheDocument();
  });

  it("shows an inline error when the markdown fetch fails with 404", async () => {
    server.use(
      http.get("/reports/2026/05/19-morning.md", () => new HttpResponse(null, { status: 404 })),
    );
    renderAt("/r/2026-05-19");
    expect(await screen.findByText(/找不到这份报告/)).toBeInTheDocument();
  });
});
