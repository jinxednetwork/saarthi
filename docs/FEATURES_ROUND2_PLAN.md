# Saarthi Round 2 — Assistant, collapsible panels, /mplads, /actions, Intelligence bento

## Context

Post-redesign feedback ("looks damn cool" + refs): bento analytics for Intelligence, a
finance-style MPLADS/Budget breakdown page, collapse-in-place dashboard panels, a floating
Saarthi Assistant island on the dashboard + AI launcher at the sidebar bottom, and an
Actions tracker page. User-confirmed: **scripted demo brain** (offline intent matcher over
real mock data with citations) · **collapse in place** · **full MPLADS block set** ·
**action tracker** (not kanban).

## Architecture (from Plan agent, reviewed)

1. **Charts:** recharts@^2.15 ("use client" only, confined to /intelligence + /mplads
   chunks). Theme bridge `src/lib/use-chart-colors.ts`: resolves HSL vars via
   getComputedStyle on mount + on resolvedTheme change; consumers show Skeleton until
   resolved (solves SSR + literal-color + live retheme; No-Hex preserved). Donut/bars via
   recharts; SC/ST gauges + weekly heat strip + fund flow are custom SVG/CSS.
2. **Assistant:** one brain (`src/lib/assistant-brain.ts`, pure TS: 8 intents — water-in-
   SC-wards §8.6 hero, mplads-sc-gap hero, what-changed, top-issues, category-summary,
   budget-summary, action-status, fallback — all computed live from MOCK_CLUSTERS /
   MOCK_CONSTITUENCY / insights.ts / compliance.ts, never hardcoded); one panel UI
   (`AssistantPanel`) with citation chips (cluster → selectCluster, dataset → real links)
   + suggested chips + staged-reveal (reduced-motion instant); two mounts: `AssistantDock`
   (glass pill bottom-center of MapStage center column, stacked above MapToolbar; expands
   to 440px panel, local z-20) and `AssistantOverlay` (fixed bottom-right on other pages /
   mobile) + `AssistantLauncher` in Sidebar above MP identity. Store slice:
   assistantOpen/messages/thinking, askAssistant() with 650ms think delay.
3. **Panels:** store `collapsedPanels: Record<"kpis"|"queue"|"radial"|"feed", boolean>` +
   localStorage "saarthi-panels". Shared `CollapsiblePanel` (glass shell, header w/
   chevron + headerRight slot, grid-rows-[1fr↔0fr] animation, aria-expanded). KpiStack
   tiles de-glass to bg-surface/70 (frees blur budget for the dock). **MapStage: move
   pointer-events-auto from columns onto panels** (fixes dead map zones; collapse then
   frees genuinely draggable map).
4. **/mplads:** `src/lib/mplads-data.ts` — 15 SanctionedWork items, arithmetic HARD-GATED
   to reconcile (spent = ₹3.42Cr, SC 12.8%, ST 8.2%); dispatchedToWorks() merges session
   dispatches. Components: BudgetHeroTiles, SectorDonut, ComplianceGauges (SVG arcs w/
   floor ticks), WorksLedger (search + filters + session rows tinted), FundFlow (100%-
   stacked sector bar → click segment → per-ward CSS bars; NO d3-sankey), EligibilityChecker
   (sector/prohibited chips → checkEligibility verdict). `src/lib/compliance.ts` mirrors
   worker/src/compliance (comment: keep in sync until Phase 4).
5. **/actions:** `src/lib/actions-data.ts` — DemoAction extends @saarthi/shared Action +
   ui {refNo, clusterTitle, pathway, responseDueDays, progress}; 9 static (MoEFCC letter
   sent/42%, MPLADS letters responded/completed+sanctioned, PQ draft, meeting, brief,
   drafts) + mergeSessionDispatches (skip duplicates by cluster+type, prepend). Components:
   ActionsLedger (ref mono, pathway pill, status, countdown, outcome badge, click →
   drawer), ActionTimeline (4-step stepper), ActionFilters.
6. **Intelligence bento:** page regrid (12-col bento): compact heroes (6+6) → OutlookChart
   (12, unchanged component) → CategoryDonut(4) + WardHotspots(4) + ResponseBenchmark(4) →
   WeeklyPulse(6) + AnomaliesTile(3) + CrossRefsTile(3). `src/lib/insights.ts` shared by
   tiles AND assistant (signalsByCategory, wardHotspots, weekMovers, WEEKLY_PULSE). Delete
   InsightGrid.tsx after absorption. Shared `shell/PageHeader.tsx` for mplads/actions/
   intelligence.
7. **Nav:** Sidebar + TopBar mobile nav gain /mplads + /actions; "Soon" chips retire.

## Commits & gates

1. **Foundations** — recharts dep; use-chart-colors, compliance, insights, mplads-data,
   actions-data, assistant-brain; store slices. Gate: typecheck; ledger reconciles;
   ask() answers both §8.6 heroes non-fallback.
2. **Collapsible panels** — CollapsiblePanel + 4 refactors + MapStage pointer-events fix.
   Gate: map drags through freed space; state survives reload; blur ≤5.
3. **Assistant** — 4 components + hook; mounts in MapStage/layout/Sidebar. Gate: 8 intents
   demo; citation opens drawer over panel; Esc closes; mobile overlay.
4. **/mplads + /actions + nav + PageHeader.** Gate: composer dispatch → instant row in
   both ledgers; eligibility verdicts match worker for all 16 inputs; no Soon chips left.
5. **Intelligence bento** — tiles + regrid + compact heroes; delete InsightGrid. Gate:
   theme flip re-colors charts live; reduced-motion = finished charts; build green;
   recharts only in the two route chunks.

Also: copy this plan to docs/FEATURES_ROUND2_PLAN.md in commit 1 (user keeps plans in-repo).

## Risks

Recharts SSR (client-only + fixed-height cells + skeletons) · chart colors on theme flip
(re-read on resolvedTheme) · assistant z vs drawer (Sheet portals to body z-50, always
wins) · pointer-events regression (test panel scroll after fix) · data honesty (all numbers
derive from MOCK_CONSTITUENCY/MOCK_CLUSTERS single source) · never `next build` while dev
serves .next (stop dev first).

## Verification

Per-commit gates above. Final browser E2E: collapse/restore each panel + drag map through
gap; ask both hero queries → cited answers → click citation → drawer; dispatch letter →
/actions + /mplads rows; eligibility checker verdicts; theme flip on /intelligence +
/mplads; reduced-motion pass; production build with dev stopped.
