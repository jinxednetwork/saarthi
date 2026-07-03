---
name: Saarthi
description: Executive intelligence for India's MPs — the morning file, prepared.
colors:
  secretariat-navy: "#12325B"
  navy-pressed: "#0B2447"
  despatch-blue: "#054A91"
  seal-saffron: "#C15A15"
  file-parchment: "#F1EBDD"
  white-sheet: "#FFFFFF"
  folder-cream: "#F6F2EA"
  form-cream: "#FBF8F2"
  ledger-ink: "#14192A"
  clerk-grey: "#545869"
  margin-grey: "#7E8590"
  pencil-khaki: "#A69C86"
  rule-line: "#EDE7D7"
  rule-warm: "#E6DFD1"
  rule-dark: "#CDC5B4"
  sanction-green: "#1D6B3B"
  urgency-critical: "#A3311F"
  urgency-high: "#B77321"
  urgency-medium: "#B39B32"
  urgency-medium-text: "#8A7515"
  urgency-low: "#4A6A87"
  citation-highlight: "#FFF3CE"
typography:
  display:
    fontFamily: "Noto Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Noto Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Noto Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Noto Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Noto Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.35
  devanagari:
    fontFamily: "Noto Sans Devanagari, Noto Sans, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.7
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "22px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.secretariat-navy}"
    textColor: "{colors.white-sheet}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.navy-pressed}"
    textColor: "{colors.white-sheet}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.secretariat-navy}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.white-sheet}"
    rounded: "{rounded.lg}"
    padding: "18px 20px"
  card-featured:
    backgroundColor: "{colors.white-sheet}"
    rounded: "{rounded.xl}"
    padding: "28px 32px"
  chip-evidence:
    backgroundColor: "{colors.folder-cream}"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.sm}"
    padding: "4px 9px"
  input-field:
    backgroundColor: "{colors.form-cream}"
    textColor: "{colors.ledger-ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
---

# Design System: Saarthi

## 1. Overview

**Creative North Star: "The Morning File"**

Saarthi is the dispatch file a trusted senior aide prepares before the MP's
day begins: parchment stock, navy ink, a single saffron seal, everything cited
and already in priority order. The interface is a civil-service instrument —
sober, evidentiary, assured — not a startup dashboard. Warmth comes from the
paper (File Parchment canvas, cream folders and forms), authority from the ink
(Secretariat Navy on Ledger Ink text), and life from precise, small colour
marks: urgency dots, pathway pills, one pulsing "live" point.

The system explicitly rejects the generic SaaS admin template, the flashy
consumer app, the dated NIC-style government portal, and Bloomberg-terminal
density. Its job is triage: the top five issues legible in five minutes by a
non-technical reader, every claim traceable to its evidence.

**Key Characteristics:**
- Warm paper surfaces carrying cool, authoritative ink
- Numbers typographically privileged: tabular numerals, Indian notation (₹1,00,000)
- Colour as annotation, never decoration — every hue has a fixed meaning
- Hairline borders and tinted fills instead of shadows; flat at rest
- Bilingual by construction: Devanagari set with its own vertical rhythm

## 2. Colors: The Secretariat Palette

Warm government paper annotated in navy, saffron, and small precise status marks.

