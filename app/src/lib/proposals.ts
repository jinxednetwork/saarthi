import { MPLADS_RULES, type Category, type RankComponents } from "@saarthi/shared";
import { CATEGORY_GROUPS, groupOf, type CategoryGroup } from "./categories";
import { MOCK_CLUSTERS, MOCK_CONSTITUENCY, type DemoCluster } from "./mock-data";
import {
  DEMAND_DIMENSIONS,
  demandSignals,
  type DemandDimension,
  type DemandSignal,
} from "./publicdata";

/**
 * Proposals — the MP's own works, ranked and compared head-to-head (§8.3). A
 * proposal need NOT come from a citizen-signal cluster: the MP can author one
 * directly, and the ranking still scores it against the same evidence base
 * (citizen demand + curated public-data severity + MPLADS leverage). Competing
 * proposals for the same ward+need are compared side-by-side so the MP can see
 * WHY one out-scores another — not a black box.
 */

export type ProposalOrigin = "manual" | "cluster" | "citizen";
export type ProposalPathway = "MPLADS" | "STATE" | "CENTRAL" | "COORDINATION";

export interface Proposal {
  id: string;
  title: string;
  summary: string;
  /** Public-data axis the proposal addresses (drives the severity evidence). */
  dimension: DemandDimension;
  /** Citizen-signal taxonomy (drives the demand-signal evidence). */
  category: Category;
  ward_id: string;
  origin: ProposalOrigin;
  pathway: ProposalPathway;
  cost_lakhs: number;
  mplads_eligible: boolean;
  /** Targets an SC-majority ward / SC beneficiaries — leverage on the 15% floor. */
  benefits_sc: boolean;
  /**
   * How directly the work closes the MEASURED public-data deficit (0–1, default
   * 1). An upgrade of the documented-deficient schools scores 1; new/additive
   * capacity whose need the datasets don't directly measure scores lower. This
   * is what separates competing works for the same ward+need.
   */
  evidence_fit?: number;
  /** Set when promoted from a citizen-signal cluster. */
  source_cluster_id?: string;
  created_at?: string;
}

export const PATHWAY_LABEL: Record<ProposalPathway, string> = {
  MPLADS: "MPLADS",
  STATE: "State subject",
  CENTRAL: "Central ministry",
  COORDINATION: "Coordination",
};

export const ORIGIN_LABEL: Record<ProposalOrigin, string> = {
  manual: "MP-authored",
  cluster: "From citizen cluster",
  citizen: "From citizen portal",
};

export function dimensionLabel(d: DemandDimension): string {
  return DEMAND_DIMENSIONS.find((x) => x.key === d)?.label ?? d;
}

/* --------------------------------------------------------------- Scoring */

