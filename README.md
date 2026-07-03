# Saarthi (सारथि)

**AI-powered executive intelligence for India's Members of Parliament.**

Saarthi (Sanskrit for *charioteer* — the trusted guide who counsels the warrior while
seeing the whole battlefield) ingests fragmented civic signals — citizen grievances
(WhatsApp / X / Reddit / web widget), news monitoring, and uploaded department documents
— clusters them semantically, cross-references public government datasets, ranks issues by
demand + severity + MPLADS-compliance leverage, and produces executive briefings, a RAG
Q&A assistant, and one-click MPLADS letters / briefing PDFs / meeting-prep decks.

> Built for **Build with AI: Code for Communities** (Google Cloud). Track 1 — People's
> Priorities: AI for Constituency Development Planning. Demo persona: MP Bansuri Swaraj,
> New Delhi Lok Sabha.

## Architecture

```
Intake (WhatsApp · X · Reddit · Widget · News RSS · Documents)
  → Cloud Functions (webhooks) → Pub/Sub
    → Worker pipeline: enrich → classify → geolocate → embed → cluster
                       → cross-ref (BigQuery) → MPLADS compliance → rank → action-tag
      → Firestore (realtime + vector)  ·  BigQuery (public data)  ·  Cloud Storage (media/outputs)
        → Next.js dashboard (Cloud Run · Firebase Auth · 6-role RBAC · English/Hindi)
           + Saarthi Assistant (RAG)  + Brief generation (PDF/PPTX/DOCX)
```

Full spec: [`ENGINEERING_HANDOFF.md`](./ENGINEERING_HANDOFF.md). Session context for
Claude Code: [`CLAUDE.md`](./CLAUDE.md).

## Monorepo layout

| Package | Name | Role |
| --- | --- | --- |
| `packages/shared` | `@saarthi/shared` | Data model (Firestore + BigQuery types). Single source of truth. |
| `app` | `@saarthi/app` | Next.js 14 dashboard (frontend + BFF `/api`). |
| `worker` | `@saarthi/worker` | Cloud Run ML pipeline. |
| `functions` | `@saarthi/functions` | Firebase Cloud Functions (intake webhooks). |
| `scripts` | `@saarthi/scripts` | Seed / demo-data generation. |
| `data` | — | Constituency geo, MPLADS rules, public seed, schemas. |

## Getting started

### Prerequisites

- **Node 22+** and **pnpm 9+** (repo tested on Node 24 / pnpm 10).
- For live cloud / emulators (not required for the offline skeleton):
  - [`gcloud` CLI](https://cloud.google.com/sdk/docs/install)
  - [`firebase` CLI](https://firebase.google.com/docs/cli): `npm i -g firebase-tools`

### Local dev (offline — no cloud account needed)

```bash
pnpm install
cp .env.example .env.local        # defaults run in emulator + mock-AI mode
pnpm dev:app                      # dashboard on http://localhost:3000
pnpm dev:worker                   # pipeline worker
```

`SAARTHI_MODE=emulator` and `SAARTHI_MOCK_AI=true` (the defaults) make the entire
pipeline and dashboard run locally with deterministic mock AI responses and seed data —
no GCP project, no API keys.

### With Firebase emulators

```bash
pnpm emulators                    # Firestore + Auth + Storage
pnpm seed:demo                    # generate synthetic demo submissions/clusters
```

### Quality gates

```bash
pnpm typecheck
pnpm test
```

## Status

🚧 Early scaffold. See `CLAUDE.md` → "Current state" and `ENGINEERING_HANDOFF.md` §12
for the phase plan and never-cut list.
