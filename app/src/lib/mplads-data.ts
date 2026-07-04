import type { MpladsSector } from "@saarthi/shared";
import type { DispatchRecord } from "./dashboard-store";
import { MOCK_CLUSTERS } from "./mock-data";

/**
 * MPLADS works ledger — the demo's spend truth. RECONCILIATION IS A HARD GATE:
 *   · sum of works with status ≠ "recommended"  = ₹3,42,00,000 (₹3.42 Cr utilised)
 *   · sum of scComponent works                  = ₹  64,00,000 (12.8% of ₹5 Cr)
 *   · sum of stComponent works                  = ₹  41,00,000 ( 8.2% of ₹5 Cr)
 * These must match MOCK_CONSTITUENCY.mplads or the demo contradicts itself.
 * Sector totals (lakhs): water 78 + sanitation 64 + roads 72 + electricity 38
 * + education 45 + urban 30 + sports 15 = 342. ✔
 */
export type WorkStatus = "recommended" | "sanctioned" | "in_progress" | "completed";

export interface SanctionedWork {
  id: string;
  title: string;
  sector: MpladsSector;
  ward: string;
  wardLabel: string;
  costRupees: number;
  status: WorkStatus;
  sanctionedOn: string;
  clusterId?: string;
  scComponent: boolean;
  stComponent: boolean;
  /** Session-dispatched rows get a "new" tint in the ledger. */
  session?: boolean;
}

const L = 100_000;

export const SANCTIONED_WORKS: SanctionedWork[] = [
  { id: "W-2026-001", title: "Community borewell + 40KL overhead tank", sector: "drinking_water", ward: "patel-nagar", wardLabel: "Patel Nagar", costRupees: 40 * L, status: "completed", sanctionedOn: "22 Apr 2026", clusterId: "cl_08", scComponent: true, stComponent: false },
  { id: "W-2026-002", title: "Piped water extension, Blocks D–F", sector: "drinking_water", ward: "kalkaji-ext", wardLabel: "Kalkaji Ext.", costRupees: 28 * L, status: "in_progress", sanctionedOn: "18 Jun 2026", clusterId: "cl_02", scComponent: false, stComponent: false },
  { id: "W-2026-003", title: "Water ATM kiosks (3 units)", sector: "drinking_water", ward: "sarojini-nagar", wardLabel: "Sarojini Nagar", costRupees: 10 * L, status: "sanctioned", sanctionedOn: "09 Oct 2026", scComponent: false, stComponent: false },
  { id: "W-2026-004", title: "Public toilet block + drainage relay", sector: "healthcare_sanitation", ward: "karol-bagh", wardLabel: "Karol Bagh", costRupees: 24 * L, status: "completed", sanctionedOn: "03 May 2026", clusterId: "cl_01", scComponent: true, stComponent: false },
  { id: "W-2026-005", title: "Storm-drain de-silting, Sectors 4 & 7", sector: "healthcare_sanitation", ward: "rk-puram", wardLabel: "R.K. Puram", costRupees: 22 * L, status: "in_progress", sanctionedOn: "27 Jul 2026", clusterId: "cl_05", scComponent: false, stComponent: false },
  { id: "W-2026-006", title: "PHC waiting hall + cold-chain upgrade", sector: "healthcare_sanitation", ward: "kasturba-nagar", wardLabel: "Kasturba Nagar", costRupees: 18 * L, status: "sanctioned", sanctionedOn: "14 Sep 2026", scComponent: false, stComponent: false },
  { id: "W-2026-007", title: "Service-lane resurfacing (2.1 km)", sector: "roads_pathways_bridges", ward: "rajinder-nagar", wardLabel: "Rajinder Nagar", costRupees: 30 * L, status: "completed", sanctionedOn: "11 Mar 2026", scComponent: false, stComponent: false },
  { id: "W-2026-008", title: "Footpath + culvert repair, approach road", sector: "roads_pathways_bridges", ward: "delhi-cantt", wardLabel: "Delhi Cantt", costRupees: 26 * L, status: "in_progress", sanctionedOn: "30 Jun 2026", clusterId: "cl_09", scComponent: false, stComponent: false },
  { id: "W-2026-009", title: "Raised pedestrian crossings (6 sites)", sector: "roads_pathways_bridges", ward: "green-park", wardLabel: "Green Park", costRupees: 16 * L, status: "sanctioned", sanctionedOn: "02 Oct 2026", scComponent: false, stComponent: false },
  { id: "W-2026-010", title: "LED street lighting, phase 1", sector: "electricity", ward: "sarai-kale-khan", wardLabel: "Sarai Kale Khan", costRupees: 16 * L, status: "completed", sanctionedOn: "19 May 2026", clusterId: "cl_04", scComponent: false, stComponent: true },
  { id: "W-2026-011", title: "Solar streetlights, SC-designated blocks", sector: "electricity", ward: "patel-nagar", wardLabel: "Patel Nagar", costRupees: 22 * L, status: "in_progress", sanctionedOn: "08 Aug 2026", clusterId: "cl_04", scComponent: false, stComponent: false },
  { id: "W-2026-012", title: "Two-classroom block, govt school", sector: "education", ward: "sarai-kale-khan", wardLabel: "Sarai Kale Khan", costRupees: 25 * L, status: "completed", sanctionedOn: "15 Apr 2026", scComponent: false, stComponent: true },
  { id: "W-2026-013", title: "Community library + reading room", sector: "education", ward: "malviya-nagar", wardLabel: "Malviya Nagar", costRupees: 20 * L, status: "sanctioned", sanctionedOn: "21 Sep 2026", scComponent: false, stComponent: false },
  { id: "W-2026-014", title: "Community hall renovation", sector: "urban_development", ward: "greater-kailash", wardLabel: "Greater Kailash", costRupees: 30 * L, status: "in_progress", sanctionedOn: "12 Jul 2026", clusterId: "cl_12", scComponent: false, stComponent: false },
  { id: "W-2026-015", title: "Ward sports ground upgrade", sector: "sports", ward: "chanakyapuri", wardLabel: "Chanakyapuri", costRupees: 15 * L, status: "sanctioned", sanctionedOn: "28 Sep 2026", scComponent: false, stComponent: false },
];

