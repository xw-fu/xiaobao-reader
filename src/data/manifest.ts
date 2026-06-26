import type { Manifest, ManifestEntry, Edition } from "../types";

export class ManifestLoadError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "ManifestLoadError";
  }
}

function isEdition(v: unknown): v is Edition {
  return v === "morning" || v === "evening" || v === "health";
}

function validateEntry(raw: unknown, idx: number): ManifestEntry {
  if (typeof raw !== "object" || raw === null) {
    throw new ManifestLoadError(`entries[${idx}] is not an object`);
  }
  const o = raw as Record<string, unknown>;
  for (const k of ["date", "title", "takeaway", "path"]) {
    if (typeof o[k] !== "string") throw new ManifestLoadError(`entries[${idx}].${k} is not a string`);
  }
  if (!isEdition(o.edition)) throw new ManifestLoadError(`entries[${idx}].edition must be "morning" or "evening" or "health"`);
  if (typeof o.sourceCount !== "number") throw new ManifestLoadError(`entries[${idx}].sourceCount is not a number`);
  return {
    date: o.date as string,
    edition: o.edition,
    title: o.title as string,
    takeaway: o.takeaway as string,
    path: o.path as string,
    sourceCount: o.sourceCount,
  };
}

function validate(raw: unknown): Manifest {
  if (typeof raw !== "object" || raw === null) throw new ManifestLoadError("manifest is not an object");
  const o = raw as Record<string, unknown>;
  if (typeof o.generatedAt !== "string") throw new ManifestLoadError("manifest.generatedAt is not a string");
  if (!Array.isArray(o.entries)) throw new ManifestLoadError("manifest.entries is not an array");
  return { generatedAt: o.generatedAt, entries: o.entries.map(validateEntry) };
}

export async function loadManifest(): Promise<Manifest> {
  let res: Response;
  try {
    res = await fetch("/reports/index.json", { cache: "no-cache" });
  } catch (err) {
    throw new ManifestLoadError("network error while fetching index.json", err);
  }
  if (!res.ok) throw new ManifestLoadError(`index.json fetch failed: HTTP ${res.status}`);
  let json: unknown;
  try {
    json = await res.json();
  } catch (err) {
    throw new ManifestLoadError("index.json is not valid JSON", err);
  }
  return validate(json);
}
