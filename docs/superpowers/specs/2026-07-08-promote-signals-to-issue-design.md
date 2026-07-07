# Promote intake signals into a live issue — design

**Date:** 2026-07-08
**Status:** Approved design, pending spec review

## Context / problem

Live intake signals (news / Reddit / X, Gemini-enriched) currently dead-end as a
read-only list on the `/intelligence` page (`LiveIntake.tsx`). They connect to nothing
— they can't be acted on, don't appear on the map, and produce no report or task.

Meanwhile the app is **cluster-centric**: the map pins, priority queue, cluster drawer,
MPLADS letter composer, and brief generation all hang off a `DemoCluster`. Actions
(`ACTION_TYPES`) and briefs both require a cluster.

**Goal:** a manual, button-driven flow that turns selected signals into a real cluster
("issue"), so they inherit the entire existing action/brief/map/queue machinery. The
"report or task the office acts on" is then just the cluster's *existing* drawer buttons
— no new output machinery.

**Non-goals:** automation (strictly user-triggered); server-side persistence (session-only
for v1); making the RAG assistant aware of promoted issues (v1 limitation, see below).

## User flow

1. On `/intelligence` Live Intake, each signal card gets a **checkbox**.
2. Selecting ≥1 signal reveals a sticky action bar: **"Promote N signals to issue."**
3. Click → `POST /api/intake/promote` with the selected signal ids.
4. Server **Gemini-synthesizes** the issue (title EN+HI, one-line summary, suggested
   action) from the signals; returns a fully-formed `DemoCluster`.
5. Client adds it to a session store; a **toast** ("Issue created — View") opens it in
   the drawer.
6. The promoted cluster now appears on the **map**, in the **priority queue**, and opens
   in the **drawer** with the existing "Draft MPLADS letter" / action / brief buttons —
   which are the "report or task."

## Architecture

### New: `POST /api/intake/promote` — the enrich step

- Input: `{ signalIds: string[] }`.
- Reads the selected `EnrichedSignal`s from the intake store (`listSignals()` in
  `intake/store.ts`, filter by id). Missing ids (e.g. server restarted) → 409 so the
  client can prompt a refresh.
- **Gemini synthesis** (mirror `intake/classify.ts`): `generateObject` with
  `chatModel()` from `ai/gemini.ts`, zod schema:
  ```
  { title, title_hi, summary, suggested_action: { type, title, body, mplads_eligible } }
  ```
  Prompt: the N signal summaries + their categories/wards → "write a concise issue for an
  MP's office." `suggested_action.type` constrained to the existing
  `Cluster["suggested_action"]["type"]` union.
- **Fallback** when `!hasGeminiKey()`: mechanical — title = `"{dominantCategory} concerns
  in {dominantWard}"`, summary = joined signal summaries, action = default `COORDINATION`.
- Builds and returns a `DemoCluster` via a `buildPromotedCluster(signals, synthesis)`
  helper (see below). Server-only; no key leaves the server.

### `buildPromotedCluster(signals, synthesis)` helper

Derives the cluster mechanically from the signals, filling AI-written fields from
`synthesis`:
- `id`: `cl_p${Date.now().toString(36)}` (unique, won't collide with `cl_01…cl_12`).
- `category`: dominant across signals; `urgency`: max severity across signals.
- `geo.centroid`: `WARD_CENTROIDS[dominantWard]` — a new small table (~13 New Delhi wards
  → lat/lng, authored from existing `MOCK_CLUSTERS` coords), defaulting to constituency
  center `{28.59, 77.19}` for `"Unknown"`. (Wards in `NEW_DELHI_WARDS` carry no coords.)
- `source_breakdown`: count selected signals by `source`.
- `submission_count`: N; `submission_ids`: the signal ids.
- `status`: `"new"`; `trend`: `isNew` (previous_week 0 → renders "new").
- `ui.wardLabel`, `ui.crossRefProse` empty, `ui.media` from any signal media (none for
  v1 social signals).
- Reuses the `DemoCluster` type — **no new type**.

### Session store (client) — mirrors existing override pattern

In `dashboard-store.ts`, alongside `dispatched` / `closedClusterIds`:
- `promotedClusters: DemoCluster[]`
- `promotedSignalIds: string[]` (idempotency)
- `addPromotedCluster(cluster, signalIds)` — prepend cluster, mark signals.
- Session-only; `// ponytail:` note for the localStorage/Firestore upgrade path, same as
  the sibling overrides.

### Wiring into surfaces (client display only)

Each surface currently reads static `MOCK_CLUSTERS`; extend to include
`promotedClusters` from the store:

| Surface | File | Change |
| --- | --- | --- |
| Map markers | `GoogleConstituencyMap.tsx` `renderMarkers` | subscribe to `promotedClusters`, iterate `[...MOCK_CLUSTERS, ...liveEvents, ...promotedClusters]`; give promoted a subtle "new" ring |
| Priority queue | `PriorityQueue.tsx` | render `[...promotedClusters, ...topClusters(5)]` (new issues bubble to top) |
| Cluster drawer | `ClusterDrawer.tsx` | lookup in `[...MOCK_CLUSTERS, ...promotedClusters]` |
| Action composer | `ActionComposer.tsx` | same lookup extension, so "Draft letter" works on a promoted cluster |

Leaflet (`LeafletConstituencyMap.tsx`) mirrors the Google change **if** it's not still
mid-refactor in a parallel session; otherwise deferred (Google is the active engine).

**v1 limitation (accepted):** server-side surfaces — `/api/clusters`, RAG corpus
(`ai/corpus.ts`), `assistant-brain.ts` — stay static, because promoted clusters live in
the client session store. The assistant won't cite session-promoted issues. Note in code;
revisit when clusters get real server persistence.

## Small cleanups riding along

- `LiveIntake.tsx`: widen local `Signal.source` type from `"reddit" | "twitter"` to
  include `"news"` (news signals already flow from the API but the type predates them);
  ensure `SourceIcon` handles `"news"`.
- Promoted signal cards show a "promoted ✓" state; their checkboxes disable (idempotency
  via `promotedSignalIds`).

## Edge cases

- **Re-promote:** blocked by `promotedSignalIds`; already-promoted cards are inert.
- **Signals expired server-side** (restart between GET and promote): route 409 → toast
  "Signals expired — hit Refresh."
- **Mixed wards/categories in selection:** dominant ward drives the centroid; max urgency
  drives severity; Gemini writes a title that spans them.
- **No Gemini key:** mechanical fallback still produces a usable cluster.

## Testing / verification

1. `pnpm typecheck`.
2. Dev server: `/intelligence` → select 2–3 signals → Promote → confirm toast, then verify
   the new pin on the map, a new top card in the priority queue, and the drawer opening
   with the synthesized title + working "Draft letter" button.
3. `curl -X POST /api/intake/promote -d '{"signalIds":[…]}'` → returns a valid
   `DemoCluster` JSON with Gemini-written title/summary/action.
4. No-key path: unset Gemini env for one call → mechanical cluster still returned.

## Out of scope (separate thread)

The `HeroInsights.tsx` "Attention this week" dead CTAs ("Apply all 3 recommendations" /
"Draft all 3 sanctions" have no `onClick`) and how that panel scales — tracked separately;
promoted issues surface in the **queue**, and the hero panel stays a curated top-2–3
(not a carousel).
