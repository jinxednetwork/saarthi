/**
 * MPLADS compliance rules (§8.4). The engine in `worker/src/compliance` consumes
 * these; the authoritative permitted-works catalogue also lives in
 * `data/mplads/permitted-works.json` and BigQuery `mplads_permitted_works`.
 */

/** Broad permitted sectors (§8.4). */
export const MPLADS_PERMITTED_SECTORS = [
  "drinking_water",
  "education",
  "electricity",
  "non_conventional_energy",
  "healthcare_sanitation",
  "irrigation",
  "roads_pathways_bridges",
  "sports",
  "agriculture",
  "self_help_groups",
  "urban_development",
] as const;
export type MpladsSector = (typeof MPLADS_PERMITTED_SECTORS)[number];

/** Explicitly prohibited items — recommendations touching these are blocked (§8.4). */
export const MPLADS_PROHIBITED = [
  "office_buildings",
  "land_acquisition",
  "individual_benefit_assets",
  "religious_structures",
  "personal_name_assets",
] as const;
export type MpladsProhibited = (typeof MPLADS_PROHIBITED)[number];

/** Mandatory allocation floors (§8.4). Funds are non-lapsable (carry forward). */
export const MPLADS_RULES = {
  /** SC allocation ≥ 15% of annual allocation. */
  scMinShare: 0.15,
  /** ST allocation ≥ 7.5% of annual allocation. */
  stMinShare: 0.075,
  /** Default annual allocation: ₹5 Cr. */
  defaultAnnualAllocation: 50_000_000,
  nonLapsable: true,
} as const;

/** Result of an eligibility check for a proposed work (§8.4). */
export interface MpladsEligibilityResult {
  eligible: boolean;
  sector?: MpladsSector;
  prohibited_reason?: MpladsProhibited;
  compliance_notes: string[];
}
