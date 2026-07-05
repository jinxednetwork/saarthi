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
| `app` | `@saarthi/app` | Next.js 14 dashboard (frontend + BFF `/api`, incl. the shared tickets API). |
| `citizen` | `@saarthi/citizen` | Standalone citizen grievance portal (separate deployable). |
| `worker` | `@saarthi/worker` | Cloud Run ML pipeline. |
| `functions` | `@saarthi/functions` | Firebase Cloud Functions (intake webhooks). |
| `scripts` | `@saarthi/scripts` | Seed / demo-data generation. |
| `data` | — | Constituency geo, MPLADS rules, public seed, schemas. |

## What's built (dashboard)

The `app` dashboard is a working demo of the full loop — it runs offline with mock
AI and seed data, and lights up real Gemini when a key is present.

- **Command deck** — dual-theme glass over a live constituency map; priority queue,
  signal sources, live feed, KPI snapshot as collapsible panels.
- **Saarthi Assistant** — retrieval-augmented Q&A grounded in the same data the panels
  show; every claim carries a resolvable citation. Real Gemini via a server-only route,
  with a scripted brain as an identical-contract fallback.
- **Proposals + head-to-head ranking** — MPs author their own works and rank competing
  ones on a transparent §8.3 score (citizen demand + public-data severity + MPLADS
  leverage + cost-effectiveness), decided side-by-side.
- **Public-data demand engine** — curated Census / UDISE+ / CPCB / DJB ward figures with
  provenance, turned into cited demand severity per ward and need.
- **Feedback consolidation** — citizen signals rolled into themes with one-click "draft a
  proposal".
- **Citizen Portal** — a **separate, standalone app** (`citizen/`, its own deployable link):
  mobile-first grievance intake (mock OTP → photo/voice/text → ticket + status), the WhatsApp
  fallback. It POSTs to a shared tickets API (`app` `/api/citizen/tickets`, CORS-open,
  Firestore-shaped store); reports surface live in the MP dashboard's feed.
- **Documents** — scan/upload a letter → Gemini parses summary/entities/₹-values/chunks →
  searchable library whose chunks feed the Assistant.
- **Generated PDFs** — MPLADS recommendation letter on letterhead + Daily Briefing, both
  real downloadable files.
- **Inclusivity** — English + Hindi fully translated with a 22-scheduled-language picker
  (honest fallback notice), a UX4G-style accessibility toolbar, and first-run onboarding.

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

### Citizen Portal (separate app)

The portal is a standalone app so it can be hosted on its own link; it talks to the
dashboard's shared tickets API.

```bash
pnpm dev:app                      # dashboard + API on http://localhost:3000
pnpm dev:citizen                  # citizen portal on http://localhost:3100
```

The portal reads `NEXT_PUBLIC_SAARTHI_API_URL` (default `http://localhost:3000`) to reach
the API — set it to the dashboard/API origin in production. Submissions appear live in the
MP dashboard's feed (in-memory Firestore-shaped store for the demo; swap to Firestore for
persistence across instances).

### Optional: real Gemini AI

The dashboard runs fully without a key (scripted assistant, mock document parsing). To
activate real Gemini for the Assistant and document parsing, add a key to
`app/.env.local` (gitignored, server-only — never exposed to the client, per §14):

```bash
# app/.env.local  — free key at https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Restart the dev server; the Assistant's "Demo Brain" badge becomes live Gemini. PDF
generation and everything else need no key.

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

The `app` dashboard demo is feature-complete for Track 1 (see **What's built** above);
it runs offline and activates real Gemini with a key. The `worker` / `functions` cloud
pipeline is scaffolded against the shared data model. See `docs/FEATURES_ROUND3_PLAN.md`
for the delivered plan and `ENGINEERING_HANDOFF.md` §12 for the never-cut list.
