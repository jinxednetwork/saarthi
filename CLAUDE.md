# CLAUDE.md — Saarthi (सारथि)

Persistent context for Claude Code sessions. Read this first. The full spec is
`ENGINEERING_HANDOFF.md` — this file is the distilled version; that file wins on
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

Greenfield scaffold in progress. `Dashboard.pdf` holds the design intent (sibling docs
`DESIGN_HANDOFF.md` / `SITEMAP.md` referenced in the handoff do NOT yet exist on disk).
`vaishu user flow map disha.pdf` is the roadmap flow (§16) — pitch, not v1.
