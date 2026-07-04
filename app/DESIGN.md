---
name: Saarthi
description: Executive intelligence for India's MPs — a glass command deck over the constituency map.
colors:
  canvas-light: "#F4F2ED"
  canvas-dark: "#0B1120"
  surface-light: "#FFFFFF"
  surface-dark: "#131C30"
  chip-light: "#F6F2EA"
  chip-dark: "#1B2740"
  ink-light: "#14192A"
  ink-dark: "#EAEEF6"
  body-light: "#4A5060"
  body-dark: "#AAB4C6"
  faint-light: "#6B665B"
  faint-dark: "#8B93A5"
  line-light: "#E4E0D5"
  line-dark: "#243250"
  secretariat-navy: "#12325B"
  navy-on-dark: "#7FA6E0"
  despatch-blue: "#054A91"
  seal-saffron: "#C15A15"
  saffron-on-dark: "#E07A33"
  sanction-green: "#1D6B3B"
  green-on-dark: "#3F9D68"
  urgency-critical: "#A3311F"
  urgency-critical-dark: "#E26A54"
  urgency-high: "#B77321"
  urgency-high-dark: "#E0A24E"
  urgency-medium: "#B39B32"
  urgency-medium-dark: "#D6C05A"
  urgency-low: "#4A6A87"
  urgency-low-dark: "#84A8CB"
typography:
  display:
    fontFamily: "Noto Sans, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Noto Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Noto Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Noto Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.35
  devanagari:
    fontFamily: "Noto Sans Devanagari, Noto Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "20px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.secretariat-navy}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  panel-glass:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip-evidence:
    backgroundColor: "{colors.chip-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
---

# Design System: Saarthi

## 1. Overview

**Creative North Star: "The Command Deck"**

The Morning File grew a windshield. Saarthi is now a glass command deck floating
over the living constituency map: the map IS the page, and every instrument —
KPIs, the priority queue, the signal feed, the sources hub — is a frosted panel
suspended above it. The civil-service soul survives intact (navy authority,
saffron restraint, tabular Indian numerals, evidence citations everywhere), but
the material changed from paper to glass, as if Apple built an instrument for
the Government of India.

Dual-theme by design: **dark is the command center** (default — CARTO dark
tiles, deep navy-black canvas, brightened status hues) and **light is Apple
Maps daytime** (warm off-white, white glass). One token system, HSL variables,
`.dark` class; components never hardcode a hex.

The system still rejects the generic SaaS admin template, flashy consumer-app
energy, the dated NIC portal, and Bloomberg-terminal density. Glass is not
decoration here: panels float over a map that must remain visible and
draggable between them — the blur earns its place by preserving context.

**Key Characteristics:**
- The map is the page; UI floats as frosted glass panels (`.glass`, `.glass-strong`)
- Meaning-locked colour: navy/blue = action, saffron = brand+forecast, green =
  completed action, four urgency hues = urgency, channel colours = channels
- Numbers privileged: tabular numerals, Indian notation (₹3.42 Cr · 1,842)
- Evidence is UI: media strips, source chips, citations that genuinely resolve
- Bilingual by construction: Devanagari at 1.7 line-height with `lang="hi"`

## 2. Colors: The Secretariat Palette, Dual-Theme

All colours live as HSL channel variables in `globals.css` (`:root` light /
`.dark`); Tailwind maps semantic names to `hsl(var(--x))`. The frontmatter
lists the resolved hex pairs.

