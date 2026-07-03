# data/

Seed + reference data. Firestore/BigQuery **shapes** live in `@saarthi/shared`
(`packages/shared`) — this directory holds the actual values.

| Path | Contents | Status |
| --- | --- | --- |
| `constituencies/` | New Delhi LS boundary GeoJSON + ward list (§11.1). | ⬜ add `new-delhi-ls.geojson` |
| `mplads/permitted-works.json` | MPLADS permitted sectors + prohibited items (§8.4). | ✅ |
| `news-sources/feeds.json` | RSS feeds for news monitoring (§7.5). | ✅ |
| `public/` | Census 2011, CPCB, DUSIB, MPLADS seed CSVs → BigQuery (§11.1). | ⬜ curate |
| `seed/` | ~250 synthetic submissions + ~35 clusters + demo docs (§11.2). | ⬜ generate via `pnpm seed:demo` |
| `schemas/` | Firestore + BigQuery DDL / index definitions. | ⬜ |

## Loading

- BigQuery public tables: `pnpm seed:bigquery` (loads `public/*.csv`).
- Firestore demo data: `pnpm seed:demo` then `pnpm seed:firestore`.
- BigQuery table row types: see `@saarthi/shared` `bigquery.ts`.
