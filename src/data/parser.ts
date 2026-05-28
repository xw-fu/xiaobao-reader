import type { Edition, Report, ManifestEntry, ReportSection, ReportItem } from "../types";
import { ReportParseError } from "../types";

const HEADER_RE = /^# (.+?) — (\d{4}-\d{2}-\d{2})\s*$/;
const EDITION_WORDS: Record<string, Edition> = { "早报": "morning", "晚报": "evening" };
const FUNNEL_MARKER = "**数据漏斗 · Funnel**";
const ITEM_TITLE_RE = /^- \*\*(.+?)\*\*\s*$/;
const ITEM_META_RE = /^- 📍\s*(.+?)\s*·\s*(.+?)\s*·\s*\[原文\]\((.+?)\)\s*$/;
const ITEM_WHAT_RE = /^- 概要：(.*)$/;
const ITEM_SOWHAT_RE = /^- 影响：(.*)$/;
const FUNNEL_TOTALS_RE = /^- 收集：(\d+) · 过滤：(\d+) · 去重：(\d+) · 治理：(\d+) · 最终：(\d+)\s*$/;
const FOOTER_RE =
  /模型：(.+?) · 条目：(\d+) · 过滤：(\d+) · 治理：(\d+) · AI\/规则enriched：(\d+)\/(\d+) · 生成时间：(\S+)/;

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

// Returns the line index where content sections begin (after the takeaway preamble).
// Two formats are supported:
//   A) preamble (one or more ## blocks) → "---" → content sections
//   B) single ## takeaway block, no --- separator → content starts at second ##
//
// Format A is detected by finding a "---" that has a "##" after it (before the funnel).
// When both formats could apply, A takes precedence because an explicit separator is authoritative.
function contentStartIndex(lines: string[]): number {
  const firstH2 = findLineIndex(lines, (l) => l.startsWith("## "));
  if (firstH2 === -1) return lines.length;

  // Scan for a --- that is followed by a ## (i.e., it's a preamble/content boundary).
  for (let i = firstH2 + 1; i < lines.length; i++) {
    if (lines[i].includes(FUNNEL_MARKER)) break;
    if (lines[i].trim() !== "---") continue;
    // Found a ---; check if a ## follows it.
    const nextH2 = findLineIndex(lines, (l) => l.startsWith("## "), i + 1);
    if (nextH2 !== -1) return i + 1; // Format A: content starts after this ---
  }

  // Format B: content starts at the second ## heading.
  const secondH2 = findLineIndex(lines, (l) => l.startsWith("## "), firstH2 + 1);
  return secondH2 === -1 ? lines.length : secondH2;
}

function parseTakeaway(lines: string[]): string {
  // Collect all text from the first ## heading up to the content boundary.
  // Multiple sub-headings before the boundary (e.g. 今日亮点 + 明日关注) are all takeaway.
  const firstH2 = findLineIndex(lines, (l) => l.startsWith("## "));
  if (firstH2 === -1) throw new ReportParseError("takeaway", 1, "missing takeaway section (no ## heading found)");
  const endIdx = contentStartIndex(lines);
  const collected: string[] = [];
  for (let i = firstH2 + 1; i < endIdx; i++) {
    const l = lines[i];
    if (l.includes(FUNNEL_MARKER)) break;
    if (l.startsWith("## ") || l.trim() === "---") continue; // skip boundary markers
    if (l.trim()) collected.push(l.trim());
  }
  if (collected.length === 0) throw new ReportParseError("takeaway", firstH2 + 1, "empty takeaway");
  return collected.join(" ").trim();
}

function isSectionBoundary(line: string): boolean {
  return line.startsWith("## ") || line.includes(FUNNEL_MARKER);
}

