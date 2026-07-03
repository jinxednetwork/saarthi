import type { RankComponents } from "./cluster";

/**
 * Ranking weights (§8.3). Weights are CONFIG, not hardcoded logic — every cluster
 * stores its component scores (`RankComponents`) for transparency. Keys mirror
 * `RankComponents` so a weighted dot-product yields `rank_score` (scaled 0–100).
 */
export type RankWeights = {
  [K in keyof RankComponents]: number;
};

/** Starting-point weights from §8.3. Tune with real data; must sum to 1. */
export const DEFAULT_RANK_WEIGHTS: RankWeights = {
  demand_signal: 0.35,
  public_data_severity: 0.25,
  urgency: 0.15,
  mplads_eligibility: 0.1,
  compliance_leverage: 0.1,
  trend: 0.05,
};

/**
 * Cluster-assignment thresholds (§8.1). A submission joins an existing cluster only
 * if ALL three hold; otherwise a new cluster is created.
 */
export const CLUSTER_THRESHOLDS = {
  /** cosine similarity strictly greater than this */
  minCosineSimilarity: 0.82,
  /** geographic proximity, kilometres */
  maxDistanceKm: 2,
  /** temporal window, days */
  maxWindowDays: 14,
} as const;

/** Embedding dimensionality for Vertex text-embedding-004. */
export const EMBEDDING_DIM = 768;
