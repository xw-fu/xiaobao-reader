# Xiaobao Reader

A front-end for browsing **Xiaobao** AI daily news reports. Reports live as markdown files under `public/reports/`; the app fetches an auto-generated `index.json` manifest, renders a calendar of available reports, and lazy-fetches each report on demand.

## Development

```bash
npm install
npm run dev          # http://localhost:5173 — the `predev` hook regenerates index.json
```

## Adding a new report

1. Drop the markdown at `public/reports/YYYY/MM/DD-{morning,evening}.md`
2. Run `npm run dev` (or `npx tsx scripts/build-index.ts` directly) to regenerate the manifest
3. The calendar highlights the new date automatically

## Tests

```bash
npm test             # one-shot (37 tests)
npm run test:watch   # interactive
```

## Build / deploy

```bash
npm run build        # typecheck + vite build → dist/
npm run preview      # serve dist/ locally
```

Deploy `dist/` to any static host (GitHub Pages, Vercel, Netlify). The `prebuild` script regenerates the manifest so deployments stay in sync with the markdown tree.

## Architecture

- **Vite + React + TypeScript** SPA, plain CSS modules
- **`src/data/parser.ts`** — single source of truth for the Xiaobao markdown shape (header, takeaway, sections, items, funnel, footer)
- **`src/data/manifest.ts`** — fetches `/reports/index.json` and validates structure
- **`src/data/report.ts`** — lazy-fetches and parses a single report, in-memory cached
- **`scripts/build-index.ts`** — Node script that walks `public/reports/**/*.md` and writes `index.json`

See [`docs/superpowers/specs/2026-05-19-xiaobao-reader-design.md`](docs/superpowers/specs/2026-05-19-xiaobao-reader-design.md) for the full design.

## Routes

| Path | View |
|---|---|
| `/` | Calendar of months with highlighted reports |
| `/r/:date` | Report detail (defaults to morning, falls back to evening) |
| `/r/:date/:edition` | Specific edition |
| `/search` | Full archive search by title/takeaway |
