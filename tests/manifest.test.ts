import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./setup";
import { loadManifest, ManifestLoadError } from "../src/data/manifest";

describe("loadManifest", () => {
  it("returns the parsed manifest on 200", async () => {
    server.use(
      http.get("/reports/index.json", () =>
        HttpResponse.json({
          generatedAt: "2026-05-19T07:00:00Z",
          entries: [
            {
              date: "2026-05-19",
              edition: "morning",
              title: "晓报 · 早报 — 2026-05-19",
              takeaway: "x",
              path: "/reports/2026/05/19-morning.md",
              sourceCount: 7,
            },
          ],
        }),
      ),
    );
    const m = await loadManifest();
    expect(m.entries).toHaveLength(1);
    expect(m.entries[0].date).toBe("2026-05-19");
  });

  it("throws ManifestLoadError on 404", async () => {
    server.use(http.get("/reports/index.json", () => new HttpResponse(null, { status: 404 })));
    await expect(loadManifest()).rejects.toBeInstanceOf(ManifestLoadError);
  });

  it("throws ManifestLoadError when the JSON is structurally invalid", async () => {
    server.use(http.get("/reports/index.json", () => HttpResponse.json({ generatedAt: "2026-05-19T07:00:00Z", wrong: "shape" })));
    await expect(loadManifest()).rejects.toThrowError(/entries/);
  });

  it("accepts a 午报 (health) entry alongside morning/evening", async () => {
    // Regression: 2026-06-27 — runtime guard isEdition() only matched morning/evening,
    // so health entries from index.json caused the whole manifest to fail to load,
    // breaking the reader even though the index build was correct.
    server.use(
      http.get("/reports/index.json", () =>
        HttpResponse.json({
          generatedAt: "2026-06-26T12:00:00Z",
          entries: [
            { date: "2026-06-26", edition: "morning", title: "t", takeaway: "x",
              path: "/reports/2026/06/26-morning.md", sourceCount: 1 },
            { date: "2026-06-26", edition: "health", title: "t", takeaway: "x",
              path: "/reports/2026/06/26-health.md", sourceCount: 1 },
          ],
        }),
      ),
    );
    const m = await loadManifest();
    expect(m.entries).toHaveLength(2);
    expect(m.entries.map((e) => e.edition)).toEqual(["morning", "health"]);
  });

  it("rejects an unknown edition with a clear error message", async () => {
    server.use(
      http.get("/reports/index.json", () =>
        HttpResponse.json({
          generatedAt: "2026-06-26T12:00:00Z",
          entries: [
            { date: "2026-06-26", edition: "weekly", title: "t", takeaway: "x",
              path: "/reports/2026/06/26-weekly.md", sourceCount: 1 },
          ],
        }),
      ),
    );
    await expect(loadManifest()).rejects.toThrowError(/edition must be "morning" or "evening" or "health"/);
  });
});
