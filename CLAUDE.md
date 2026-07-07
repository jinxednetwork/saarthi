# CLAUDE.md — Saarthi (सारथि)

Persistent context for Claude Code sessions. Read this first. The full spec is
`docs/ENGINEERING_HANDOFF.md` — this file is the distilled version; that file wins on
any conflict.

## What this is

Saarthi is an AI-powered **executive intelligence platform for India's Members of
Parliament**. It ingests fragmented signals (citizen grievances via WhatsApp / X /
Reddit / web widget, news monitoring, uploaded documents), clusters them
semantically, cross-references public government datasets, ranks issues by demand +
severity + MPLADS-compliance leverage, and produces on-demand briefings, a RAG Q&A
assistant ("Saarthi Assistant"), and one-click generated outputs (MPLADS letters,
briefing PDFs, meeting-prep PPTX, policy DOCX).

- **Hackathon:** Build with AI: Code for Communities (Google Cloud). Track 1.
- **Demo persona:** MP Bansuri Swaraj, New Delhi Lok Sabha constituency.
- **v1 categories:** Water & Sanitation · Public Health & Air Quality · Urban Infrastructure.

## Locked decisions (don't relitigate — see §2 of the handoff)

- Name: **Saarthi** (formerly Awaaz — do not reintroduce the old name).
- Cloud: **Google Cloud only** (hackathon requirement).
- Stack: **TypeScript everywhere**, Next.js 14 App Router, Node 22+, pnpm workspaces.
- AI: Gemini 2.5 Pro (reasoning/briefs/RAG), Gemini 2.5 Flash (classification/high-volume),
  Vertex `text-embedding-004` (clustering + RAG), Cloud STT (Chirp), Sarvam AI fallback.
- Data: **Firestore** (realtime + vector search) + **BigQuery** (public-dataset joins).
- **Hindi UI is first-class**, not a translation afterthought. 22 languages for citizen intake.
- **6-role RBAC:** mp, chief_of_staff, constituency_coordinator, field_worker, communications, observer.

## Repo layout (pnpm monorepo)

```
packages/shared   # @saarthi/shared — the §6 data model as TS. Single source of truth
                  # for Firestore/BigQuery shapes. app/worker/functions ALL import this.
app               # @saarthi/app — Next.js 14 dashboard (frontend + BFF /api routes)
worker            # @saarthi/worker — Cloud Run ML pipeline (enrich→cluster→rank→RAG→briefs)
functions         # @saarthi/functions — Firebase Cloud Functions webhook receivers
scripts           # @saarthi/scripts — seed-firestore, generate-demo-data
data              # constituency geo, MPLADS rules, public seed, news sources, schemas
```

**Anti-drift rule:** any Firestore document shape or BigQuery row type is defined ONCE
in `packages/shared` and imported everywhere. Never redefine a shape locally.

## Working locally (nothing cloud is provisioned yet)

- `SAARTHI_MODE=emulator` + `SAARTHI_MOCK_AI=true` → whole system runs offline against
  Firebase emulators with deterministic mock AI responses. This is the default.
- `gcloud` and `firebase` CLIs are NOT installed on this machine yet — install them
  before running emulators or deploying.
- Copy `.env.example` → `.env.local` (app) / `.env` (worker, functions).

Commands:
```
pnpm install
pnpm dev:app          # dashboard
pnpm dev:worker       # pipeline
pnpm typecheck        # all packages
pnpm test
pnpm seed:demo        # generate synthetic demo data
```

## Order of operations (§19 — non-negotiable priority)

1. Data flow before UI polish.
2. Core loop (intake → cluster → rank → action) before advanced features (Assistant, briefs).
3. A dashboard with real ingested data + one working brief format beats a beautiful UI
   with fake data and broken generation.

**Never cut (§12):** Priority Card · Map · Cluster Detail · MPLADS view · MPLADS letter
generation · Saarthi Assistant Q&A · at least one brief format (PDF Daily Briefing).

## Guardrails (§14)

- No API keys client-side. All Gemini/Vertex calls go through Next.js `/api` routes.
- Never show raw citizen phone/username on ranking views — evidence drawer only, hashed ids.
- Signed URLs (1h expiry) for all media + generated files.
- RAG citations must resolve to real records. No hallucinated statistics or citations.

## Design context

Design strategy and visual system live in `app/PRODUCT.md` (register: product;
personality "Sober · Evidentiary · Assured"; four named anti-references) and
`app/DESIGN.md` (North Star: **"The Command Deck"** — dual-theme glass over the
constituency map; Secretariat palette as HSL vars; named rules: One Seal,
Meaning-Locked Colour, No-Hex, Tabular, Five-Blur, z-Ladder). Read both before
any UI work; the impeccable skill reads them automatically. The redesign plan
(user-approved) is `docs/REDESIGN_PLAN.md`.

**Dev-server rule:** never run `next build` while `next dev` is serving the
same `app/.next` — it corrupts the chunk map (HTTP 500s on `_next/static`).
Stop dev, build, restart.

## Current state

Working demo of the full loop — offline-capable (mock AI + seed data), and lights up real
Gemini + Firestore when configured. Live social/news intake is wired and real.

**Intake lives in the Next.js app, NOT the worker/Functions/Pub/Sub path the handoff
diagrams** (that remains aspirational). The real path:
- `app/src/lib/intake/*` + `POST /api/intake` — fetch **X** (official API v2, `x.ts`),
  **Reddit** (Apify `trudax/reddit-scraper-lite`, because the Responsible Builder Policy
  gates new Reddit API apps — OAuth is a fallback if approved), **news RSS incl. PIB**
  (`news.ts`) → Gemini enrich (`classify.ts`) → store (`store.ts`).
- Store is **Firestore-backed via ADC** when a Gemini/Vertex project is set (dedups by id,
  so re-fetching the same post won't backfill new fields; `ignoreUndefinedProperties` is on).
- **Promote signals → issue**: `POST /api/intake/promote` Gemini-synthesises selected signals
  into a session `DemoCluster` (`promote.ts`, stored in `dashboard-store` like `dispatched`),
  surfaced on map/queue/drawer/composer + live feed. Design:
  `docs/superpowers/specs/2026-07-08-promote-signals-to-issue-design.md`.
- Source credentials + which actor/tier: see `app/.env.example`.

`docs/design/Dashboard.pdf` holds design intent; `docs/design/user-flow-map.pdf` is the roadmap flow
(§16) — pitch, not v1.
