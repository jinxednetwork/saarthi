/**
 * UX4G Design System 2.0 — design tokens (PLACEHOLDER).
 *
 * Per ENGINEERING_HANDOFF.md §18: if the design session hasn't produced
 * `design-tokens.json` yet, ship with a placeholder token file and don't block
 * engineering. Replace these values when the real tokens land, then re-derive
 * `tailwind.config.ts` from here. Colours below are indicative gov-style values,
 * NOT the official UX4G palette.
 */
export const ux4gTokens = {
  colors: {
    // Primary — government blue
    primary: {
      50: "#eef4fb",
      100: "#d6e4f5",
      500: "#1f5eae",
      600: "#194b8c",
      700: "#123869",
    },
    // Accent — saffron
    accent: {
      500: "#f2820d",
      600: "#c96a09",
    },
    // Semantic
    success: "#1a7d4b",
    warning: "#c98a00",
    danger: "#c62828",
    // Urgency scale (maps to Urgency union in @saarthi/shared)
    urgency: {
      low: "#5a7d9a",
      medium: "#c98a00",
      high: "#e0651a",
      critical: "#c62828",
    },
    // Neutrals
    ink: "#1a1d21",
    muted: "#5b6570",
    line: "#e2e6ea",
    surface: "#ffffff",
    canvas: "#f5f7fa",
  },
  radii: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  spacing: {
    // Devanagari needs ~15% more vertical space (§10) — bump line-height in type scale.
    lineHeightDevanagari: 1.7,
  },
  font: {
    sans: "var(--font-sans, system-ui, sans-serif)",
    devanagari: "var(--font-devanagari, 'Noto Sans Devanagari', system-ui, sans-serif)",
  },
} as const;

export type Ux4gTokens = typeof ux4gTokens;