const URGENCY_VALUE: Record<DemoCluster["urgency"], number> = {
  critical: 1,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function matchingClusters(p: Proposal): DemoCluster[] {
  const group = groupOf(p.category);
  return MOCK_CLUSTERS.filter((c) => c.geo.ward === p.ward_id && groupOf(c.category) === group);
}

// Normaliser for demand_signal: the loudest ward+group signal-sum in the corpus.
const WARD_GROUP_SIGNAL_MAX = Math.max(
  1,
  ...MOCK_CONSTITUENCY.wards.flatMap((w) =>
    (Object.keys(CATEGORY_GROUPS) as CategoryGroup[]).map((g) =>
      MOCK_CLUSTERS.filter((c) => c.geo.ward === w.id && groupOf(c.category) === g).reduce(
        (s, c) => s + c.submission_count,
        0,
      ),
    ),
  ),
);

const scBelowFloor = MOCK_CONSTITUENCY.mplads.sc_percent_ytd < MPLADS_RULES.scMinShare;

/**
 * Proposal scoring augments the six cluster-merit signals (§8.3) with
 * `cost_effectiveness` — proposals have a cost and clusters don't, and value-
 * for-money is exactly what separates two works that address the same need.
 * Weights sum to 1.
 */
export type ProposalComponentKey = keyof RankComponents | "cost_effectiveness";

export const PROPOSAL_WEIGHTS: Record<ProposalComponentKey, number> = {
  demand_signal: 0.28,
  public_data_severity: 0.22,
  urgency: 0.12,
  mplads_eligibility: 0.08,
  compliance_leverage: 0.1,
  trend: 0.05,
  cost_effectiveness: 0.15,
};

export interface ScoreComponent {
  key: ProposalComponentKey;
  label: string;
  /** 0–1 before weighting. */
  value: number;
  weight: number;
  /** value × weight × 100 — the points this component adds to the total. */
  contribution: number;
  evidence: string;
  citation?: { label: string; href?: string; clusterId?: string };
}

export interface ProposalScore {
  proposalId: string;
  /** 0–100 composite. */
  total: number;
  components: ScoreComponent[];
  demand: DemandSignal | null;
  wardName: string;
}

const COMPONENT_LABEL: Record<ProposalComponentKey, string> = {
  demand_signal: "Citizen demand",
  public_data_severity: "Public-data severity",
  urgency: "Urgency",
  mplads_eligibility: "MPLADS eligibility",
  compliance_leverage: "SC/ST leverage",
  trend: "Momentum",
  cost_effectiveness: "Cost-effectiveness",
};

/**
 * Score a proposal on the six §8.3 components, each 0–1, then combine with the
 * config weights into a 0–100 total. Every component carries the evidence and
 * a resolvable citation behind its number, so the rank is transparent.
 */
export function scoreProposal(p: Proposal): ProposalScore {
  const clusters = matchingClusters(p);
  const wardName = MOCK_CONSTITUENCY.wards.find((w) => w.id === p.ward_id)?.name ?? p.ward_id;
  const group = CATEGORY_GROUPS[groupOf(p.category)];
  const demand = demandSignals(p.ward_id, p.dimension);

  // demand_signal — citizen loudness for this ward+need.
  const signalSum = clusters.reduce((s, c) => s + c.submission_count, 0);
  const demandVal = clamp01(signalSum / WARD_GROUP_SIGNAL_MAX);

  // public_data_severity — the curated gap severity, scaled by how directly
  // this particular work closes the measured deficit.
  const fit = p.evidence_fit ?? 1;
  const severityVal = (demand?.severity ?? 0) * fit;

  // urgency — worst matching cluster, else inferred from the data gap.
  const worst = clusters.reduce<DemoCluster["urgency"] | null>(
    (acc, c) => (acc == null || URGENCY_VALUE[c.urgency] > URGENCY_VALUE[acc] ? c.urgency : acc),
    null,
  );
  const urgencyVal = worst ? URGENCY_VALUE[worst] : clamp01(severityVal * 0.7);

  // mplads_eligibility — eligible works score full; others fundable elsewhere.
  const eligibilityVal = p.mplads_eligible ? 1 : 0.35;

  // compliance_leverage — closing the statutory SC floor is worth the most.
  const leverageVal = p.benefits_sc && scBelowFloor ? 1 : p.mplads_eligible ? 0.5 : 0.35;

  // trend — momentum on the strongest matching cluster.
  const maxTrend = clusters.reduce((m, c) => Math.max(m, c.trend.percent_change), 0);
  const trendVal = clusters.length ? clamp01(maxTrend / 340) : 0.2;

  // cost_effectiveness — value for money across a plausible MPLADS work range
  // (~₹10 L–₹100 L); cheaper works for the same need score higher.
  const costEffVal = clamp01(1 - (p.cost_lakhs - 10) / 90);

  const values: Record<ProposalComponentKey, number> = {
    demand_signal: demandVal,
    public_data_severity: severityVal,
    urgency: urgencyVal,
    mplads_eligibility: eligibilityVal,
    compliance_leverage: leverageVal,
    trend: trendVal,
    cost_effectiveness: costEffVal,
  };

  const evidence: Record<ProposalComponentKey, ScoreComponent["evidence"]> = {
    demand_signal: clusters.length
      ? `${signalSum} citizen signals across ${clusters.length} ${group.label} cluster${clusters.length > 1 ? "s" : ""} in ${wardName}.`
      : `No active citizen cluster in ${wardName} — the case rests on public data.`,
    public_data_severity: demand?.headline ?? "No public-data coverage for this ward.",
    urgency: worst ? `Worst matching cluster is ${worst} urgency.` : "Inferred from the data gap; no active cluster.",
    mplads_eligibility: p.mplads_eligible
      ? `MPLADS-eligible via the ${PATHWAY_LABEL[p.pathway]} pathway.`
      : `Not MPLADS-eligible — routed via ${PATHWAY_LABEL[p.pathway]}.`,
    compliance_leverage:
      p.benefits_sc && scBelowFloor
        ? `Counts toward the SC allocation floor (currently ${(MOCK_CONSTITUENCY.mplads.sc_percent_ytd * 100).toFixed(1)}% vs 15%).`
        : p.benefits_sc
          ? "Benefits SC residents; SC floor already met."
          : "No direct SC/ST allocation leverage.",
    trend: clusters.length
      ? `Strongest matching cluster ${maxTrend > 0 ? `↑ ${Math.round(maxTrend)}% week-on-week` : "stable"}.`
      : "No citizen-signal momentum to read.",
    cost_effectiveness:
      fit < 1
        ? `${costLabel(p.cost_lakhs)} for capacity the datasets don't directly measure — weaker value-for-money than closing the documented gap.`
        : `${costLabel(p.cost_lakhs)} — ${costEffVal >= 0.66 ? "strong" : costEffVal >= 0.4 ? "fair" : "high-cost"} value for money in the MPLADS range.`,
  };

  const citation: Partial<Record<ProposalComponentKey, ScoreComponent["citation"]>> = {};
  if (clusters[0]) {
    const c = clusters[0];
    citation.demand_signal = { label: `#${c.id.replace("cl_", "")} ${c.title}`, clusterId: c.id };
    citation.urgency = citation.demand_signal;
    citation.trend = citation.demand_signal;
  }
  if (demand) {
    citation.public_data_severity = { label: demand.provenance.source, href: demand.provenance.portal };
  }

  const components: ScoreComponent[] = (Object.keys(values) as ProposalComponentKey[]).map((k) => {
    const weight = PROPOSAL_WEIGHTS[k];
    return {
      key: k,
      label: COMPONENT_LABEL[k],
      value: values[k],
      weight,
      contribution: values[k] * weight * 100,
      evidence: evidence[k],
      citation: citation[k],
    };
  });

  const total = components.reduce((s, c) => s + c.contribution, 0);
  return { proposalId: p.id, total: Math.round(total * 10) / 10, components, demand, wardName };
}

/** Two competing proposals compared: the winner + the components that decided it. */
export interface CompareResult {
  a: ProposalScore;
  b: ProposalScore;
  winnerId: string;
  margin: number;
  /** Components where the winner leads by the largest margin. */
  decidingComponents: { key: ProposalComponentKey; label: string; delta: number }[];
}

export function compareProposals(pa: Proposal, pb: Proposal): CompareResult {
  const a = scoreProposal(pa);
  const b = scoreProposal(pb);
  const winner = a.total >= b.total ? a : b;
  const loser = winner === a ? b : a;
  const deciding = winner.components
    .map((wc) => {
      const lc = loser.components.find((x) => x.key === wc.key)!;
      return { key: wc.key, label: wc.label, delta: wc.contribution - lc.contribution };
    })
    .filter((d) => d.delta > 0.5)
    .sort((x, y) => y.delta - x.delta)
    .slice(0, 3);
  return {
    a,
    b,
    winnerId: winner.proposalId,
    margin: Math.round(Math.abs(a.total - b.total) * 10) / 10,
    decidingComponents: deciding,
  };
}

/* ----------------------------------------------------------------- Seed */

// Includes a deliberate competing PAIR in one high-need SC ward (Sarai Kale
// Khan) — school upgrade vs vocational centre — so the head-to-head compare has
// a real, defensible outcome out of the box.
export const SEED_PROPOSALS: Proposal[] = [
  {
    id: "prop_school_skk",
    title: "Upgrade 3 govt schools — labs, toilets, boundary walls",
    summary:
      "Infrastructure upgrade for the three most-deficient UDISE+ schools in Sarai Kale Khan: science labs, functional toilets, drinking water, boundary walls.",
    dimension: "education",
    category: "infrastructure",
    ward_id: "sarai-kale-khan",
    origin: "manual",
    pathway: "MPLADS",
    cost_lakhs: 42,
    mplads_eligible: true,
    benefits_sc: true,
  },
  {
    id: "prop_vocational_skk",
    title: "New vocational skilling centre",
    summary:
      "A greenfield skilling centre in Sarai Kale Khan offering ITI-aligned trades for post-secondary youth.",
    dimension: "education",
    category: "infrastructure",
    ward_id: "sarai-kale-khan",
    origin: "manual",
    pathway: "MPLADS",
    cost_lakhs: 65,
    mplads_eligible: true,
    benefits_sc: true,
    // UDISE+ measures the upgrade backlog, not vocational demand — the evidence
    // supports it less directly than the school-upgrade competitor.
    evidence_fit: 0.72,
  },
  {
    id: "prop_drain_karolbagh",
    title: "Emergency drain de-silting — Karol Bagh network",
    summary:
      "De-silt the Karol Bagh main-drain network before monsoon peak; DUSIB shows no planned works this quarter.",
    dimension: "water",
    category: "infrastructure",
    ward_id: "karol-bagh",
    origin: "cluster",
    pathway: "MPLADS",
    cost_lakhs: 28.5,
    mplads_eligible: true,
    benefits_sc: true,
    source_cluster_id: "cl_01",
  },
  {
    id: "prop_water_kalkaji",
    title: "Tanker-route augmentation — Kalkaji Ext.",
    summary:
      "Temporary tanker augmentation to the 4 of 7 pockets DJB does not currently serve, pending piped-supply extension.",
    dimension: "water",
    category: "water",
    ward_id: "kalkaji-ext",
    origin: "cluster",
    pathway: "STATE",
    cost_lakhs: 18,
    mplads_eligible: false,
    benefits_sc: false,
    source_cluster_id: "cl_02",
  },
  {
    id: "prop_clinic_kalkaji",
    title: "Mohalla clinic — Kalkaji Ext.",
    summary:
      "A new mohalla clinic for Kalkaji Ext., which has 0.4 public beds per 1,000 residents and a 61-minute average OPD wait.",
    dimension: "health",
    category: "health",
    ward_id: "kalkaji-ext",
    origin: "manual",
    pathway: "MPLADS",
    cost_lakhs: 35,
    mplads_eligible: true,
    benefits_sc: false,
  },
  {
    id: "prop_led_rajinder",
    title: "LED street-light replacement — Rajinder Nagar",
    summary:
      "Replace failed sodium street lights on the Rajinder Nagar–Patel Nagar stretch flagged for public-safety after dark.",
    dimension: "infrastructure",
    category: "infrastructure",
    ward_id: "rajinder-nagar",
    origin: "cluster",
    pathway: "MPLADS",
    cost_lakhs: 22,
    mplads_eligible: true,
    benefits_sc: false,
    source_cluster_id: "cl_04",
  },
];

export function costLabel(lakhs: number): string {
  return lakhs >= 100 ? `₹${(lakhs / 100).toFixed(2)} Cr` : `₹${lakhs} L`;
}
