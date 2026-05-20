import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../setup";
import { ManifestProvider } from "../../src/data/ManifestContext";
import App from "../../src/App";
import Search from "../../src/routes/Search";

const MANIFEST = {
  generatedAt: "2026-05-19T07:00:00Z",
  entries: [
    {
      date: "2026-05-19",
      edition: "morning",
      title: "晓报 · 早报 — 2026-05-19",
      takeaway: "盖洛普民调显示，美国人反对AI数据中心",
      path: "/reports/2026/05/19-morning.md",
      sourceCount: 7,
    },
    {
      date: "2026-05-18",
      edition: "morning",
      title: "晓报 · 早报 — 2026-05-18",
      takeaway: "Claude 发布新版本",
      path: "/reports/2026/05/18-morning.md",
      sourceCount: 5,
    },
  ],
};

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/search"]}>
      <ManifestProvider>
        <Routes>
          <Route element={<App />}>
            <Route path="/search" element={<Search />} />
          </Route>
        </Routes>
      </ManifestProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  server.use(http.get("/reports/index.json", () => HttpResponse.json(MANIFEST)));
});

describe("Search route", () => {
  it("filters entries by title or takeaway substring (case-insensitive)", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole("textbox");
    // Result links carry "2026-05-" in their text content; nav links don't.
    const initialResults = screen.getAllByRole("link").filter(a => a.textContent?.includes("2026-05-"));
    expect(initialResults).toHaveLength(2);
    await user.type(screen.getByRole("textbox"), "claude");
    const filteredResults = screen.getAllByRole("link").filter(a => a.textContent?.includes("2026-05-"));
    expect(filteredResults).toHaveLength(1);
    expect(filteredResults[0]).toHaveTextContent(/2026-05-18/);
  });

  it("shows '没有匹配的报告' when nothing matches", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(await screen.findByRole("textbox"), "zzzzzz");
    expect(screen.getByText(/没有匹配的报告/)).toBeInTheDocument();
  });
});
