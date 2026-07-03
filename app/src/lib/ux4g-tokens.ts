/**
 * Saarthi design tokens — extracted from the design session handoff
 * (`Awaaz Design Session Handoff/Dashboard.dc.html`, Saarthi v0.4).
 *
 * Warm parchment canvas, navy primary, saffron accent. UX4G-derived.
 * `tailwind.config.ts` consumes these; keep this file the single source of truth
 * for colour values (per ENGINEERING_HANDOFF.md §18 the design side owns the
 * visual spec — update here when the design session revs).
 */
export const ux4gTokens = {
  colors: {
    // Surfaces
    canvas: "#F1EBDD", //   page background (warm parchment)
    surface: "#FFFFFF", //  cards, header
    chip: "#F6F2EA", //     evidence chips, quiet hovers
    panel: "#FBF8F2", //    form fields, modal footer
    // Text
    ink: "#14192A", //      headings, primary text
    body: "#545869", //     secondary text
    muted: "#7E8590", //    labels, tertiary
    faint: "#A69C86", //    quietest text (warm grey)
    // Borders
    line: "#EDE7D7", //     default border
    lineWarm: "#E6DFD1", // modal/form borders
    lineDark: "#CDC5B4", // hover borders
    lineFaint: "#F1EBDD", //row separators inside cards
    // Brand
    primary: {
      DEFAULT: "#12325B", // navy — buttons, active nav, MPLADS pill
      hover: "#0B2447",
      link: "#054A91", //    links, portal blue, Coordination pill
    },
    accent: "#C15A15", //    saffron — brand bar, ombre
    success: "#1D6B3B", //   dispatched/in-progress, Central pill
    // Urgency (marker fills; label text uses same except medium/low)
    urgency: {
      critical: "#A3311F",
      high: "#B77321",
      medium: "#B39B32",
      mediumText: "#8A7515",
      low: "#4A6A87",
      lowText: "#7E8590",
    },
    // Action pathway pills (border-only, §8.5 pathways)
    pathway: {
      MPLADS: "#12325B",
      STATE: "#8A5219",
      CENTRAL: "#1D6B3B",
      COORDINATION: "#054A91",
    },
    // Intake channel dots (radial hub)
    source: {
      whatsapp: "#25D366",
      twitter: "#14192A",
      reddit: "#FF4500",
      widget: "#054A91", //  "Portal" in the design
      portal: "#054A91",
      news: "#8A5219",
      document: "#7E8590",
    },
    // Category dots
    category: {
      infrastructure: "#4A6A87",
      water: "#054A91",
      health: "#8A5219",
      air_quality: "#8A5219", // grouped under Public Health in v1 UI
      other: "#7E8590",
    },
    // Letter-body citation highlight
    highlight: "#FFF3CE",
  },
  radii: {
    sm: "0.25rem", //  4px — form fields, chips
    md: "0.375rem", // 6px — legends
    lg: "0.5rem", //   8px — cards, modals
    xl: "0.75rem", //  12px — full priority cards
    pill: "999px",
  },
  font: {
    sans: "var(--font-sans, 'Noto Sans', system-ui, sans-serif)",
    devanagari:
      "var(--font-devanagari, 'Noto Sans Devanagari', 'Noto Sans', sans-serif)",
    mono: "var(--font-mono, 'IBM Plex Mono', ui-monospace, Menlo, monospace)",
  },
} as const;

export type Ux4gTokens = typeof ux4gTokens;