### Primary
- **Secretariat Navy** (#12325B): The ink of authority. Primary buttons, active
  navigation, the MPLADS pathway pill, links in running text, KPI progress
  bars. Pressed state darkens to **Navy Pressed** (#0B2447).
- **Despatch Blue** (#054A91): The secondary blue for citation links, the
  Portal channel, the Coordination pathway, and the water category line in
  charts. Never used for buttons.

### Secondary
- **Seal Saffron** (#C15A15): The brand's single flame — the tallest bar in the
  wordmark, the Forecast insight accent, the public-health line in charts, the
  scroll ombre. Governed by The One Seal Rule below.

### Tertiary
- **Sanction Green** (#1D6B3B): Exclusively the colour of completed action —
  dispatched letters, in-progress badges, confidence meters, the live sync dot.
- **Urgency marks**: Critical (#A3311F), High (#B77321), Medium (#B39B32 dot /
  #8A7515 text), Low (#4A6A87 dot / #7E8590 text). Used as 5–8px dots with a
  small text label; never as fills or banners.
- **Citation Highlight** (#FFF3CE): the soft mark behind AI-cited figures in
  drafted letters — evidence made visible.

### Neutral
- **File Parchment** (#F1EBDD): the page canvas, and row-separator hairlines
  inside white cards.
- **White Sheet** (#FFFFFF): every card, the header, the modal — content sits
  on white sheets laid over parchment.
- **Folder Cream** (#F6F2EA) / **Form Cream** (#FBF8F2): evidence chips, quiet
  hovers, and form fields respectively — one shade deeper than the sheet.
- **Ledger Ink** (#14192A): headings and primary text. **Clerk Grey** (#545869)
  body copy. **Margin Grey** (#7E8590) labels. **Pencil Khaki** (#A69C86) the
  quietest annotations — timestamps, counts, hints.
- **Rule Line** (#EDE7D7) default borders; **Rule Warm** (#E6DFD1) form/modal
  borders; **Rule Dark** (#CDC5B4) hover borders.

### Named Rules
**The One Seal Rule.** Seal Saffron touches at most a few percent of any
screen: the brand bar, one insight accent, one chart line. Its rarity is its
authority. A screen washed in saffron is a broken screen.

**The Meaning-Locked Colour Rule.** Every non-neutral colour has exactly one
job (navy = action/navigation, saffron = brand/forecast, green = completed
action, the four urgency hues = urgency). Never borrow a status colour for
decoration.

## 3. Typography

**Display Font:** Noto Sans (with Segoe UI, system-ui fallback)
**Body Font:** Noto Sans — one family, weights 400–700 carry the hierarchy
**Devanagari Font:** Noto Sans Devanagari (never substituted, never squeezed)
**Mono Font:** IBM Plex Mono — reference numbers, rank indices, file refs

**Character:** A single humanist sans wearing a civil-service uniform: weight
and tabular numerals do the talking, letter-spacing tightens slightly as size
grows. The mono face appears only where a clerk would use a rubber stamp —
reference numbers like `MP-NDL-MPLADS-2026-W44-001`.

### Hierarchy
- **Display** (500, 30–34px, lh 1, -0.025em, tabular): KPI numerals and the
  radial hub centre. The number is the hero; its unit sits beside it at 15px
  Margin Grey.
- **Headline** (600, 22–24px, lh 1.25, -0.015em): section titles ("Attention
  this week") and hero insight statements.
- **Title** (600, 15–19px, -0.01em): card titles, cluster names.
- **Body** (400, 13–14px, lh 1.55–1.65): evidence prose, cross-references.
  Cap at 65–75ch.
- **Label** (500, 11–12.5px): metadata, chips, pills. Uppercase + 0.06–0.08em
  tracking is reserved for eyebrow labels on insight cards and form sections —
  never on every section.
- **Devanagari** (400–600, matching sizes, lh 1.7): ~15% more vertical room
  than Latin. Test every layout with Hindi strings.

### Named Rules
**The Tabular Rule.** Every number that could ever sit above another number is
tabular (`font-variant-numeric: tabular-nums`) and formatted Indian-style:
₹1,00,000, ₹3.42 Cr, 1,842.

## 4. Elevation

Flat by default; depth is drawn, not cast. Surfaces separate by hairline Rule
Line borders and one-step tint changes (Parchment → Sheet → Cream), not by
shadows. Shadows exist only where something truly floats above the page.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 8px 24px rgba(20,25,42,0.08)`): map filter
  popover and other transient panels.
- **Modal** (`box-shadow: 0 24px 64px rgba(11,36,71,0.35)`): the Action
  Composer, over a `rgba(11,36,71,0.55)` navy scrim.
- **Tooltip** (`box-shadow: 0 6px 14px rgba(20,25,42,0.18)`): Ledger Ink map
  tooltips.

### Named Rules
**The Hairline Rule.** If a resting surface needs separation, it gets a 1px
Rule Line border or a one-step tint — never a shadow. Shadows are reserved for
the three floating roles above.

## 5. Components

Quiet precision: hairline borders, pill actions, colour only where it means
something.

### Buttons
- **Shape:** full pill (999px radius).
- **Primary:** Secretariat Navy fill, white text, 500 weight at 12.5–13px,
  padding 9–10px × 16px. Hover → Navy Pressed.
- **Ghost:** transparent with 1px border (navy border for standalone actions,
  Rule Line border darkening to Rule Dark on hover for filters/scope pills).
- **Focus:** 2px Secretariat Navy `:focus-visible` outline, 2px offset.
- Rectangular 4px-radius buttons appear only inside the formal letter composer
  — the one surface that imitates stationery.

### Chips
- **Evidence chips:** Folder Cream fill, 4px radius, `4px 9px` padding; icon at
  12px Margin Grey + tabular count + source label.
- **Pathway pills:** border-only pills — 1px in the pathway's colour at 27%
  alpha (hex +`44`), text in the full colour, sentence case. Navy MPLADS,
  brown State, green Central, blue Coordination.
- **Urgency marks:** 5–6px dot + 11.5px label in the urgency text colour.

### Cards / Containers
- **Corner Style:** 8px standard cards; 12px featured priority/insight cards.
- **Background:** White Sheet on Parchment; internal row separators in
  Parchment (#F1EBDD).
- **Shadow Strategy:** none at rest (Hairline Rule).
- **Border:** 1px Rule Line; dispatched cards swap to a green-tinted border
  (#DBE9DE) with a `#F7F9F5` wash.
- **Internal Padding:** 18–22px; featured cards 28px × 32px.

### Inputs / Fields
- **Style:** Form Cream fill, 1px Rule Warm border, 4px radius, 13px text,
  10px × 12px padding. Section labels: 11px, 600, uppercase, 0.08em, Margin Grey.
- **Focus:** the global 2px navy `:focus-visible` ring.

### Navigation
- 13.5px links: Clerk Grey at rest, Ledger Ink + 500 weight when active, with a
  2px Secretariat Navy underline bar pinned to the header row's bottom edge.
  Header is a White Sheet with a Rule Line bottom border; a quiet sub-strip
  carries the page title (22px, 600) and a live status dot.

### The Radial Signal Hub (signature)
Five intake channels as spokes on a dotted 140px ring around a white hub; each
channel a 6.5px dot in its brand colour (WhatsApp green, X ink, Reddit orange,
Portal blue, News brown) with a 14px halo when live. Hover dims siblings to
32% and swaps the hub centre to that channel's count and trend. The hub centre
is Display-tier tabular type. This is the one theatrical moment on the
dashboard — everything else stays paper-quiet.

## 6. Do's and Don'ts

### Do:
- **Do** cite evidence inline: every stat, rank, and AI recommendation carries
  its source links (Despatch Blue, 11.5px). If it can't be cited, don't show it.
- **Do** use tabular numerals and Indian number formatting everywhere
  (₹1,00,000 · ₹3.42 Cr · 1,842).
- **Do** signal urgency with a 5–6px dot + small text label in the urgency
  colours — quiet, precise, paired with words.
- **Do** give Devanagari its 1.7 line-height and test every layout bilingually.
- **Do** respect `prefers-reduced-motion` with a finished-state fallback for
  every animation, including the chart draw-in and splash.

### Don't:
- **Don't** build the "generic SaaS admin template" — identical stat cards,
  blue-purple gradients, rounded-everything (PRODUCT.md anti-reference #1).
- **Don't** import "flashy consumer app" energy — no gradients-as-decoration,
  mascots, or confetti (anti-reference #2).
- **Don't** regress to the "dated NIC-style gov portal" — dense link walls,
  beveled buttons, no hierarchy (anti-reference #3).
- **Don't** drift into "Bloomberg-terminal density" — Saarthi triages; it never
  shows everything at once (anti-reference #4).
- **Don't** cast shadows on resting surfaces, use colored side-stripe borders
  thicker than 1px, or gradient text — depth is drawn with hairlines and tints.
- **Don't** put an uppercase tracked eyebrow above every section; eyebrows
  belong only to insight cards and form sections.
- **Don't** use saffron, green, or the urgency hues for anything other than
  their locked meanings (The Meaning-Locked Colour Rule).
