import { MPLADS_RULES } from "@saarthi/shared";
import { CATEGORY_GROUPS, type CategoryGroup, groupOf } from "./categories";
import { checkEligibility } from "./compliance";
import { datasetUrl } from "./datasets";
import { newThisWeek, signalsByCategory, wardHotspots, weekMovers } from "./insights";
import { MOCK_ACTIONS } from "./actions-data";
import { DASHBOARD_META, MOCK_CLUSTERS, MOCK_CONSTITUENCY, topClusters } from "./mock-data";
import { SEED_PROPOSALS, costLabel, scoreProposal } from "./proposals";
import { formatCr } from "./ui";

/**
 * Saarthi Assistant — scripted demo brain (§8.6 shape, offline). An intent
 * matcher over the SAME data the panels render, so every number it speaks
 * matches the screen. Every answer carries resolvable citations: cluster
 * citations open the drawer, dataset citations link to the real portals.
 * Gemini replaces `ask()` in Phase 4; the message contract stays.
 */
export interface AssistantCitation {
  label: string;
  href?: string;
  clusterId?: string;
  /** Resolves to an uploaded document (opens /documents). Wired in R3C5. */
  documentId?: string;
}

export interface AssistantAnswer {
  text: string;
  citations: AssistantCitation[];
  chips: string[];
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: AssistantCitation[];
  chips?: string[];
}

export const SUGGESTED_CHIPS = [
  "Water issues in SC-majority wards",
  "What changed this week?",
  "Which proposal should I prioritise?",
  "How is my budget tracking?",
];

const FOLLOW_UPS = [
  "Top 5 issues right now",
  "Status of my dispatched letters",
  "Summarise air quality",
  "How is my budget tracking?",
];

const L = (rupees: number) => `₹${Math.round(rupees / 100_000)} L`;

function clusterCitation(id: string): AssistantCitation {
  const c = MOCK_CLUSTERS.find((x) => x.id === id);
  return { label: `#${id.replace("cl_", "")} ${c?.title ?? ""}`.trim(), clusterId: id };
}

/* ---------- intents ---------- */

interface Intent {
  id: string;
  test: (q: string) => boolean;
  answer: () => AssistantAnswer;
}

const scWardIds = () =>
  MOCK_CONSTITUENCY.wards.filter((w) => w.sc_majority).map((w) => w.id);

