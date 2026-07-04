---
target: dashboard
total_score: 22
p0_count: 0
p1_count: 3
timestamp: 2026-07-03T23-03-11Z
slug: src-app-dashboard-dashboard-page-tsx
---
Method: dual-agent (A: a9dd17ca90c64b2be · B: a9577a740fd13a0b1)

Note: the :3000 dev server was serving 500s from a corrupted `.next` cache during the run; Assessment A inspected an untouched copy on :3001 (findings valid), Assessment B's CLI scan is valid but its in-page overlay ran against the error page (runtime overlay evidence void). Server has since been restarted clean.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dispatch feedback quiet; no explicit "letter sent" confirmation; time-range change visibly does nothing |
| 2 | Match System / Real World | 3 | MPLADS/DM/DSC language right; "clusters", "signals", "w/w" are data-team jargon in an MP's file |
| 3 | User Control and Freedom | 2 | Esc closes nothing; no undo after Approve & send; unskippable 3.3s splash every load |
| 4 | Consistency and Standards | 3 | Red "Live" dot vs green sync dot; urgency dot+label vs bordered pill; "30d" vs "Past 30 days" |
| 5 | Error Prevention | 1 | Signed government letter dispatches in one click, no confirmation; fake read-only "fields" |
| 6 | Recognition Rather Than Recall | 3 | "…" mystery button; four unreconciled totals (1,842 / 47 / top-5 / 12) |
| 7 | Flexibility and Efficiency | 1 | Zero keyboard shortcuts, no bulk actions, hover-only hub, forced splash |
| 8 | Aesthetic and Minimalist Design | 4 | Genuinely restrained; colour only where it means something |
| 9 | Error Recovery | 1 | No error states exist; dead `#` links and silent no-ops fail without explanation |
| 10 | Help and Documentation | 1 | "Methodology" / "Data sources (8)" are stubs; one hover hint total |
| **Total** | | **22/40** | **Acceptable — superb visual system around a demo-thin interaction layer** |

## Anti-Patterns Verdict

**LLM assessment:** Not AI-slop at a glance — "The Morning File" is genuinely executed (parchment + hairline borders + tabular Indian numerals + radial-hub hero instead of a stat-card row; saffron held to the wordmark). The palette is a human design-session choice carried with its own vocabulary. The slop-smells that exist are the app breaking its *own* rules: a 2px green inset side-stripe on dispatched feed items (`LiveFeed.tsx:57`), a decorative navy gradient on the BS avatar (`AppHeader.tsx:82`), and the navy→saffron splash progress gradient.

**Deterministic scan:** 6 findings (1 warning, 5 advisory). Genuine: undocumented `#EDE5D0` (`WelcomeSplash.tsx:32` — converges with the splash-gradient observation), undocumented `rgba(133,96,54,0.12)` (`ScrollShade.tsx:26`), off-scale radii 3px/2px (`globals.css:76,134`). False positive: the `design-system-font` warning on `theme("fontFamily.devanagari")` — a token *reference* the detector mangled; devanagari is declared in DESIGN.md. Borderline: `rgba(0,0,0,0.2)` marker shadow in `ConstituencyMap.tsx:90` (Leaflet divIcon markup — tokens can't reach it).

**Visual overlays:** not available this run — the dev-server 500 meant the detector injected into an empty error DOM ("No anti-patterns found" reflects a blank page). Server restarted clean since.

## Overall Impression

The visual system is the strongest thing this project owns — restrained, meaning-locked, and recognizably its own. But the interaction layer underneath is demo-thin: the single most consequential act (dispatching a digitally-signed letter to the District Magistrate) is a single unconfirmed click, the keyboard layer is broken, and several UI promises ("editable", "click to filter", "12 sources cited") are not kept. For a product whose constitution is "every claim traceable", unverifiable UI claims are self-harm. Biggest opportunity: make the interaction layer as evidentiary as the pixels.

## What's Working

1. **The evidence layer is real UI, not a slogan** — source-count chips, cross-reference prose naming DUSIB/IMD/CPWD, citation links, and highlighted cited figures inside the drafted letter.
2. **Typography discipline** — tabular numerals everywhere, ₹3.42 Cr / 1,842 Indian formatting, mono reserved for file refs, Devanagari at correct vertical rhythm.
3. **Foundations most prototypes skip** — global `:focus-visible` rings, `prefers-reduced-motion` floor, meaning-locked green across every completed-action surface.

## Priority Issues

1. **[P1] One-click dispatch of a signed government letter** (`ActionComposer.tsx:191`) — no confirmation, no undo, no success acknowledgment; peak-end inverted at the highest-stakes moment. Fix: confirm step echoing recipient + ref no., then a dispatch-confirmation moment. → /impeccable harden
2. **[P1] Keyboard interaction layer broken** — Esc closes neither popover nor modal; no focus trap (focus escapes behind the modal); radial hub is mouse-only SVG; queue cards are semanticless `cursor-pointer` divs. → /impeccable harden
3. **[P1] Promise-breaking copy** — "AI-drafted, editable" is a static div; "12 sources cited" inert; "click to filter" has no click handler; "View all 47", "Open full feed", 3 of 5 nav items are `#`. → /impeccable clarify (+ wiring)
4. **[P2] Desktop-only** — zero responsive variants; fixed `grid-cols-[340px_1fr_340px]`; horizontal overflow below ~810px. → /impeccable adapt
5. **[P2] Contrast below the product's own AA floor** — `faint` #A69C86 on white ≈2.7:1 (timestamps, hub counts, footer); `muted` #7E8590 ≈3.7:1 at 12.5px (ward labels). PRODUCT.md pledges ≥4.5:1. → /impeccable polish

## Persona Red Flags

**Alex (power user):** unskippable click-blocking 3.3s splash on every load; no Esc anywhere; no shortcuts; bulk path ends at five items because "View all 47" is dead.

**Sam (accessibility):** signature radial hub invisible to keyboard/screen readers (data behind `onMouseEnter` on SVG); modal without `aria-modal`/trap/Esc; Hindi content without `lang="hi"`; map markers hover-only.

**Priya (Hindi-first coordinator, from PRODUCT.md):** no language toggle exists; `?lang=hi` does nothing; `i18n.ts` is imported by nothing; Hindi appears only as citizen content — "Hindi UI is first-class" is currently zero-class.

## Minor Observations

- Full cards read #01, #03, #02 under "Ranked by AI" — rank order not monotonic.
- Legend dots (urgency) and filter-popover dots (category) are visually identical, adjacent vocabularies.
- Feed's red pulsing "Live" dot vs header's green sync dot — Meaning-Locked Colour violation both ways.
- Annexure checkboxes are real inputs that affect nothing.
- Dead parchment canyon between the ragged three-column bottoms and "This week's priorities".
- Fabricated feed ref `…W44-0{id}` will collide with the composer's real ref format at ids >1 digit.
- Map is a dead end — markers don't click through to clusters.
- The splash overlay blocks clicks for its full JS timer even under reduced motion (`WelcomeSplash.tsx:14`).

## Questions to Consider

1. If every AI claim must be traceable, why is "12 sources cited" the only element in the composer that can't be opened — and what does the MP do when a highlighted figure looks wrong, given the letter can't actually be edited?
2. Who is the splash for? Would a senior aide ever make the Minister wait 3 seconds to open the file?
3. Is this one product or five? Three of five nav destinations are dead — does the next sprint serve the MP's 5-minute triage or the staff's all-day workflow?
