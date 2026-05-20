import type { Report } from "../types";
import { parseReport } from "./parser";

export class ReportFetchError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "ReportFetchError";
  }
}

export class ReportNotFoundError extends ReportFetchError {
  constructor(public path: string) {
    super(`Report not found: ${path}`);
    this.name = "ReportNotFoundError";
  }
}

const cache = new Map<string, Report>();

/** Test-only: clear the in-memory cache between tests. */
export function _clearCache(): void {
  cache.clear();
}

export async function loadReport(path: string): Promise<Report> {
  const cached = cache.get(path);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch(path);
  } catch (err) {
    throw new ReportFetchError(`network error fetching ${path}`, err);
  }
  if (res.status === 404) throw new ReportNotFoundError(path);
  if (!res.ok) throw new ReportFetchError(`failed to fetch ${path}: HTTP ${res.status}`);

  const source = await res.text();
  const report = parseReport(source, path);
  cache.set(path, report);
  return report;
}
