import type { Edition, Report, ManifestEntry, ReportSection, ReportItem } from "../types";
import { ReportParseError } from "../types";

const HEADER_RE = /^# (.+?) — (\d{4}-\d{2}-\d{2})\s*$/;
const EDITION_WORDS: Record<string, Edition> = { "早报": "morning", "晚报": "evening" };
const FUNNEL_MARKER = "**数据漏斗 · Funnel**";
const ITEM_TITLE_RE = /^- \*\*(.+?)\*\*\s*$/;
const ITEM_META_RE = /^- 📍\s*(.+?)\s*·\s*(.+?)\s*·\s*\[原文\]\((.+?)\)\s*$/;
const ITEM_WHAT_RE = /^- 概要：(.*)$/;
const ITEM_SOWHAT_RE = /^- 影响：(.*)$/;

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

function isSectionBoundary(line: string): boolean {
  return line.startsWith("## ") || line.includes(FUNNEL_MARKER);
}

function parseSections(lines: string[]): ReportSection[] {
  const sections: ReportSection[] = [];
  const takeawayIdx = findLineIndex(lines, (l) => l.trim() === "## 今日要点");
  let i = takeawayIdx + 1;
  // skip until the first section that's NOT 今日要点
  while (i < lines.length && !(lines[i].startsWith("## ") && lines[i].trim() !== "## 今日要点")) {
    if (lines[i].includes(FUNNEL_MARKER)) return sections;
    i++;
  }
  while (i < lines.length) {
    if (lines[i].includes(FUNNEL_MARKER)) break;
    if (!lines[i].startsWith("## ")) { i++; continue; }
    const title = lines[i].slice(3).trim();
    i++;
    const items: ReportItem[] = [];
    while (i < lines.length && !isSectionBoundary(lines[i])) {
      const titleMatch = ITEM_TITLE_RE.exec(lines[i]);
      if (!titleMatch) { i++; continue; }
      const item = parseItem(lines, i);
      items.push(item.item);
      i = item.nextIndex;
    }
    sections.push({ title, items });
  }
  return sections;
}

function parseItem(lines: string[], startIdx: number): { item: ReportItem; nextIndex: number } {
  const titleMatch = ITEM_TITLE_RE.exec(lines[startIdx]);
  if (!titleMatch) throw new ReportParseError("item", startIdx + 1, "expected item title");
  const title = titleMatch[1];

  // Find the next three meta lines, skipping blanks.
  let i = startIdx + 1;
  const next = (re: RegExp, region: string): RegExpExecArray => {
    while (i < lines.length && !lines[i].trim()) i++;
    if (i >= lines.length) throw new ReportParseError(region, startIdx + 1, `missing line for item "${title}"`);
    const m = re.exec(lines[i]);
    if (!m) throw new ReportParseError(region, i + 1, `did not match expected pattern for item "${title}": ${lines[i]}`);
    i++;
    return m;
  };

  const meta = next(ITEM_META_RE, "item.meta");
  const what = next(ITEM_WHAT_RE, "item.what");
  const soWhat = next(ITEM_SOWHAT_RE, "item.soWhat");

  return {
    item: {
      title,
      source: meta[1],
      dateLabel: meta[2],
      url: meta[3],
      what: what[1].trim(),
      soWhat: soWhat[1].trim(),
    },
    nextIndex: i,
  };
}

export function parseReport(source: string, path: string): Report {
  const lines = splitLines(source);
  const { title, date, edition } = parseHeader(lines);
  const takeaway = parseTakeaway(lines);
  const sections = parseSections(lines);

  const sourceCount = sections.reduce((n, s) => n + s.items.length, 0);

  const meta: ManifestEntry = { date, edition, title, takeaway, path, sourceCount };

  return {
    meta,
    takeaway,
    sections,
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