### Primary
- **Secretariat Navy** (#12325B light / **#7FA6E0** dark): buttons, active nav,
  MPLADS pathway, links. Interactive blues brighten on dark or they'd drown.
- **Despatch Blue** (#054A91 / #8FB8EC): citation links, Portal channel,
  Coordination pathway.

### Secondary
- **Seal Saffron** (#C15A15 / #E07A33): the brand bar's tallest stroke, the
  Forecast insight accent, one chart line. Still governed by the One Seal Rule.

### Tertiary
- **Sanction Green** (#1D6B3B / #3F9D68): completed action only — dispatch
  states, live dots, confidence meters.
- **Urgency marks**: critical #A3311F/#E26A54 · high #B77321/#E0A24E · medium
  #B39B32/#D6C05A · low #4A6A87/#84A8CB. Dots + labels, never fills.

### Neutral
- **Canvas** (#F4F2ED / #0B1120), **Surface** (#FFF / #131C30) — glass panels
  are Surface at 72–85% opacity with 16px backdrop blur.
- **Ink** (#14192A / #EAEEF6), **Body** (#4A5060 / #AAB4C6), **Muted-fg**
  (#5C6270 / #96A0B4), **Faint** (#6B665B / #8B93A5) — every step ≥4.5:1 on its
  surfaces in both themes (the old #A69C86 failed AA; it is gone).
- **Line** (#E4E0D5 / #243250) at 60% opacity on glass edges.

### Named Rules
**The One Seal Rule.** Saffron touches at most a few percent of any screen.

**The Meaning-Locked Colour Rule.** Every non-neutral colour has exactly one
job. Channel brand colours (WhatsApp green, Reddit orange…) belong to channels
alone.

**The No-Hex Rule.** Components reference `hsl(var(--token))` or Tailwind
semantic classes — a hardcoded hex in a component is a bug, because it cannot
retheme.

## 3. Typography

**One family, two scripts, one stamp:** Noto Sans (400–700) carries everything;
Noto Sans Devanagari renders Hindi as a first-class script (1.7 line-height,
`lang="hi"`); IBM Plex Mono appears only where a clerk would use a rubber stamp
— reference numbers (`MP-NDL-MPLADS-2026-W44-001`) and rank indices.

### Hierarchy
- **Display** (600, 20–22px, tabular): KPI numerals and the hub centre — the
  glass panels are compact, so display sizes tightened from the paper era.
- **Headline** (600, 18–22px, -0.015em): page titles, insight statements.
- **Title** (500–600, 13.5–15px): panel headers, card titles.
- **Body** (400, 12.5–13px, lh 1.55–1.65): evidence prose. Cap 65–75ch.
- **Label** (500, 10.5–11.5px): metadata, chips. Uppercase + tracking reserved
  for section eyebrows inside drawers/forms — never on every section.

### Named Rules
**The Tabular Rule.** Every number that could sit above another number is
tabular and Indian-formatted: ₹1,00,000 · ₹3.42 Cr · 1,842.

## 4. Elevation

Two materials, two jobs. **Glass** (backdrop blur + translucent Surface +
hairline Line/60 border) is for panels floating over the map and chrome
(sidebar, top strip, toolbar). **Shadow** exists only for true overlays: the
drawer/dialog layer (Radix defaults) and toasts. Resting content inside a
panel still separates by hairline and tint, never by shadow.

### Glass Vocabulary
- **`.glass`** (`surface/0.72 + blur(16px) saturate(1.4) + line/0.6 border`):
  chrome and small tiles.
- **`.glass-strong`** (`surface/0.85`, same blur): text-dense panels (queue,
  feed) where legibility outranks transparency.

### Named Rules
**The Five-Blur Rule.** At most ~5 blurred surfaces per view, blur ≤16px,
never nested — glass over a panning map is a GPU bill you pay in frames.

**The z-Ladder.** map 0 → panels 10 → topbar 30 → sidebar 40 → sheet/dialog 50
→ toast → splash 100. The map stage wrapper is `isolate` so Leaflet's internal
z-1000 panes never escape.

## 5. Components

shadcn/ui (new-york) primitives skinned by the token system; Radix supplies
focus traps, Esc, and aria. Custom pieces stay quiet and precise.

### Buttons
- **Primary:** navy pill (999px), white text, 13px/500. `Button` component.
- **Outline / Ghost:** hairline pill; glass variants add `.glass` for chrome.
- **Focus:** global 2px ring (`--ring`), 2px offset.

### Panels (the signature container)
- Glass tiles, 12px radius, internal `border-line/50` row separators,
  panel headers at 13px/600 with a right-aligned quiet count.

### Chips
- **Evidence chips:** Chip-tint fill, 6px radius, icon + tabular count + label.
- **Pathway pills:** border-only, pathway colour at 35% alpha border.
- **Urgency marks:** 5–6px dot + 11px label; the pill variant only in badges.

### Cluster Drawer (Sheet)
Right-side, 460px: header (category icon, mono id, urgency badge, trend,
bilingual title, ward) → citizen media strip (snap-scroll, video posters carry
a "preview" chip — no false playback claims) → evidence chips → cross-reference
prose with **resolvable** dataset links → suggested action or dispatch progress
→ sticky footer (Draft letter · View on map).

### Action Composer (Dialog) + Dispatch Ceremony
Editable letter textarea (seeded per cluster), citations popover that opens,
annexure checklist. Approve & send → AlertDialog echoing recipient + ref +
"cannot be recalled" → success state (check, mono ref, Done/Track) + toast.
The highest-stakes act in the product earns a two-step and a receipt.

### The Radial Hub Tile (signature, miniaturised)
The five-channel radial, shrunk from hero to instrument (~240px tile). Spokes
are real buttons (keyboard focusable, `aria-pressed`) that filter the live
feed; the hub centre previews the hovered/active channel. Its "click to
filter" caption is true.

### Media Cards (/live collage)
CSS-columns masonry; media at natural aspect (16/9 · 4/3 · 3/4 · 1/1) →
source badge + relative time → snippet (`lang="hi"` where Hindi) → cluster
link that opens the dashboard drawer. Offline, media degrades to
category-tinted tiles with an honest "media unavailable offline" note.

## 6. Do's and Don'ts

### Do:
- **Do** keep the map visible and draggable between panels — the overlay grid
  is `pointer-events-none`; every panel opts back in.
- **Do** make every citation resolve (dataset links go to the real department
  portals; unresolvable sources render as plain text, not fake links).
- **Do** use tabular numerals and Indian formatting everywhere.
- **Do** give Devanagari `lang="hi"` and 1.7 line-height.
- **Do** respect `prefers-reduced-motion`: splash skipped, chart pre-drawn,
  transitions collapsed.
- **Do** label unbuilt destinations honestly ("Soon", "· soon") — never a dead
  `href="#"`.

### Don't:
- **Don't** build the generic SaaS admin template, flashy consumer-app energy,
  the dated NIC-style portal, or Bloomberg-terminal density (PRODUCT.md
  anti-references, all four still binding).
- **Don't** hardcode a hex in a component (The No-Hex Rule) — it cannot retheme.
- **Don't** exceed ~5 blurred surfaces or nest backdrop blurs.
- **Don't** use colored side-stripes >1px, gradient text, or glass as
  decoration on surfaces that don't float over the map.
- **Don't** dispatch anything government-official in one click — the
  AlertDialog ceremony is load-bearing UX, not friction.
- **Don't** run `next build` while the dev server shares `.next` (corrupts the
  chunk map; stop dev first).
