import "server-only";
import { embedMany } from "ai";
import type { AssistantCitation } from "@/lib/assistant-brain";
import { DASHBOARD_META, MOCK_CLUSTERS, MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { formatCr } from "@/lib/ui";
import { embeddingModel } from "./gemini";

/**
 * RAG corpus (§7.6 + §8.6). The retrievable knowledge base is built from the
 * SAME mock data the panels render — so every grounded answer matches the
 * screen. Base chunks (clusters + budget) are embedded once and module-memoised;
 * the assistant route merges the MP's uploaded-document chunks (R3C5) at query
 * time so retrieval always reflects what's actually on the desk.
 */
export interface RetrievableChunk {
  id: string;
  kind: "cluster" | "budget" | "document";
  text: string;
  citation: AssistantCitation;
}

export interface EmbeddedChunk extends RetrievableChunk {
  embedding: number[];
}

function clusterChunk(c: (typeof MOCK_CLUSTERS)[number]): RetrievableChunk {
  const n = c.id.replace("cl_", "");
  const a = c.suggested_action;
  const parts = [
    `Cluster #${n}: ${c.title}.`,
    `Ward: ${c.ui.wardLabel}.`,
    `Category ${c.category}/${c.subcategory}, urgency ${c.urgency}.`,
    `${c.submission_count} citizen signals, composite rank ${c.rank_score}, trend ${Math.round(c.trend.percent_change)}% week-over-week.`,
    `Suggested pathway ${a.type}: ${a.title}.`,
    a.mplads_eligible
      ? `MPLADS-eligible${a.estimated_cost_lakhs ? `, est. ₹${a.estimated_cost_lakhs} lakh` : ""}.`
      : "",
    c.ui.crossRefProse ? `Public-data context: ${c.ui.crossRefProse}` : "",
  ].filter(Boolean);
  return {
    id: `cluster:${c.id}`,
    kind: "cluster",
    text: parts.join(" "),
    citation: { label: `#${n} ${c.title}`, clusterId: c.id },
  };
}

function budgetChunk(): RetrievableChunk {
  const m = MOCK_CONSTITUENCY.mplads;
  const text =
    `MPLADS budget ${m.fiscal_year}: ₹${formatCr(m.utilization_ytd)} Cr utilised of ₹${formatCr(m.allocation_annual)} Cr allocated ` +
    `(₹${formatCr(m.allocation_annual - m.utilization_ytd)} Cr headroom). ` +
    `SC allocation ${(m.sc_percent_ytd * 100).toFixed(1)}% against the 15% floor; ` +
    `ST allocation ${(m.st_percent_ytd * 100).toFixed(1)}% against the 7.5% floor. ` +
    `${DASHBOARD_META.openClusters} open clusters, ${DASHBOARD_META.criticalClusters} critical, ${DASHBOARD_META.signalsThisWeek} signals this week.`;
  return {
    id: "budget:mplads",
    kind: "budget",
    text,
    citation: { label: "MPLADS page — full breakdown", href: "/mplads" },
  };
}

function baseChunks(): RetrievableChunk[] {
  return [...MOCK_CLUSTERS.map(clusterChunk), budgetChunk()];
}

let cache: Promise<EmbeddedChunk[]> | null = null;

/** Embed the base corpus once; memoise the promise for the server's lifetime. */
export function baseCorpus(): Promise<EmbeddedChunk[]> {
  if (!cache) {
    cache = (async () => {
      const raw = baseChunks();
      const { embeddings } = await embedMany({
        model: embeddingModel(),
        values: raw.map((r) => r.text),
      });
      return raw.map((r, i) => ({ ...r, embedding: embeddings[i]! }));
    })().catch((err) => {
      cache = null; // let a later request retry after a transient failure
      throw err;
    });
  }
  return cache;
}