/** Sector display labels (shared keys stay snake_case). */
export const SECTOR_LABELS: Record<MpladsSector, string> = {
  drinking_water: "Drinking water",
  education: "Education",
  electricity: "Electricity",
  non_conventional_energy: "Renewable energy",
  healthcare_sanitation: "Health & sanitation",
  irrigation: "Irrigation",
  roads_pathways_bridges: "Roads & pathways",
  sports: "Sports",
  agriculture: "Agriculture",
  self_help_groups: "Self-help groups",
  urban_development: "Urban development",
};

export interface SectorSpend {
  sector: MpladsSector;
  label: string;
  total: number;
  works: SanctionedWork[];
}

/** Utilised spend by sector (status ≠ recommended). */
export function sectorSpend(works: SanctionedWork[] = SANCTIONED_WORKS): SectorSpend[] {
  const map = new Map<MpladsSector, SectorSpend>();
  for (const w of works) {
    if (w.status === "recommended") continue;
    const cur = map.get(w.sector);
    if (cur) {
      cur.total += w.costRupees;
      cur.works.push(w);
    } else {
      map.set(w.sector, {
        sector: w.sector,
        label: SECTOR_LABELS[w.sector],
        total: w.costRupees,
        works: [w],
      });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** Session composer dispatches → "recommended" ledger rows. */
const DISPATCH_SECTOR: Record<string, MpladsSector> = {
  cl_01: "urban_development",
  cl_04: "electricity",
};

export function dispatchedToWorks(dispatched: DispatchRecord[]): SanctionedWork[] {
  return dispatched.flatMap((d) => {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === d.id);
    if (!cluster) return [];
    return [
      {
        id: d.ref,
        title: cluster.suggested_action.title,
        sector: DISPATCH_SECTOR[d.id] ?? "healthcare_sanitation",
        ward: cluster.geo.ward,
        wardLabel: cluster.ui.wardLabel,
        costRupees: (cluster.suggested_action.estimated_cost_lakhs ?? 10) * L,
        status: "recommended" as const,
        sanctionedOn: "this session",
        clusterId: cluster.id,
        scComponent: false,
        stComponent: false,
        session: true,
      },
    ];
  });
}

/* Dev-time reconciliation guard — throws loudly in dev if the ledger drifts
   from the constituency KPIs. */
const utilised = SANCTIONED_WORKS.filter((w) => w.status !== "recommended").reduce(
  (s, w) => s + w.costRupees,
  0,
);
const sc = SANCTIONED_WORKS.filter((w) => w.scComponent).reduce((s, w) => s + w.costRupees, 0);
const st = SANCTIONED_WORKS.filter((w) => w.stComponent).reduce((s, w) => s + w.costRupees, 0);
if (process.env.NODE_ENV !== "production") {
  if (utilised !== 342 * L) throw new Error(`MPLADS ledger drift: utilised ${utilised}`);
  if (sc !== 64 * L) throw new Error(`MPLADS ledger drift: SC ${sc}`);
  if (st !== 41 * L) throw new Error(`MPLADS ledger drift: ST ${st}`);
}