const INTENTS: Intent[] = [
  {
    // §8.6 hero — "Show me water issues in SC-majority wards…"
    id: "water-sc-wards",
    test: (q) => /water|पानी/.test(q) && /(sc|dalit|reserved|scheduled caste)/.test(q),
    answer: () => {
      const sc = scWardIds();
      const hits = MOCK_CLUSTERS.filter(
        (c) =>
          sc.includes(c.geo.ward) &&
          (groupOf(c.category) === "water" || c.subcategory.includes("drain")),
      ).sort((a, b) => b.rank_score - a.rank_score);
      const names = MOCK_CONSTITUENCY.wards
        .filter((w) => w.sc_majority)
        .map((w) => w.name)
        .join(", ");
      return {
        text:
          `${hits.length} water-related clusters sit in your SC-majority wards (${names}):\n\n` +
          hits
            .map(
              (c) =>
                `• ${c.title} — ${c.ui.wardLabel} · ${c.submission_count} signals · rank ${c.rank_score}`,
            )
            .join("\n") +
          `\n\nDUSIB's works register shows no planned de-silting on the Karol Bagh drain network this quarter — the citizen signal and the public record collide there.`,
        citations: [
          ...hits.map((c) => clusterCitation(c.id)),
          { label: "DUSIB · works register", href: datasetUrl("DUSIB") },
          { label: "DJB · quality register", href: datasetUrl("DJB") },
        ],
        chips: ["Which issues could I fund with MPLADS?", "Top 5 issues right now"],
      };
    },
  },
  {
    // "Which proposal should I prioritise?" — ranks the MP's own works.
    id: "proposals-rank",
    test: (q) => /proposal|prioriti[sz]e|rank|best (scheme|work|project|option)|head.to.head|compare.*(proposal|work)/.test(q),
    answer: () => {
      const ranked = SEED_PROPOSALS.map((p) => ({ p, s: scoreProposal(p) }))
        .sort((a, b) => b.s.total - a.s.total)
        .slice(0, 4);
      return {
        text:
          `Your proposals ranked by evidence score (citizen demand · public-data severity · MPLADS leverage · cost-effectiveness):\n\n` +
          ranked
            .map(
              (r, i) =>
                `${i + 1}. ${r.p.title} — ${r.s.total}/100 · ${r.s.wardName} · ${costLabel(r.p.cost_lakhs)}`,
            )
            .join("\n") +
          `\n\nOpen Proposals to compare any two head-to-head and see which signals decide it.`,
        citations: [
          { label: "Proposals — ranked", href: "/proposals" },
          ...ranked
            .map((r) => r.s.components.find((c) => c.citation?.clusterId)?.citation)
            .filter((c): c is AssistantCitation => c != null)
            .slice(0, 2),
        ],
        chips: ["Which issues could I fund with MPLADS?", "How is my budget tracking?"],
      };
    },
  },
  {
    // §8.6 hero — "Which of these could I fund with MPLADS to help my SC allocation?"
    id: "mplads-sc-gap",
    test: (q) => /mplads|fund|allocat|sanction/.test(q),
    answer: () => {
      const m = MOCK_CONSTITUENCY.mplads;
      const gap = m.allocation_annual * (MPLADS_RULES.scMinShare - m.sc_percent_ytd);
      const headroom = m.allocation_annual - m.utilization_ytd;
      const sc = scWardIds();
      const eligible = MOCK_CLUSTERS.filter(
        (c) => c.suggested_action.mplads_eligible && sc.includes(c.geo.ward),
      );
      const verdict = checkEligibility("drinking_water", m);
      return {
        text:
          `You're at ${(m.sc_percent_ytd * 100).toFixed(1)}% SC allocation — ${L(gap)} below the ${Math.round(MPLADS_RULES.scMinShare * 100)}% floor, with ${formatCr(headroom)} Cr headroom.\n\n` +
          `MPLADS-eligible clusters in SC-majority wards:\n` +
          eligible
            .map(
              (c) =>
                `• ${c.title} — est. ₹${c.suggested_action.estimated_cost_lakhs} L (${c.ui.wardLabel})`,
            )
            .join("\n") +
          `\n\nCompliance check: ${verdict.compliance_notes.join(" ")}`,
        citations: [
          ...eligible.map((c) => clusterCitation(c.id)),
          { label: "MPLADS guidelines · MoSPI", href: datasetUrl("MoSPI") },
        ],
        chips: ["How is my budget tracking?", "Status of my dispatched letters"],
      };
    },
  },
  {
    id: "what-changed",
    test: (q) => /chang|new|trend|spik|escalat|this week|update/.test(q),
    answer: () => {
      const movers = weekMovers(3);
      const fresh = newThisWeek();
      return {
        text:
          `Three clusters are accelerating this week:\n\n` +
          movers
            .map((c) => `• ${c.title} — ↑ ${Math.round(c.trend.percent_change)}% w/w (${c.ui.wardLabel})`)
            .join("\n") +
          (fresh.length
            ? `\n\nNew this week: ${fresh.map((c) => c.title).join("; ")} — first signals arrived within the last 7 days.`
            : ""),
        citations: [...movers, ...fresh].map((c) => clusterCitation(c.id)),
        chips: ["Top 5 issues right now", "Water issues in SC-majority wards"],
      };
    },
  },
  {
    id: "top-issues",
    test: (q) => /top|priorit|urgent|attention|critical/.test(q),
    answer: () => {
      const top = topClusters(5);
      return {
        text:
          `Today's top 5 by composite rank (demand · severity · MPLADS leverage):\n\n` +
          top
            .map(
              (c, i) =>
                `${i + 1}. ${c.title} — ${c.urgency}, ${c.submission_count} signals, ${c.ui.wardLabel}`,
            )
            .join("\n"),
        citations: top.slice(0, 3).map((c) => clusterCitation(c.id)),
        chips: ["What changed this week?", "Which issues could I fund with MPLADS?"],
      };
    },
  },
  {
    id: "category-summary",
    test: (q) => /air|quality|smog|dust|infra|road|street|garbage|health|sewer|sanita/.test(q),
    answer: () => {
      // Pick the group the query names.
      const q = lastQuery;
      const group: CategoryGroup = /air|smog|dust|health/.test(q)
        ? "health"
        : /infra|road|street|garbage/.test(q)
          ? "infra"
          : "water";
      const slice = signalsByCategory().find((s) => s.group === group)!;
      const top = MOCK_CLUSTERS.filter((c) => groupOf(c.category) === group).sort(
        (a, b) => b.rank_score - a.rank_score,
      )[0]!;
      return {
        text:
          `${slice.label}: ${slice.signals} signals across ${slice.clusters} clusters this window.\n\n` +
          `Highest-ranked: ${top.title} (${top.ui.wardLabel}) — ${top.submission_count} signals, ${top.urgency}. ` +
          (top.ui.crossRefProse ? `\n\nPublic-data collision: ${top.ui.crossRefProse}` : ""),
        citations: [
          clusterCitation(top.id),
          ...top.cross_reference.slice(0, 2).map((r) => ({
            label: `${r.dataset} · ${r.metric}`,
            href: r.citation_url,
          })),
        ],
        chips: FOLLOW_UPS.slice(0, 2),
      };
    },
  },
  {
    id: "budget-summary",
    test: (q) => /budget|spend|utili[sz]|money|crore|headroom|remaining/.test(q),
    answer: () => {
      const m = MOCK_CONSTITUENCY.mplads;
      const pct = Math.round((m.utilization_ytd / m.allocation_annual) * 100);
      return {
        text:
          `MPLADS ${m.fiscal_year}: ${formatCr(m.utilization_ytd)} Cr utilised of ${formatCr(m.allocation_annual)} Cr (${pct}%), ${formatCr(m.allocation_annual - m.utilization_ytd)} Cr remaining.\n\n` +
          `• SC allocation ${(m.sc_percent_ytd * 100).toFixed(1)}% — below the 15% floor (needs ${L(m.allocation_annual * (MPLADS_RULES.scMinShare - m.sc_percent_ytd))} more)\n` +
          `• ST allocation ${(m.st_percent_ytd * 100).toFixed(1)}% — above the 7.5% floor\n\n` +
          `The full sector-by-sector breakdown is on the MPLADS page.`,
        citations: [
          { label: "MPLADS page — full breakdown", href: "/mplads" },
          { label: "MPLADS portal · MoSPI", href: datasetUrl("MoSPI") },
        ],
        chips: ["Which issues could I fund with MPLADS?", "Top 5 issues right now"],
      };
    },
  },
  {
    id: "action-status",
    test: (q) => /letter|action|dispatch|sent|pending|status|track/.test(q),
    answer: () => {
      const active = MOCK_ACTIONS.filter((a) => a.status === "sent");
      return {
        text:
          `${active.length} dispatches awaiting response:\n\n` +
          active
            .map(
              (a) =>
                `• ${a.ui.clusterTitle} → ${a.sent_to} — due in ${a.ui.responseDueDays ?? "–"} days (${a.ui.refNo})`,
            )
            .join("\n") +
          `\n\nThe full tracker with timelines is on the Actions page.`,
        citations: [
          { label: "Actions tracker", href: "/actions" },
          ...active.slice(0, 2).map((a) => clusterCitation(a.cluster_id)),
        ],
        chips: ["How is my budget tracking?", "What changed this week?"],
      };
    },
  },
];

let lastQuery = "";

const FALLBACK: AssistantAnswer = {
  text:
    "I can answer questions grounded in this constituency's signals, budget, and actions. Try one of these:",
  citations: [],
  chips: SUGGESTED_CHIPS,
};

/** Route a query to the best intent. Pure and deterministic. */
export function ask(query: string): AssistantAnswer {
  const q = query.toLowerCase().trim();
  lastQuery = q;
  for (const intent of INTENTS) {
    if (intent.test(q)) return intent.answer();
  }
  return FALLBACK;
}
