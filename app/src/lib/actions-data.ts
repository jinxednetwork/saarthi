import type { Action, ActionPathway } from "@saarthi/shared";
import { type DispatchRecord } from "./dashboard-store";
import { MOCK_CLUSTERS, ts } from "./mock-data";

/**
 * Actions ledger — the MP's dispatch tracker, typed against @saarthi/shared
 * `Action` with app-side UI extras. Session dispatches from the composer merge
 * in live via mergeSessionDispatches().
 */
export interface DemoAction extends Action {
  ui: {
    refNo: string;
    clusterTitle: string;
    pathway: ActionPathway;
    /** Days until a response is due (sent actions only). */
    responseDueDays?: number;
    /** Awaiting-response progress 0–100. */
    progress?: number;
  };
}

const NOW = 1_751_500_000_000;
const DAY = 86_400_000;

function auditTrail(events: [daysAgo: number, actor: string, event: string][]) {
  return events.map(([d, actor, event]) => ({ timestamp: ts(NOW - d * DAY), actor, event }));
}

export const MOCK_ACTIONS: DemoAction[] = [
  {
    id: "act_003",
    cluster_id: "cl_03",
    type: "STATE_LETTER",
    status: "sent",
    drafted_by: "ai",
    approved_by: "mp",
    sent_to: "Union Minister, MoEFCC",
    sent_at: ts(NOW - 3 * DAY),
    audit_log: auditTrail([
      [4, "Saarthi", "Draft generated from cluster #03 evidence"],
      [3, "Bansuri Swaraj", "Approved & dispatched via NIC"],
    ]),
    ui: {
      refNo: "MP-NDL-MOEFCC-2026-W44-003",
      clusterTitle: "Air quality — construction dust",
      pathway: "CENTRAL",
      responseDueDays: 11,
      progress: 42,
    },
  },
  {
    id: "act_004",
    cluster_id: "cl_04",
    type: "MPLADS_LETTER",
    status: "responded",
    drafted_by: "ai",
    approved_by: "mp",
    sent_to: "District Magistrate, New Delhi District",
    sent_at: ts(NOW - 9 * DAY),
    response: "Acknowledged; joint site survey with BSES scheduled for week 45.",
    audit_log: auditTrail([
      [10, "Saarthi", "Draft generated"],
      [9, "Bansuri Swaraj", "Approved & dispatched"],
      [2, "DM Office", "Response received"],
    ]),
    ui: {
      refNo: "MP-NDL-MPLADS-2026-W43-004",
      clusterTitle: "Broken street lights, public safety",
      pathway: "MPLADS",
      progress: 70,
    },
  },
  {
    id: "act_009",
    cluster_id: "cl_09",
    type: "MPLADS_LETTER",
    status: "completed",
    drafted_by: "staff",
    approved_by: "mp",
    sent_to: "District Magistrate, New Delhi District",
    sent_at: ts(NOW - 34 * DAY),
    response: "Work order issued to CPWD; resurfacing completed.",
    outcome: "sanctioned",
    audit_log: auditTrail([
      [36, "Chief of Staff", "Draft prepared"],
      [34, "Bansuri Swaraj", "Approved & dispatched"],
      [20, "DM Office", "Sanction issued"],
      [6, "CPWD", "Work completed"],
    ]),
    ui: {
      refNo: "MP-NDL-MPLADS-2026-W39-009",
      clusterTitle: "Potholes on approach roads",
      pathway: "MPLADS",
      progress: 100,
    },
  },
  {
    id: "act_pq1",
    cluster_id: "cl_03",
    type: "PARLIAMENT_QUESTION",
    status: "draft",
    drafted_by: "ai",
    sent_to: "Lok Sabha Secretariat (Question Hour)",
    audit_log: auditTrail([
      [1, "Saarthi", "Drafted; advanced from week 46 to 44 per air-quality forecast"],
    ]),
    ui: {
      refNo: "MP-NDL-PQ-2026-W44-001",
      clusterTitle: "Air quality — construction dust",
      pathway: "CENTRAL",
    },
  },
  {
    id: "act_mt1",
    cluster_id: "cl_02",
    type: "MEETING",
    status: "completed",
    drafted_by: "staff",
    sent_to: "DJB × DUSIB joint inspection",
    sent_at: ts(NOW - 5 * DAY),
    outcome: "underway",
    response: "Joint inspection held; tanker augmentation to 4 pockets agreed.",
    audit_log: auditTrail([
      [7, "Constituency Office", "Meeting convened"],
      [5, "DJB", "Tanker augmentation agreed"],
    ]),
    ui: {
      refNo: "MP-NDL-MTG-2026-W43-002",
      clusterTitle: "Contaminated drinking water",
      pathway: "STATE",
      progress: 55,
    },
  },
  {
    id: "act_br1",
    cluster_id: "cl_10",
    type: "BRIEF_SHARED",
    status: "sent",
    drafted_by: "ai",
    sent_to: "Delhi Pollution Control Committee",
    sent_at: ts(NOW - 2 * DAY),
    audit_log: auditTrail([
      [2, "Saarthi", "Policy brief generated and shared"],
    ]),
    ui: {
      refNo: "MP-NDL-BRF-2026-W44-010",
      clusterTitle: "Dust pollution — metro construction",
      pathway: "COORDINATION",
      responseDueDays: 13,
      progress: 15,
    },
  },
  {
    id: "act_008",
    cluster_id: "cl_05",
    type: "STATE_LETTER",
    status: "sent",
    drafted_by: "staff",
    approved_by: "mp",
    sent_to: "CEO, DUSIB",
    sent_at: ts(NOW - 8 * DAY),
    audit_log: auditTrail([
      [8, "Bansuri Swaraj", "Escalation dispatched"],
    ]),
    ui: {
      refNo: "MP-NDL-DUSIB-2026-W43-005",
      clusterTitle: "Sewer overflow near residences",
      pathway: "STATE",
      responseDueDays: 6,
      progress: 60,
    },
  },
  {
    id: "act_d1",
    cluster_id: "cl_08",
    type: "MPLADS_LETTER",
    status: "draft",
    drafted_by: "ai",
    sent_to: "District Magistrate, New Delhi District",
    audit_log: auditTrail([[0, "Saarthi", "Draft ready for MP review"]]),
    ui: {
      refNo: "MP-NDL-MPLADS-2026-W44-008",
      clusterTitle: "Water supply irregular",
      pathway: "MPLADS",
    },
  },
  {
    id: "act_012",
    cluster_id: "cl_12",
    type: "MPLADS_LETTER",
    status: "completed",
    drafted_by: "staff",
    approved_by: "mp",
    sent_to: "District Magistrate, New Delhi District",
    sent_at: ts(NOW - 48 * DAY),
    outcome: "completed",
    response: "Community hall renovation sanctioned and under execution.",
    audit_log: auditTrail([
      [48, "Bansuri Swaraj", "Approved & dispatched"],
      [30, "DM Office", "Sanctioned"],
    ]),
    ui: {
      refNo: "MP-NDL-MPLADS-2026-W37-012",
      clusterTitle: "Park maintenance",
      pathway: "MPLADS",
      progress: 100,
    },
  },
];

/** Session composer dispatches → tracker rows (skip cluster+type duplicates). */
export function mergeSessionDispatches(dispatched: DispatchRecord[]): DemoAction[] {
  const session = dispatched.flatMap((d) => {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === d.id);
    if (!cluster) return [];
    if (MOCK_ACTIONS.some((a) => a.cluster_id === d.id && a.type === "MPLADS_LETTER" && a.status !== "draft"))
      return [];
    return [
      {
        id: `act_session_${d.id}`,
        cluster_id: d.id,
        type: "MPLADS_LETTER" as const,
        status: "sent" as const,
        drafted_by: "ai" as const,
        approved_by: "mp",
        sent_to: "District Magistrate, New Delhi District",
        sent_at: ts(NOW),
        audit_log: auditTrail([[0, "Bansuri Swaraj", "Approved & dispatched via NIC (this session)"]]),
        ui: {
          refNo: d.ref,
          clusterTitle: cluster.title,
          pathway: "MPLADS" as const,
          responseDueDays: 15,
          progress: 8,
        },
      },
    ];
  });
  return [...session, ...MOCK_ACTIONS];
}
