import type { ActionPathway, Urgency } from "@saarthi/shared";

/** Urgency → marker fill + label text colors (design `_urgencyStyles`). */
export const URGENCY_UI: Record<Urgency, { dot: string; text: string; label: string }> = {
  critical: { dot: "#A3311F", text: "#A3311F", label: "Critical" },
  high: { dot: "#B77321", text: "#B77321", label: "High" },
  medium: { dot: "#B39B32", text: "#8A7515", label: "Medium" },
  low: { dot: "#4A6A87", text: "#7E8590", label: "Low" },
};

/** Pathway → pill color + sentence-case label (design `_actionPillStyle`). */
export const PATHWAY_UI: Record<ActionPathway, { color: string; label: string }> = {
  MPLADS: { color: "#12325B", label: "MPLADS" },
  STATE: { color: "#8A5219", label: "State" },
  CENTRAL: { color: "#1D6B3B", label: "Central" },
  COORDINATION: { color: "#054A91", label: "Coordination" },
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
