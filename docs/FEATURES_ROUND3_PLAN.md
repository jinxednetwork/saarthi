# Saarthi Round 3 — Multilingual, Accessible, and AI-powered

## Context

User direction after the command-deck redesign: close the handoff's biggest gaps and "seriously
work on AI/Technical Execution." Four confirmed features, all on-spec with the engineering
handoff and its rubric:
- **A. i18n** — UX4G-style 22-scheduled-language picker; **English + Hindi fully translated**,
  the other 20 select cleanly and **fall back to English with a labelled notice** (honest copy);
  RTL for Urdu/Kashmiri/Sindhi. (Buys the 15% Inclusivity rubric.)
- **B. Accessibility toolbar** — UX4G-style: High Contrast, Text Size, Text Spacing, Line Height,
  Hide Images, Big Cursor, Screen Reader (TTS). Persistent widget **+ intro during onboarding**.
- **C. Real Gemini AI** — key WILL be provided (`app/.env.local`, gitignored). Real RAG Assistant,
  real document parsing. All calls server-side via `/api` (§14: no client-side keys). Graceful
  fallback to the existing scripted brain / mock when no key.
- **D. Document scan → parse → Documents library → feeds the Assistant** — MP uploads/scans a
  letter (PDF/image) → Gemini parses (summary, entities, dates, ₹ values, chunks) → saved to a
  Documents page → chunks join the RAG corpus so the MP can query their letters (§7.6 + §8.6).
- **E. Real PDF generation** (no key) — `@react-pdf/renderer`: MPLADS letter on letterhead +
  Daily Briefing PDF, downloadable. Closes the never-cut "at least one brief format" gap.

**Prerequisite:** place `GOOGLE_GENERATIVE_AI_API_KEY=...` in `app/.env.local` before commits 4–5
(commits 1–3 + 6 need no key). All work in `app/`; one shared type widens (`UI_LANGUAGES`).

## Architecture decisions (from Plan agent, reviewed)

1. **i18n:** lightweight custom Context — new `components/i18n/I18nProvider.tsx` + rewritten
   `lib/i18n.ts` exporting `LANGUAGES` metadata `{code, endonym, english, dir, translated}` for all
   22 and a synchronous `t(key, vars?)` (fallback: activeLang → en → key). EN bundled; others lazy
   `import()`. Choice persisted (`saarthi-lang`) + applied pre-hydration (inline script like
   next-themes) to set `<html lang dir>` with no flash. RTL via logical utilities (`ps/pe/ms/me`,
   `start/end`) + targeted `[dir=rtl]:` overrides in the shell; **map stays LTR**. Indian number/
   date formatting via `Intl`. Optional `scripts/i18n-generate.mjs` (manual Node script, Gemini
   Flash JSON mode) to machine-translate `en.json` → the other 20 (EN/HI stay hand-verified;
   `translated:true` only after review). **Migration scope now:** shell (Sidebar/TopBar/launcher),
   AssistantPanel chrome + SUGGESTED_CHIPS, PageHeader per route, WelcomeSplash, urgency/status/KPI
   labels, and ALL new onboarding/a11y/documents UI. **Deferred (tracked, not silently English):**
   intelligence tile prose, mplads ledger rows, feed bodies, drawer prose, letter body.
2. **A11y engine:** `data-a11y-*` attributes on `<html>` + a CSS var layer + pre-hydration script.
   Text size uses **`zoom` on the shell with a counter-`zoom` on `.leaflet-container`** (px-heavy
   codebase — zoom is the honest lever; map math untouched). Spacing/line via `--a11y-*` vars on
   body. High contrast = `html[data-a11y-contrast=high]` overriding ~6 token vars for dark+light
   (no third theme). Hide-images/big-cursor via CSS; TTS via `speechSynthesis` reading selection or
   `<main>`. `lib/a11y-store.ts` (zustand, `saarthi-a11y`) + `A11yRoot` + `AccessibilityToolbar`
   (glass button in TopBar → Popover). Independent of next-themes.
3. **Gemini:** **Vercel AI SDK v3** — `ai@^3.4.33` + `@ai-sdk/google@^0.0.55` + `zod@^3.23`
   (v4/5 need React 19 — pin v3). Models: `gemini-2.5-flash` (chat/RAG/parse), `gemini-2.5-pro`
   (briefs), `text-embedding-004` (768-dim, matches EMBEDDING_DIM). `lib/ai/gemini.ts`
   (`hasGeminiKey()` guard + provider). `/api/assistant` (nodejs): embed query → cosine top-K over
   corpus → `streamText` grounded answer + server-computed citations; **no-key → scripted `ask()`
   as one streamed chunk, identical client path**. `/api/documents/parse`: `generateObject` (Zod)
   multimodal → structured fields + `embedMany` chunks. Key server-only, never `NEXT_PUBLIC_`.
