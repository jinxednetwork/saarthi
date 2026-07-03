/**
 * BigQuery row shapes for public-dataset joins + analytics (§6.2, §11.1).
 * Dataset ids come from env: BIGQUERY_PUBLIC_DATASET, BIGQUERY_DATASET.
 */

export const BQ_TABLES = {
  census2011Wards: "census_2011_wards",
  cpcbAirQuality: "cpcb_air_quality",
  dusibWaterInfrastructure: "dusib_water_infrastructure",
  mpladsUtilization: "mplads_utilization",
  mpladsPermittedWorks: "mplads_permitted_works",
  clusterHistory: "cluster_history",
} as const;

/** `census_2011_wards` — household access + facility metrics per ward. */
export interface Census2011WardRow {
  ward_id: string;
  ward_name: string;
  constituency: string;
  total_households: number;
  households_with_tap_water: number;
  households_with_toilet: number;
  literacy_rate: number;
  sc_population_pct: number;
  st_population_pct: number;
}

/** `cpcb_air_quality` — CPCB monitoring station readings. */
export interface CpcbAirQualityRow {
  station_id: string;
  station_name: string;
  constituency: string;
  reading_date: string; // ISO date
  aqi: number;
  pm25: number;
  pm10: number;
  dominant_pollutant: string;
}

/** `dusib_water_infrastructure` — planned/existing water works by ward. */
export interface DusibWaterInfrastructureRow {
  ward_id: string;
  ward_name: string;
  scheme_name: string;
  status: "planned" | "in_progress" | "completed" | "none";
  coverage_pct: number;
  last_updated: string; // ISO date
}

/** `mplads_utilization` — spend ledger per constituency + fiscal year. */
export interface MpladsUtilizationRow {
  constituency: string;
  fiscal_year: string;
  allocation: number;
  utilized: number;
  sc_allocation: number;
  st_allocation: number;
  works_sanctioned: number;
  works_completed: number;
}

/** `mplads_permitted_works` — the official permitted-works catalogue (§8.4). */
export interface MpladsPermittedWorkRow {
  sector: string;
  work_type: string;
  permitted: boolean;
  notes?: string;
}

/** `cluster_history` — analytics snapshots for trend + spike detection. */
export interface ClusterHistoryRow {
  cluster_id: string;
  constituency: string;
  snapshot_date: string; // ISO date
  submission_count: number;
  rank_score: number;
  status: string;
}
