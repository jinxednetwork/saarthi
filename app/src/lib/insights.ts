import type { Category } from "@saarthi/shared";
import { CATEGORY_GROUPS, type CategoryGroup, groupOf } from "./categories";
import { MOCK_CLUSTERS, MOCK_CONSTITUENCY, type DemoCluster } from "./mock-data";

/**
 * Shared analytics derivations — consumed by the Intelligence bento tiles AND
 * the assistant brain, so every number the assistant speaks matches what the
 * charts show (single source: MOCK_CLUSTERS / MOCK_CONSTITUENCY).
 */

export interface CategorySlice {
  group: CategoryGroup;
  label: string;
  color: string;
  clusters: number;
  signals: number;
}

export function signalsByCategory(): CategorySlice[] {
  return (Object.entries(CATEGORY_GROUPS) as [CategoryGroup, (typeof CATEGORY_GROUPS)[CategoryGroup]][]).map(
    ([group, g]) => {
      const clusters = MOCK_CLUSTERS.filter((c) => groupOf(c.category) === group);
      return {
        group,
        label: g.label,
        color: g.color,
        clusters: clusters.length,
        signals: clusters.reduce((s, c) => s + c.submission_count, 0),
      };
    },
  );
}

export interface WardHotspot {
  wardId: string;
  name: string;
  scMajority: boolean;
  signals: number;
  worstUrgency: DemoCluster["urgency"];
  clusterCount: number;
}

const URGENCY_ORDER = { critical: 3, high: 2, medium: 1, low: 0 } as const;

export function wardHotspots(limit = 6): WardHotspot[] {
  const byWard = new Map<string, WardHotspot>();
  for (const c of MOCK_CLUSTERS) {
    const ward = MOCK_CONSTITUENCY.wards.find((w) => w.id === c.geo.ward);
    if (!ward) continue;
    const cur = byWard.get(ward.id);
    if (cur) {
      cur.signals += c.submission_count;
      cur.clusterCount += 1;
      if (URGENCY_ORDER[c.urgency] > URGENCY_ORDER[cur.worstUrgency]) {
        cur.worstUrgency = c.urgency;
      }
    } else {
      byWard.set(ward.id, {
        wardId: ward.id,
        name: ward.name,
        scMajority: ward.sc_majority,
        signals: c.submission_count,
        worstUrgency: c.urgency,
        clusterCount: 1,
      });
    }
  }
  return [...byWard.values()].sort((a, b) => b.signals - a.signals).slice(0, limit);
}

/** Clusters sorted by week-on-week movement (the "what changed" answer). */
export function weekMovers(limit = 3): DemoCluster[] {
  return [...MOCK_CLUSTERS]
    .sort((a, b) => b.trend.percent_change - a.trend.percent_change)
    .slice(0, limit);
}

export function newThisWeek(): DemoCluster[] {
  return MOCK_CLUSTERS.filter((c) => c.trend.previous_week === 0);
}

/**
 * 4-week × 7-day signal pulse for the heat strip. Static demo values shaped to
 * read plausibly against DASHBOARD_META.signalsThisWeek (last row sums ≈ the
 * weekly total's daily scale).
 */
export const WEEKLY_PULSE: { week: string; counts: [number, number, number, number, number, number, number] }[] = [
  { week: "Wk 41", counts: [96, 104, 88, 112, 140, 71, 58] },
  { week: "Wk 42", counts: [118, 96, 122, 134, 151, 84, 66] },
  { week: "Wk 43", counts: [141, 128, 156, 149, 188, 102, 79] },
  { week: "Wk 44", counts: [214, 232, 246, 288, 342, 296, 224] },
];

export const PULSE_MAX = Math.max(...WEEKLY_PULSE.flatMap((w) => w.counts));
