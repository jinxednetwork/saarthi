import type {
  ActionPathway,
  BoundingBox,
  Category,
  LatLng,
  SubmissionSource,
  Timestamp,
  Urgency,
} from "./common";

export interface ClusterGeo {
  constituency: string;
  ward: string;
  locality?: string;
  centroid: LatLng;
  bounding_box: BoundingBox;
}

/** Per-source submission counts within a cluster. */
export type SourceBreakdown = Record<SubmissionSource, number>;

export interface ClusterTrend {
  current_week: number;
  previous_week: number;
  percent_change: number;
}

/** A join against a public government dataset (§8.2). */
export interface CrossReference {
  /** e.g. "Census-2011" | "NFHS-5" | "CPCB" | "DUSIB" */
  dataset: string;
  metric: string;
  value: string;
  citation_url: string;
}

/** The recommended action for a cluster, produced by the action-tagger (§8.5). */
export interface SuggestedAction {
  type: ActionPathway;
  title: string;
  /** Draft letter/output body. */
  body: string;
  mplads_eligible: boolean;
  mplads_sector?: string;
  estimated_cost_lakhs?: number;
  compliance_notes: string[];
}

export const CLUSTER_STATUSES = [
  "new",
  "reviewed",
  "action_taken",
  "resolved",
  "snoozed",
] as const;
export type ClusterStatus = (typeof CLUSTER_STATUSES)[number];

/**
 * `clusters/{cluster_id}` — a semantically grouped issue across sources/geo/time.
 * ENGINEERING_HANDOFF.md §6.1.
 */
export interface Cluster {
  id: string;
  title: string;
  title_hi: string;
  category: Category;
  subcategory: string;
  geo: ClusterGeo;
  urgency: Urgency;
  submission_ids: string[];
  submission_count: number;
  source_breakdown: SourceBreakdown;
  trend: ClusterTrend;
  cross_reference: CrossReference[];
  suggested_action: SuggestedAction;
  /** 0–100 composite rank (§8.3). Component scores live in `rank_components`. */
  rank_score: number;
  /** Transparency: the weighted components behind `rank_score` (§8.3). */
  rank_components?: RankComponents;
  status: ClusterStatus;
  /** Running mean of member embeddings — for cluster matching + RAG retrieval. */
  centroid_embedding: number[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

/** Stored per cluster for ranking transparency (§8.3). Each 0–1 before weighting. */
export interface RankComponents {
  demand_signal: number;
  public_data_severity: number;
  urgency: number;
  mplads_eligibility: number;
  compliance_leverage: number;
  trend: number;
}

export const CLUSTERS_COLLECTION = "clusters" as const;