function parseSections(lines: string[]): ReportSection[] {
  const sections: ReportSection[] = [];
  let i = contentStartIndex(lines);
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

interface ParsedFunnel {
  collected: number; rejected: number; dedup: number; governed: number; final: number;
  buckets: { name: string; collected: number; rejected: number; governed: number; final: number }[];
}

function parseFunnel(lines: string[]): ParsedFunnel {
  const markerIdx = findLineIndex(lines, (l) => l.includes(FUNNEL_MARKER));
  if (markerIdx === -1) {
    // Funnel section missing — return empty funnel rather than crashing the whole report.
    return { collected: 0, rejected: 0, dedup: 0, governed: 0, final: 0, buckets: [] };
  }

  // Totals line: first `- 收集：...` after the marker.
  let totalsIdx = -1;
  for (let i = markerIdx + 1; i < lines.length; i++) {
    if (FUNNEL_TOTALS_RE.test(lines[i])) { totalsIdx = i; break; }
    if (lines[i].startsWith("## ")) break;
  }
  if (totalsIdx === -1) {
    // Funnel totals missing — return empty funnel rather than crashing.
    return { collected: 0, rejected: 0, dedup: 0, governed: 0, final: 0, buckets: [] };
  }
  const t = FUNNEL_TOTALS_RE.exec(lines[totalsIdx])!;
  const totals = {
    collected: +t[1], rejected: +t[2], dedup: +t[3], governed: +t[4], final: +t[5],
  };

  // Buckets table: lines that start with `|` and aren't the header/separator.
  const buckets: ParsedFunnel["buckets"] = [];
  for (let i = totalsIdx + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l.startsWith("|")) {
      if (buckets.length > 0) break;       // table is finished
      continue;                            // table hasn't started yet
    }
    if (l.includes("数据源") || /^\|\s*-+/.test(l)) continue; // header / separator
    const cells = l.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length !== 5) {
      throw new ReportParseError("funnel.bucket", i + 1, `expected 5 cells, got ${cells.length}: ${l}`);
    }
    const [name, c1, c2, c3, c4] = cells;
    for (const [val, label] of [[c1, "collected"], [c2, "rejected"], [c3, "governed"], [c4, "final"]] as const) {
      if (!/^\d+$/.test(val)) throw new ReportParseError("funnel.bucket", i + 1, `non-numeric ${label}: ${val}`);
    }
    buckets.push({ name, collected: +c1, rejected: +c2, governed: +c3, final: +c4 });
  }

  return { ...totals, buckets };
}

function parseFooter(lines: string[]): { model: string; itemCount: number; governanceFiltered: number; enrichmentAi: number; enrichmentDeterministic: number; generatedAt: string } {
  // Search bottom-up for the footer line, since it's the last italic line.
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = FOOTER_RE.exec(lines[i]);
    if (m) {
      return {
        model: m[1],
        itemCount: +m[2],
        governanceFiltered: +m[4],
        enrichmentAi: +m[5],
        enrichmentDeterministic: +m[6],
        generatedAt: m[7],
      };
    }
  }
  throw new ReportParseError("footer", lines.length, "missing footer line (模型：... · 生成时间：...)");
}

export function parseReport(source: string, path: string): Report {
  const lines = splitLines(source);
  const { title, date, edition } = parseHeader(lines);
  const takeaway = parseTakeaway(lines);
  const sections = parseSections(lines);
  const funnel = parseFunnel(lines);
  const footer = parseFooter(lines);

  const sourceCount = sections.reduce((n, s) => n + s.items.length, 0);
  const meta: ManifestEntry = { date, edition, title, takeaway, path, sourceCount };

  return { meta, takeaway, sections, funnel, footer };
}

/**
 * Lightweight parser for build-index.ts — extracts manifest fields. Section
 * structure (and item count) is parsed for sourceCount, but funnel/footer
 * parsing is skipped.
 */
export function parseManifestEntry(source: string, path: string): ManifestEntry {
  const lines = splitLines(source);
  const { title, date, edition } = parseHeader(lines);
  const takeaway = parseTakeaway(lines);
  const sections = parseSections(lines);
  const sourceCount = sections.reduce((n, s) => n + s.items.length, 0);
  return { date, edition, title, takeaway, path, sourceCount };
}