4. **Documents storage:** `lib/documents-store.ts` (zustand + `saarthi-documents`) holds record +
   text + chunk embeddings (768 floats ≈ 6KB/chunk, dozens of docs < 5MB; size guard + oldest
   eviction). **Originals (PDF/image bytes) → IndexedDB** (`lib/idb-docs.ts`) + session object-URL —
   never base64 in localStorage. (Phase 2: Firestore + Cloud Storage.)
5. **RAG corpus:** server base corpus (`lib/ai/corpus.ts`) from MOCK_CLUSTERS (title+crossRefProse+
   action body) + FEED_ITEMS + datasets, embedded once, module-memoized. **Client sends its uploaded
   doc chunks `{documentId,filename,chunkId,text,embedding}` in the `/api/assistant` body**; server
   merges + ranks once + returns citations resolving to clusterId (drawer) / dataset href / documentId
   (opens /documents). No re-embedding; corpus always matches what the MP uploaded.
6. **PDF:** `@react-pdf/renderer@^3.4` dynamic-imported only on generate → `pdf().toBlob()` →
   object-URL download. `MpladsLetter` (wired into ActionComposer "Preview on letterhead" + dispatch)
   + `DailyBriefing` (top-5 + KPIs + cited evidence, button in dashboard/intelligence header).

## Commit sequence (gate: typecheck + build + browser check each)

1. **i18n infra + shell migration** — I18nProvider, lib/i18n rewrite, 20 stub dictionaries (EN
   clone, translated:false), en/hi keys for migration scope, pre-hydration lang/dir script,
   language-picker in TopBar, RTL tweaks; widen `UI_LANGUAGES` (packages/shared). Gate: EN↔HI
   relabels chrome; Urdu flips dir=rtl + fallback notice; persists.
2. **Accessibility engine** — a11y-store, a11y-tts, AccessibilityToolbar, A11yRoot, globals.css a11y
   layer (zoom + map counter-zoom, high-contrast var overrides, hide-images, big-cursor), pre-hydration
   script. Gate: each control persists+applies; text-size scales chrome not map; high-contrast over
   both themes; TTS reads; reduced-motion honored.
3. **Focused onboarding** — OnboardingFlow (welcome → language → accessibility, glass modal),
   lib/onboarding.ts (`saarthi-onboarded`), gate splash behind it. Gate: first run shows 3 steps,
   writes both stores, persists.
4. **Gemini foundation + real RAG assistant** — install AI SDK; lib/ai/{gemini,cosine,corpus};
   /api/assistant + /api/embed; dashboard-store askAssistant → streaming (keep contract); .env.example.
   Gate: with key → streamed cited grounded answers; without → scripted fallback identical UI.
5. **Documents pipeline** — /documents page + Uploader/Library/Card/ParseResultView;
   documents-store + idb-docs; /api/documents/parse; Sidebar/TopBar nav; askAssistant attaches doc
   corpus. Gate: upload → parse (or mock) → summary+entities+preview → library → assistant answers
   over the doc with a documentId citation.
6. **Real PDF** — install react-pdf; pdf/{LetterheadStyles,MpladsLetter,DailyBriefing} +
   lib/pdf/generate; wire ActionComposer + a "Generate briefing" button. Gate: both PDFs download
   real files with letterhead, ref no, KPIs, cited evidence.
7. **Polish & verify** — i18n coverage + fallback-notice honesty, a11y/keyboard audit, no dead
   links, .env.example/README, full E2E, production build (dev stopped). Copy plan →
   docs/FEATURES_ROUND3_PLAN.md in commit 1.

## Risks & mitigations

Bundle bloat (AI SDK server-only in /api; react-pdf dynamic-imported) · localStorage 5MB (originals→
IndexedDB, embeddings guarded+evicted) · Gemini latency/errors/no-key (hasGeminiKey guard + fallback
on every route, try/catch→fallback) · a11y font-scale vs fixed map (zoom + counter-zoom, test 150%) ·
RTL breakage (logical utilities + [dir=rtl] overrides, map LTR) · i18n honesty (translated flag +
labelled notice, deep bodies explicitly deferred) · citation integrity (citations only from retrieved
records, never model free-text) · key security §14 (server-only, .env.local gitignored) · AI SDK/
react-pdf version pins (v3 / v3 for React 18).

## Verification

Per-commit gates above. Final browser E2E: switch language (EN/HI relabel, Urdu RTL, fallback notice);
each a11y control (contrast/size/spacing/line/hide-images/big-cursor/TTS) persists + applies, map
unbroken at 150%; onboarding first-run; ask the Assistant a question that needs an uploaded letter →
streamed cited answer resolving to the document; upload a letter → parse → library; download the MPLADS
letter PDF + Daily Briefing PDF. Production build with dev stopped. Re-run `/impeccable critique` to
measure. Note: `<1024px` and TTS are browser-capability dependent; deep-body i18n is a tracked gap.
