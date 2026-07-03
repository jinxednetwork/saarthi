import { DEFAULT_RANK_WEIGHTS, SUBMISSION_SOURCES } from "@saarthi/shared";
import type { Cluster, RankComponents, RankWeights } from "@saarthi/shared";

const URGENCY_SCORE = { low: 0.25, medium: 0.5, high: 0.75, critical: 1 } as const;

/**
 * Compute the 0–1 ranking components for a cluster (§8.3). Weights are applied
 * separately so components stay transparent (stored on the cluster).
 */
export function computeRankComponents(cluster: Cluster): RankComponents {
  // demand_signal: log-scaled count × source diversity bonus.
  const activeSources = SUBMISSION_SOURCES.filter(
    (s) => (cluster.source_breakdown[s] ?? 0) > 0,
  ).length;
  const diversityBonus = 1 + (activeSources - 1) * 0.1;
  const demand = Math.min(
    1,
    (Math.log10(cluster.submission_count + 1) / 2) * diversityBonus,
  );

  // public_data_severity: proxy from cross-reference presence.
  const severity = cluster.cross_reference.length > 0 ? 0.8 : 0.3;

  // trend: normalise percent change into 0–1 (100%+ ⇒ 1).
  const trend = Math.max(0, Math.min(1, cluster.trend.percent_change / 100));

  const action = cluster.suggested_action;
  const mplads = action.mplads_eligible ? 1 : 0.3;
  const leverage = action.compliance_notes.some((n) => /close (SC|ST) gap/i.test(n))
    ? 0.9
    : 0.4;

  return {
    demand_signal: demand,
    public_data_severity: severity,
    urgency: URGENCY_SCORE[cluster.urgency],
    mplads_eligibility: mplads,
    compliance_leverage: leverage,
    trend,
  };
}

/** Weighted dot-product of components → 0–100 rank score (§8.3). */
export function scoreCluster(
  components: RankComponents,
  weights: RankWeights = DEFAULT_RANK_WEIGHTS,
): number {
  let score = 0;
  for (const key of Object.keys(weights) as (keyof RankComponents)[]) {
    score += components[key] * weights[key];
  }
  return Math.round(score * 100);
}
