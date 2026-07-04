import type { ActionPathway, Urgency } from "@saarthi/shared";

/**
 * Theme-aware colour strings for inline styles. Values are hsl(var()) refs so
 * marks retheme instantly with the .dark class — never hardcode hex here.
 * `dim` is the 27%-alpha variant used for pathway pill borders.
 */
const u = (name: string) => `hsl(var(--${name}))`;
const uDim = (name: string, alpha: number) => `hsl(var(--${name}) / ${alpha})`;

/** Urgency → marker fill + label text + pill border colours. */
export const URGENCY_UI: Record<
  Urgency,
  { dot: string; text: string; border: string; label: string }
> = {
  critical: {
    dot: u("urgency-critical"),
    text: u("urgency-critical"),
    border: uDim("urgency-critical", 0.35),
    label: "Critical",
  },
  high: {
    dot: u("urgency-high"),
    text: u("urgency-high"),
    border: uDim("urgency-high", 0.35),
    label: "High",
  },
  medium: {
    dot: u("urgency-medium"),
    text: u("urgency-medium-text"),
    border: uDim("urgency-medium", 0.35),
    label: "Medium",
  },
  low: {
    dot: u("urgency-low"),
    text: u("urgency-low-text"),
    border: uDim("urgency-low", 0.35),
    label: "Low",
  },
};

/** Pathway → pill colour + sentence-case label. */
export const PATHWAY_UI: Record<
  ActionPathway,
  { color: string; border: string; label: string }
> = {
  MPLADS: { color: u("pathway-mplads"), border: uDim("pathway-mplads", 0.35), label: "MPLADS" },
  STATE: { color: u("pathway-state"), border: uDim("pathway-state", 0.35), label: "State" },
  CENTRAL: { color: u("pathway-central"), border: uDim("pathway-central", 0.35), label: "Central" },
  COORDINATION: {
    color: u("pathway-coordination"),
    border: uDim("pathway-coordination", 0.35),
    label: "Coordination",
  },
};

/** "↑ 340%" / "new" trend text from a cluster's trend block. */
export function trendLabel(trend: { previous_week: number; percent_change: number }): string {
  if (trend.previous_week === 0) return "new";
  return `↑ ${Math.round(trend.percent_change)}%`;
}

/** ₹3.42 / ₹5.0 style crore formatting (trailing zero trimmed to one decimal). */
export function formatCr(rupees: number): string {
  const cr = (rupees / 10_000_000).toFixed(2).replace(/0$/, "");
  return `₹${cr}`;
}

/** Relative time for feed items. */
export function minutesAgo(min: number): string {
  if (min <= 0) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return h === 1 ? "1 hr ago" : `${h} hrs ago`;
}
