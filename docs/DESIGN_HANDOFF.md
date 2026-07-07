# Saarthi (सारथि) — Design Session Handoff Brief v2

**For:** Claude Design (parallel session)
**From:** Product & Strategy session
**Purpose:** Change brief + updated current-state spec for the design system, components, and prototype
**Version:** v2 — post-pivot
**Important:** A v1 prototype already exists (built as Awaaz). This document is written as a **change brief first, full spec second**. Read Section 1 (What's Changed) before touching anything.
**Sibling docs (also updated):** `ENGINEERING_HANDOFF.md`, `SITEMAP.md`
**Hackathon:** Build with AI: Code for Communities (Google Cloud, national)
**Track:** Track 1 — People's Priorities: AI for Constituency Development Planning

---

## 1. What's changed since v1

Read this section end-to-end before making any changes to the existing prototype.

### 1.1 🔄 Product renamed: Awaaz → **Saarthi** (सारथि)

Sanskrit for *charioteer*, *guide*, *trusted advisor* — Krishna as Arjuna's charioteer in the Mahabharata. Better resonance for an MP/Minister audience than "voice."

**Where this affects your work:**
- Product name in every screen, header, favicon, empty state, loading state, success message
- Logo (if v1 had one — needs regeneration)
- Any illustrative assets that leaned on "voice/megaphone" iconography — pivot to guide/compass/wayfinder metaphors if you had those. Restraint preferred; a text wordmark is often stronger than icon-heavy branding for government tools.
- All Hindi copy (सारथि uses Devanagari; the letterform is beautiful — use it prominently in the wordmark)

### 1.2 🔄 Product reframed: "civic listening layer" → **"AI-powered executive intelligence platform"**

**Old framing:** Awaaz listens to citizens across channels and surfaces priorities for MPs.

**New framing:** Saarthi is the AI charioteer for India's decision-makers. It converts scattered government data — citizen priorities, news, reports, social media, department documents — into concise, actionable intelligence, so decision-makers understand what matters *in minutes, not hours*.

**New one-line pitch:** *"Understand your constituency in five minutes."*

**Copy affected:**
- Homepage / dashboard empty state
- Onboarding wizard
- Marketing surfaces (login, footer, about)
- Component microcopy where the old framing leaked

**Tone stays government-formal, but now leans into "clarity" and "time saved" over "amplification."**

### 1.3 🔄 Priority Action Queue → **"Today's Top 5 Issues"**

The new primary user journey opens with an AI briefing. Rename the left-rail component and elevate its visual prominence — it's now the *first thing* the user sees, on par with (arguably above) the map. Consider whether the map should shrink or the Top 5 should expand.

The Priority Card component design itself stands. Just the container and framing shifts.

### 1.4 ➕ Two major new components to design

These are net-new since v1. Detailed specs in Section 8.

- **Saarthi Assistant** — conversational Q&A drawer (persistent) + full page at `/assistant`. This is the **new demo hero moment**. Design it to feel like a trusted advisor, not a chatbot.
- **Brief Composer** — one-click generation of formal outputs (PDF, PPTX, DOCX). Users pick a type, optionally add a prompt, get a real file.
- **Document Uploader** — MP staff upload PDFs, meeting notes, department reports; feeds the Assistant's knowledge base.

### 1.5 ➕ Personas expanded from 2 → 6

v1 had "MP" and "MP Office Staff" as monolithic personas. Reality of Indian MP offices is more textured. Full breakdown in Section 5.

Design implications summary:
- **Chief of Staff** is the *actual daily power user* (4 hrs/day vs MP's 15 min). Add power-user affordances (filters, bulk actions, saved views, exports) without cluttering the MP's simpler view.
- **Constituency Coordinator** often isn't English-fluent. Hindi UI has to be genuinely usable, not a translation afterthought.
- **Field Worker** needs a lightweight mobile view — structural for now (post-hackathon polish), but the data model + auth support it.
- **Communications** persona needs a social-monitoring surface. Consider a dedicated tab.
- **Observer** = read-only role for interns, party workers, journalists. Design implication: buttons should hide/disable cleanly by role.

### 1.6 ➕ Hindi UI is now first-class

Not a "phase 2 toggle." Every string in `en.json` and `hi.json` from day one, language switcher in the header, layouts stress-tested with Devanagari (needs ~15% more vertical space), Indian numeral formatting (₹1,00,000 not ₹100,000).

**Please re-audit every existing v1 screen with Hindi content at 100% fidelity.** Text overflow, truncation, alignment, and font pairing all need to hold up.

### 1.7 ➕ New intake channels (backend, no citizen UI to design)

- **News monitoring** — RSS from Indian news sources ingests as evidence sources
- **Document upload** — MP staff upload PDFs (covered by new Document Uploader UI)

**Evidence Drawer** should extend to show these as source types alongside WhatsApp / X / Reddit / widget. New source icons needed: 📰 (news), 📄 (document).

### 1.8 ➕ New user journey (7 steps) — shapes the whole dashboard

1. Open dashboard → immediate awareness of what matters
2. See **"Today's Top 5 Issues"** AI briefing (renamed component)
3. Click into an issue → detail
4. Explore AI-generated overview with data, timelines, source references
5. Ask follow-up questions via **Saarthi Assistant** (NEW step)
6. Generate output with one click via **Brief Composer** (NEW step)
7. Share or assign follow-up actions

Design should make steps 5 and 6 feel like *natural continuations* of the flow, not tucked-away separate features. The Assistant drawer should be discoverable from every screen; the Brief button should sit inside the Action Composer alongside "Draft letter."

### 1.9 ➖ What explicitly does NOT get designed

Scope discipline matters — we're a week from demo:

- **Cabinet Minister-specific screens.** Cabinet Ministers are a pitch persona ("this extends to them tomorrow"), not a v2 build. They'll use the MP dashboard as-is if needed. No new persona screens.
- **Vaishu's full future-state flow** (approval chain → officer dashboard → work-in-progress → citizen close-loop → archive analytics). This is roadmap slide territory. Do not design officer dashboards or delegation/verification screens.
- **Full staff HR** — role-based access only. No hiring, payroll, performance reviews, time-off, org chart.
- **Field Worker mobile UI polish** — structural mobile view scaffolded, deep polish is post-hackathon.
- **Onboarding wizard deep design** — keep structural per v1.

### 1.10 ➡️ What carries forward from v1 unchanged

Most of v1 stands. Do not rebuild these:

- **Constituency Map** (Google Maps Platform, heatmap + dots + filters + time slider)
- **Priority Card** component design (just contextually renamed)
- **Metrics Strip** (top of dashboard)
- **Evidence Drawer** (right rail) — extend to include news + document sources
- **Scope Toggle** (top-right)
- **Live Signal Feed** (bottom) — add news + document sources
- **Action Composer** (extends with brief generation as an action type)
- **MPLADS compliance gauges + views**
- **All ethical design constraints** (issue-centric, no political sentiment scoring, no engagement mechanics — see Section 10)
- **UX4G base + our two contributed patterns**

---

## 2. Product one-liner and pitch language

**Full one-liner for the pitch deck:**
> Saarthi (सारथि) is an AI-powered executive intelligence platform that ingests fragmented inputs — citizen priorities from WhatsApp, X, Reddit, and web widgets; news monitoring; department reports; uploaded documents — clusters them semantically, cross-references against public government data, and produces ranked action-tagged recommendations, conversational Q&A, and one-click generated briefs. With built-in MPLADS compliance and multi-tier replicability from constituency to national scale.

**Short taglines to explore:**
- "Understand your constituency in five minutes."
- "The AI charioteer for India's decision-makers."
- "From scattered data to decisive action."
- "Every voice, every source, one clear view."

**Slogan family constraint:** government-formal, not startup-cute. No emojis in taglines. Devanagari script (सारथि) can appear alongside Latin.

---

## 3. Pilot constituency (unchanged from v1)

**New Delhi Lok Sabha Constituency** — represented by Hon'ble Bansuri Swaraj, MP.

**Category scope (v1 categories still valid):**
1. Water & Sanitation
2. Public Health & Air Quality
3. Urban Infrastructure

---

## 4. Product principles (revised for v2)

1. **Executive-first, not chatbot-first.** Saarthi is a briefing product with conversational capabilities. Don't design as if it's ChatGPT with a map. Design as if it's *The Economist's morning brief* with real-time depth on demand.
2. **Issue-centric, not person-centric.** Citizen usernames stay one click deep. Aggregate public priorities, never spotlight complainants. (Unchanged from v1.)
3. **Government aesthetic, not tech startup.** UX4G is the base. This tool sits inside an MP's office. (Unchanged.)
4. **Multi-tier from day one.** Scope toggle Constituency ↔ District ↔ State ↔ National. Same UI, filtered scope. (Unchanged.)
5. **AI-transparent, not AI-magical.** Every ranking, cluster, recommendation, RAG answer, and generated brief cites its sources. Never a black box. (Extended: this now applies to the Assistant and Brief Composer as first-class UX requirements — every message from Saarthi shows *what it read*.)
6. **Action-oriented.** Every insight ends in a concrete action: MPLADS letter, Parliament question, coordination meeting, or generated brief. (Extended: "generate brief" is now a valid action alongside "draft letter.")
7. **Compliance-aware.** MPLADS rules surface as visible guardrails. (Unchanged.)
8. **Multilingual first-class.** English + Hindi UI, both fully polished. Not a translation toggle. (Elevated — was aspirational in v1, now mandatory.)

---

## 5. Personas (expanded 2 → 6)

### Primary — Member of Parliament (MP)
- **Time budget:** ~15 min/day. Opens Saarthi mostly on desktop, occasionally mobile web.
- **Motivation:** Understand what matters this week; approve high-value actions; maintain MPLADS compliance.
- **Design implication:** Home dashboard must answer *"what matters right now?"* in the first 15 seconds. Everything else is one click away, not on the surface.

### Secondary — Chief of Staff / Private Secretary
- **The actual daily power user.** ~4 hrs/day inside Saarthi.
- **Motivation:** Keep the MP briefed; draft everything; coordinate with district administration; follow through on actions.
- **Design implication:** Needs *power-user affordances* — filters, bulk operations, saved views, exports, keyboard shortcuts. These must be discoverable but not clutter the MP's simpler experience. Consider a UI density toggle in settings.

### Tertiary — Constituency Coordinator
- **Runs the physical constituency office.** Handles walk-in constituents, updates ground truth.
- **Digital literacy:** Moderate. **Often not English-fluent.**
- **Motivation:** Keep the constituency office responsive; know what's escalating in each ward.
- **Design implication:** Hindi UI must be fully functional (not just translated but *usable*). Simpler workflows preferred over dense power-user views.

### Quaternary — Field Worker
- **Uses Saarthi from the field.** Mobile-first, ward-scoped view only.
- **Motivation:** Mark clusters as "verified on ground" or "needs re-inspection." Add local context.
- **Design implication:** Structural mobile view for v2 — a minimal `/mobile/ward/[id]` route with the priority cards for that ward and a "verify" flow. Deep mobile polish is post-hackathon. **Don't skip the structural design — designing them out would be a scoping error.**

### Communications
- **Handles social media response, media relations.**
- **Motivation:** Track sentiment; respond to viral issues quickly; brief the MP on media attention.
- **Design implication:** Needs a distinct "Social & Sentiment" tab or view — trending items, source breakdown, media-attention flag.

### Observer (read-only)
- **Interns, party workers, journalists with temp access.**
- **Motivation:** Situational awareness only.
- **Design implication:** Every write-action button hides or disables cleanly. No frustration state for a role that legitimately can't act.

### Cabinet Ministers (vision persona, no dedicated design)
- Mentioned in pitch as future scope.
- **No screen design work for v2.** They'd use the MP dashboard as-is until a dedicated Minister view ships post-hackathon.

---

## 6. Primary user flows to design or update

### Flow A — MP's Executive Briefing (hero flow, updated)
1. MP opens dashboard
2. **"Today's Top 5 Issues"** briefing greets them (renamed from Priority Action Queue)
3. Metrics strip shows what changed since last login (deltas visible: "+3 new critical issues since Monday")
4. MP clicks issue → cluster detail with evidence, cross-reference, timeline
5. MP asks a follow-up in Saarthi Assistant drawer
6. Assistant answers with citations
7. MP clicks "Generate Briefing PDF" → PDF downloads, ready to share
8. MP clicks "Draft MPLADS letter" → letter drafts, MP approves, action logged

**This is the demo video.** Every screen and component in this flow gets your highest-quality attention.

### Flow B — Chief of Staff Deep Work
1. Chief of Staff opens dashboard
2. Bulk filter clusters by category × status × ward
3. Assign clusters to staff members (Constituency Coordinator, Communications)
4. Use Saarthi Assistant for research queries
5. Upload department documents to knowledge base
6. Draft briefs for MP review
7. Track action outcomes over time

**Design implication:** dashboards should support both flows without being cluttered for the MP or too spartan for Chief of Staff. UI density preference in settings.

### Flow C — Constituency Coordinator (Hindi-first)
1. Opens dashboard in Hindi
2. Sees ward-level view of clusters
3. Updates ground truth ("verified on ground" / "citizen already resolved")
4. Escalates hotspots
5. Uses Assistant in Hindi to query the corpus

### Flow D — Live Feed Monitoring (unchanged from v1)
### Flow E — MPLADS Compliance Check (unchanged from v1)
### Flow F — Category Deep-Dive (unchanged from v1)
### Flow G — Replicability View (unchanged from v1)

---

## 7. Design system foundation (unchanged base, additions noted)

### Base: UX4G Design System 2.0
- Figma library: https://www.figma.com/design/1EKGqpZzycO79xvRpOHHEQ/UX4G-Design-System-2.0-Web-Kit--Community-
- Reference: https://www.ux4g.gov.in/case-studies/ux4g-design-system.php

### Contributed patterns (updated count: v1 had 2, v2 has 4)

1. **Citizen Priority Card** (v1, still valid) — the hero cluster card
2. **Live Signal Feed** (v1, still valid) — real-time stream, now including news + documents
3. **Saarthi Assistant Message** (v2 new) — conversational message pattern with inline citations
4. **Cited Insight Card** (v2 new) — used in generated briefs and Assistant answers; a paragraph or chart with mandatory attached source pills

Document all four for possible UX4G contribution submission — this is a soft pitch angle worth preserving.

### Language & script (elevated priority)
- Devanagari requires ~15% more vertical space. **Re-audit every v1 screen with Hindi at full fidelity.**
- Indian numeral formatting mandatory: ₹1,00,000 not ₹100,000
- Never truncate Hindi mid-conjunct
- Font pairing: Noto Sans + Noto Sans Devanagari (UX4G standard). Test at all weights.

---

## 8. Components to design or update

### 8.1 Priority Card (v1 — unchanged design, contextual rename only)
Design stands. It now sits inside "Today's Top 5 Issues," not "Priority Action Queue."

### 8.2 Live Signal Feed (v1 — extend for new sources)
Add source badges: 📰 news, 📄 document. Update filter chip options.

### 8.3 Constituency Map (v1 — unchanged)

### 8.4 Evidence Drawer (v1 — extend)
Add rendering for two new evidence types:
- **News article snippet** — headline, publication, date, link. Show as a card with the news source's iconography.
- **Document excerpt** — page number, quoted passage, "View full document" link. Similar treatment to a legal citation.

### 8.5 Metrics Strip (v1 — extend)
Add a "changed since last login" section. Delta indicators: `+3 critical`, `+12 submissions`, `1 action pending approval`.

### 8.6 Scope Toggle (v1 — unchanged)

### 8.7 Action Composer (v1 — extend)
Add new action mode alongside existing MPLADS Letter / Parliament Question / Ministry Letter / Coordination Meeting:
- **Generate Brief** — sub-mode selector (Daily Briefing PDF / Meeting Prep PPTX / Policy Summary DOCX)

### 8.8 Saarthi Assistant (NEW — hero component for v2)

**Purpose:** Conversational Q&A over the constituency corpus (submissions, clusters, uploaded documents, public data).

**Two surfaces:**
- **Drawer mode** — persistent, right-side, available on every dashboard screen. Collapsible.
- **Full-page mode** — `/assistant` route, wider layout, conversation history sidebar.

**Anatomy:**
- Header: "Saarthi Assistant" title (in current UI language), model badge (subtle), conversation title (AI-generated from first query, editable)
- Conversation area:
  - **User messages:** right-aligned, brief
  - **Assistant messages:** left-aligned, prose with **inline citation pills** — every claim has a pill like `[Cluster: Water shortage Chandrapur]` or `[Doc: DUSIB Report p.14]` or `[Data: Census 2011]` that opens the source in a popover
  - Charts rendered inline when Saarthi surfaces data (bar/line/simple pie, restrained)
  - "Suggested follow-ups" chip row after each assistant message
- Input area:
  - Text input with placeholder suggestions rotating: *"Ask about your constituency..."*, *"पूछें अपने निर्वाचन क्षेत्र के बारे में..."*
  - Voice input button (uses browser MediaRecorder)
  - Attach document button (opens Document Uploader inline)
  - Send button
- Conversation history (full-page mode only): left rail with past conversations, searchable

**States:**
- Empty (no conversation yet) — show 4-6 example prompts as clickable cards. Examples:
  - *"Summarize my constituency this week"*
  - *"Show me water issues in SC-majority wards where DUSIB has no planned works"*
  - *"Which of my MPLADS recommendations are still pending?"*
  - *"Compare citizen complaints against the DUSIB report I uploaded"*
- Thinking/generating (streaming) — subtle animation, no fake "typing dots" (this is a government tool)
- With citations — expanded/collapsed citation popovers
- Error (couldn't retrieve, no matching sources) — graceful, offers to broaden the search
- Empty results — "I don't have enough information in your corpus to answer that. Try uploading relevant documents."

**Ethical UI constraint:** the Assistant must *never* fabricate citations. If a citation pill exists, clicking it must open a real, retrievable source. Design should make citations feel like the primary output, not decoration.

**Interaction pattern:** clicking a citation pill opens a *popover*, not a new page. The popover shows the source snippet + a "View full source" link that opens the full cluster/document/submission in context.

### 8.9 Brief Composer (NEW — v2)

**Purpose:** One-click generation of formal outputs (PDF, PPTX, DOCX) with cited evidence.

**Entry points:**
- Dedicated `/briefs` route (list + create)
- Inside Action Composer as a mode (as noted in 8.7)
- Contextual "Generate Brief" button on cluster detail pages

**Anatomy (create view):**
- Brief type selector — 5 cards:
  - 📄 **Daily Briefing** (PDF, 5 pages)
  - 🖥 **Meeting Prep** (PPTX, 8–10 slides) with recipient sub-selector (District Collector / State Minister / Cabinet)
  - 📃 **Policy Summary** (DOCX, 2 pages) with category sub-selector
  - ✉️ **MPLADS Recommendation Letter** (PDF, official letterhead)
  - 🏛 **Parliament Question** (DOCX, Question Hour format)
- Optional prompt input: *"Anything specific to focus on?"*
- Cluster selector (multi-select) — pre-populated with top-ranked if left empty
- Document selector (optional) — pull in uploaded docs as references
- Language toggle (English / Hindi output)
- Preview button (opens a preview modal)
- Generate button (triggers async generation, moves to `Generating...` state)

**Anatomy (list view):**
- Table of past briefs: title, type, format, generated by, date, download
- Filters: by type, by date, by author
- Bulk delete for stale briefs

**States:**
- Empty (no briefs yet)
- Generating (progress indicator, cancellable)
- Ready (download button, share button, "regenerate with tweaks" button)
- Failed (error message, retry)

**Preview modal:**
- Renders the brief inline (PDF preview via iframe, PPTX first-3-slides preview, DOCX first-page preview)
- Download, Regenerate, Discard actions

**Ethical UI constraint:** every generated brief must clearly show which sources fed it. Design the "sources used" section as visible metadata, not hidden in a footer.

### 8.10 Document Uploader (NEW — v2)

**Purpose:** MP staff upload PDFs, meeting notes, department reports, correspondence for Saarthi to reference in Assistant answers and briefs.

**Entry points:**
- Dedicated `/documents` route (list + upload)
- Inline within the Assistant input (attach button)
- Inline within Brief Composer (reference-doc picker)

**Anatomy (upload view):**
- Drag-drop area (accepts PDF, DOCX, TXT)
- File size + count limits visible upfront
- After drop: processing state per file with progress
  - `Uploading… → Parsing… → Indexing… → Ready`
- Metadata capture: title (auto-populated from filename, editable), category (optional), visibility toggle (Personal / Shared with constituency team)

**Anatomy (list view):**
- Grid or list of uploaded documents
- Each card: title, source filename, page count, upload date, uploaded by, visibility badge, category badge, AI-generated summary (1–2 lines)
- Actions: view (opens in reader), search within (opens Assistant scoped to this doc), delete, change visibility

**Reader view:**
- PDF-native rendering
- Sidebar with AI-generated summary + extracted entities (people, places, dates, monetary values)
- "Ask Saarthi about this document" quick action

**States:**
- Empty (with upload prompt)
- Processing
- Ready
- Failed (with retry)

---

## 9. Screens (updated map)

| Screen | Route | v1 status | v2 change |
|---|---|---|---|
| Login / Auth | `/login` | v1 exists | Rename Awaaz → Saarthi in copy |
| Dashboard | `/dashboard` | v1 exists | Elevate "Today's Top 5" panel; add "changed since last login" to metrics strip; add Assistant drawer trigger |
| Cluster Detail | `/cluster/[id]` | v1 exists | Add news + document evidence rendering; add Assistant deep-link ("Ask about this issue"); add Brief button |
| Category View | `/category/[slug]` | v1 exists | Same evidence extensions |
| MPLADS | `/mplads` | v1 exists | Unchanged |
| Live Feed | `/live` | v1 exists | Add news + document sources |
| Action Log | `/actions` | v1 exists | Add brief actions to log |
| **Saarthi Assistant** | `/assistant` | **NEW** | Design from scratch (see 8.8) |
| **Briefs** | `/briefs` | **NEW** | Design from scratch (see 8.9) |
| **Documents** | `/documents` | **NEW** | Design from scratch (see 8.10) |
| Staff Management | `/staff` | v1 structural | Extend to 6 roles (see Section 5) |
| Settings | `/settings` | v1 exists | Add language switcher prominent, UI density toggle |
| Onboarding | `/onboarding` | v1 structural | Add role selection on invite |
| Mobile Ward view | `/mobile/ward/[id]` | **NEW structural** | Minimal design — priority cards + verify action |

---

## 10. Ethical design constraints (unchanged, still red lines)

Every constraint from v1 still holds. Restating because these matter:

1. **Issue-centric ranking view.** Usernames never appear on the primary dashboard. Only one click deep, inside the evidence drawer.
2. **No political sentiment scoring displayed to user.** Backend filters political attacks from ranking, but the UI never shows "who's attacking you" as a feature. This is a red line.
3. **Data provenance visible on every insight.** Never a ranking without an evidence trail. **Extended for v2: every Assistant answer and every generated brief must show sources visibly.**
4. **No engagement mechanics.** No streaks, XP, gamification. Governance tool, not habit-forming app.
5. **Explicit consent language on citizen surfaces.** WhatsApp bot and widget copy must show what happens to submissions.
6. **No hallucinated citations.** (New in v2.) Every citation pill in the Assistant must resolve to a real, retrievable source. Design should make this feel like the primary output, not decoration.

---

## 11. Visual direction (unchanged from v1)

- Palette: warm neutrals, deep navy primary, saffron + Indian green accents. Not startup-bright.
- Typography: Noto Sans + Noto Sans Devanagari (UX4G standard).
- Density: information-dense but scannable. Government users expect data richness.
- Illustrations: minimal. No cartoon characters or mascots.
- Iconography: line icons, UX4G weight.
- Motion: purposeful only. No decorative animation.
- Data viz: restrained. Simple bar / line / gauge. No 3D or gradient charts.

---

## 12. Deliverables expected back from design session (v2)

Since v1 exists, this is a **delta list** — what to add or update:

1. **Rename + reframe pass** — all screens updated to Saarthi + new positioning language
2. **Hindi audit** — every v1 screen tested at 100% Hindi fidelity, layouts adjusted
3. **New components** — Saarthi Assistant (drawer + full page), Brief Composer, Document Uploader, all states, all interactions
4. **Evidence Drawer + Live Feed extensions** — news + document source rendering
5. **Metrics Strip extension** — "changed since last login" delta indicators
6. **Action Composer extension** — Generate Brief mode
7. **New screens** — `/assistant`, `/briefs`, `/documents`, `/mobile/ward/[id]`
8. **Role model UI variants** — where the UI changes across the 6 roles, document it (usually: buttons hide/disable; occasionally: distinct views like Communications' Social tab)
9. **Updated design tokens** — if v1 didn't yet output a clean tokens JSON, ship one now for engineering
10. **Updated clickable prototype** — 7-step user journey (Section 1.8) flows end-to-end for the demo video
11. **Design system contribution doc** — updated to 4 patterns (was 2)

---

## 13. References

- UX4G Design System 2.0: https://www.figma.com/design/1EKGqpZzycO79xvRpOHHEQ/UX4G-Design-System-2.0-Web-Kit--Community-
- UX4G case studies: https://www.ux4g.gov.in/case-studies/ux4g-design-system.php
- India.gov.in (visual language reference): https://www.india.gov.in/
- MPLADS official portal: https://mplads.mospi.gov.in/
- Google Design's "Making the connected experience" (RAG UI patterns): https://design.google
- Bansuri Swaraj X handle (for demo mentions): look up in session

---

## 14. Coordination notes with product & engineering

- **Do not block engineering.** If a v2 component isn't ready, engineering scaffolds with functional-first defaults and restyles when your specs land. Priority Card, Assistant, and Brief Composer are the three engineering will scaffold first.
- **Design tokens as JSON** — hand off `design-tokens.json` (colors, spacing, typography, radii) that engineering imports into `tailwind.config.ts`.
- **Coordinate on the two new hero moments** — Saarthi Assistant and Brief Composer are the new demo hero components. They need parallel iteration with engineering, not sequential handoff.
- **Sync when changing v1 designs.** If you decide to modify a component that engineering has already built, flag it in this doc (or a comment thread) with rationale.

---

## Changelog

- **v2 (2026-07-03):** Post-pivot. Renamed Awaaz → Saarthi. Executive intelligence framing. Added: Saarthi Assistant, Brief Composer, Document Uploader, 6-role personas, Hindi-first UI, news + document evidence types. Journey rewritten (7 steps). Vaishu flow diagram scoped as roadmap-only. Cabinet Ministers held as pitch-only persona.
- **v1 (2026-07-01):** Initial handoff for Awaaz. Constituency-centric civic listening layer. 2 personas, 2 contributed patterns.
