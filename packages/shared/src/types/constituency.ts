/**
 * `constituencies/{constituency_id}` — the tenant boundary + MPLADS ledger.
 * ENGINEERING_HANDOFF.md §6.1.
 */
export interface ConstituencyWard {
  id: string;
  name: string;
  sc_majority: boolean;
  st_majority: boolean;
}

export interface ConstituencyMp {
  name: string;
  handle_x?: string;
  email?: string;
}

/** MPLADS annual ledger for the constituency (§8.4). Amounts in rupees. */
export interface MpladsLedger {
  /** Annual allocation, e.g. 50000000 (₹5 Cr). */
  allocation_annual: number;
  utilization_ytd: number;
  /** SC allocation share YTD (target ≥15%). */
  sc_percent_ytd: number;
  /** ST allocation share YTD (target ≥7.5%). */
  st_percent_ytd: number;
  fiscal_year: string;
}

export interface Constituency {
  id: string;
  name: string;
  name_hi: string;
  state: string;
  district: string;
  mp: ConstituencyMp;
  boundaries_geojson_url: string;
  wards: ConstituencyWard[];
  mplads: MpladsLedger;
}

export const CONSTITUENCIES_COLLECTION = "constituencies" as const;
