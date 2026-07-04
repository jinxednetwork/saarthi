"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Bridge between the HSL-var token system and recharts (which needs literal
 * colour strings). SSR-safe: returns null until mounted; re-resolves on theme
 * flip so charts retheme live. Values originate from the CSS vars — the No-Hex
 * rule holds.
 */
const TOKENS = [
  "primary-brand",
  "link",
  "saffron",
  "success",
  "urgency-critical",
  "urgency-high",
  "urgency-medium",
  "urgency-low",
  "muted-fg",
  "faint",
  "line",
  "ink",
  "chip",
  "surface",
  "pathway-mplads",
  "pathway-state",
  "pathway-central",
  "pathway-coordination",
] as const;

export type ChartColors = Record<(typeof TOKENS)[number], string>;

export function useChartColors(): ChartColors | null {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ChartColors | null>(null);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const next = {} as ChartColors;
    for (const t of TOKENS) {
      next[t] = `hsl(${style.getPropertyValue(`--${t}`).trim()})`;
    }
    setColors(next);
  }, [resolvedTheme]);

  return colors;
}
