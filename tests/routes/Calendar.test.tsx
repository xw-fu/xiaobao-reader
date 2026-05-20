import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../setup";
import { ManifestProvider } from "../../src/data/ManifestContext";
import App from "../../src/App";
import Calendar from "../../src/routes/Calendar";
import Report from "../../src/routes/Report";

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
    {
      date: "2026-05-15",
      edition: "morning",
      title: "晓报 · 早报 — 2026-05-15",
      takeaway: "另一日",
      path: "/reports/2026/05/15-morning.md",
      sourceCount: 3,
    },
  ],
};

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ManifestProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<Calendar />} />
            <Route path="/r/:date" element={<Report />} />
            <Route path="/r/:date/:edition" element={<Report />} />
          </Route>
        </Routes>
      </ManifestProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  server.use(http.get("/reports/index.json", () => HttpResponse.json(MANIFEST)));
});

describe("Calendar route", () => {
  it("highlights days that have reports", async () => {
    renderApp("/");
    expect(await screen.findByRole("button", { name: /2026年5月19日/ })).toHaveClass(/has/i);
    expect(screen.getByRole("button", { name: /2026年5月15日/ })).toHaveClass(/has/i);
    expect(screen.queryByRole("button", { name: /2026年5月10日/ })).not.toBeInTheDocument();
  });

  it("navigates to /r/:date when a highlighted day is clicked", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const cell = await screen.findByRole("button", { name: /2026年5月19日/ });
    await user.click(cell);
    expect(await screen.findByText(/Report \(placeholder\)/)).toBeInTheDocument();
  });
});
