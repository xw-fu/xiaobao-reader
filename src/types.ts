export type Edition = "morning" | "evening";

export interface ManifestEntry {
  date: string;          // ISO date, e.g. "2026-05-19"
  edition: Edition;
  title: string;         // "晓报 · 早报 — 2026-05-19"
  takeaway: string;      // first paragraph under ## 今日要点
  path: string;          // "/reports/2026/05/19-morning.md"
  sourceCount: number;   // total items in the report
}

export interface Manifest {
  generatedAt: string;   // ISO timestamp produced by build script
  entries: ManifestEntry[];
}

export interface ReportItem {
  title: string;
  source: string;        // e.g. "Daring Fireball"
  dateLabel: string;     // e.g. "5月19日" — as printed in the markdown
  url: string;           // 原文 link
  what: string;          // 概要 (inline markdown allowed)
  soWhat: string;        // 影响 (inline markdown allowed)
}

export interface ReportSection {
  title: string;         // e.g. "AI 前沿"
  items: ReportItem[];
}

export interface FunnelBucket {
  name: string;          // e.g. "blogs"
  collected: number;
  rejected: number;      // column header 过滤
  governed: number;      // column header 治理
  final: number;
}

export interface ReportFunnel {
  collected: number;
  rejected: number;
  dedup: number;
  governed: number;
  final: number;
  buckets: FunnelBucket[];
}

export interface ReportFooter {
  model: string;
  itemCount: number;
  governanceFiltered: number;
  enrichmentAi: number;
  enrichmentDeterministic: number;
  generatedAt: string;   // ISO timestamp from the source markdown
}

export interface Report {
  meta: ManifestEntry;
  takeaway: string;
  sections: ReportSection[];
  funnel: ReportFunnel;
  footer: ReportFooter;
}

export class ReportParseError extends Error {
  constructor(
    public region: string,
    public lineNumber: number,
    message: string,
  ) {
    super(`${region} (line ${lineNumber}): ${message}`);
    this.name = "ReportParseError";
  }
}
