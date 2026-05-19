import type { Edition, Report, ManifestEntry } from "../types";
import { ReportParseError } from "../types";

const HEADER_RE = /^# (.+?) — (\d{4}-\d{2}-\d{2})\s*$/;
const EDITION_WORDS: Record<string, Edition> = { "早报": "morning", "晚报": "evening" };

function splitLines(src: string): string[] {
  return src.replace(/\r\n/g, "\n").split("\n");
}

function findLineIndex(lines: string[], predicate: (l: string) => boolean, start = 0): number {
  for (let i = start; i < lines.length; i++) if (predicate(lines[i])) return i;
  return -1;
}

function parseHeader(lines: string[]): { title: string; date: string; edition: Edition } {
  const idx = findLineIndex(lines, (l) => l.startsWith("# "));
  if (idx === -1) throw new ReportParseError("header", 1, "missing H1");
  const m = HEADER_RE.exec(lines[idx]);
  if (!m) throw new ReportParseError("header", idx + 1, `H1 does not match expected shape: ${lines[idx]}`);
  const title = `${m[1]} — ${m[2]}`;
  const date = m[2];
  let edition: Edition | undefined;
  for (const [word, ed] of Object.entries(EDITION_WORDS)) {
    if (m[1].includes(word)) { edition = ed; break; }
  }
  if (!edition) throw new ReportParseError("header", idx + 1, `no edition word (早报/晚报) in title: ${m[1]}`);
  return { title, date, edition };
}

function parseTakeaway(lines: string[]): string {
  const startIdx = findLineIndex(lines, (l) => l.trim() === "## 今日要点");
  if (startIdx === -1) throw new ReportParseError("takeaway", 1, "missing ## 今日要点");
  const collected: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("## ") || l.trim() === "---") break;
    if (l.trim()) collected.push(l.trim());
  }
  if (collected.length === 0) throw new ReportParseError("takeaway", startIdx + 1, "empty takeaway");
  return collected.join(" ").trim();
}

export function parseReport(source: string, path: string): Report {
  const lines = splitLines(source);
  const { title, date, edition } = parseHeader(lines);
  const takeaway = parseTakeaway(lines);

  const meta: ManifestEntry = {
    date,
    edition,
    title,
    takeaway,
    path,
    sourceCount: 0, // filled in once items are parsed
  };

  return {
    meta,
    takeaway,
    sections: [],
    funnel: { collected: 0, rejected: 0, dedup: 0, governed: 0, final: 0, buckets: [] },
    footer: {
      model: "",
      itemCount: 0,
      governanceFiltered: 0,
      enrichmentAi: 0,
      enrichmentDeterministic: 0,
      generatedAt: "",
    },
  };
}
