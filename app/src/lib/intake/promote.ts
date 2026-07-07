import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import type { Category, SourceBreakdown, Urgency } from "@saarthi/shared";
import { chatModel, hasGeminiKey } from "@/lib/ai/gemini";
import { ts, type DemoCluster } from "@/lib/mock-data";
import type { EnrichedSignal } from "./types";

/**
 * Promote intake signals into a live cluster ("issue"). Gemini synthesizes the
 * issue's title/summary/action from the selected signals (mechanical fallback
 * with no key); the rest of the cluster is derived mechanically from the signals.
 * See docs/superpowers/specs/2026-07-08-promote-signals-to-issue-design.md.
 */

// ~13 New Delhi LS wards → approximate centroids, so a promoted cluster gets a map
// pin (NEW_DELHI_WARDS carries no coords). Keyed by the ward NAME Gemini assigns.
const WARD_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "Karol Bagh": { lat: 28.6519, lng: 77.1902 },
  "Rajinder Nagar": { lat: 28.6389, lng: 77.1874 },
  "Kalkaji Ext.": { lat: 28.5483, lng: 77.259 },
  "Malviya Nagar": { lat: 28.5355, lng: 77.21 },
  Chanakyapuri: { lat: 28.593, lng: 77.189 },
  "Sarai Kale Khan": { lat: 28.588, lng: 77.256 },
  "Patel Nagar": { lat: 28.651, lng: 77.168 },
  "R.K. Puram": { lat: 28.564, lng: 77.175 },
  "Sarojini Nagar": { lat: 28.577, lng: 77.199 },
  "Kasturba Nagar": { lat: 28.576, lng: 77.228 },
  "Green Park": { lat: 28.559, lng: 77.207 },
  "Greater Kailash": { lat: 28.549, lng: 77.242 },
  "Delhi Cantt": { lat: 28.595, lng: 77.136 },
};
const CENTER = { lat: 28.59, lng: 77.19 };
const URGENCY_RANK: Record<Urgency, number> = { low: 0, medium: 1, high: 2, critical: 3 };

const SynthesisSchema = z.object({
  title: z.string().describe("A concise English issue title for an MP's office, ≤80 chars"),
  title_hi: z.string().describe("The title in Hindi"),
  summary: z.string().describe("One neutral sentence describing the issue"),
  action: z.object({
    type: z.enum(["MPLADS", "STATE", "CENTRAL", "COORDINATION"]),
    title: z.string().describe("Short recommended-action title"),
    body: z.string().describe("One or two sentences the office could act on"),
    mplads_eligible: z.boolean(),
  }),
});
export type IssueSynthesis = z.infer<typeof SynthesisSchema>;

/** Pick the most common value; ties resolve to the first seen. */
function mode<T extends string>(vals: T[], fallback: T): T {
  const counts = new Map<T, number>();
  for (const v of vals) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = fallback;
  let bestN = 0;
  for (const [v, n] of counts) if (n > bestN) ((best = v), (bestN = n));
  return best;
}

export async function synthesizeIssue(signals: EnrichedSignal[]): Promise<IssueSynthesis> {
  const ward = mode(signals.map((s) => s.ward), "New Delhi");
  const category = mode(signals.map((s) => s.category as string), "other");

  if (!hasGeminiKey()) {
    const label = category.replace("_", " ");
    return {
      title: `${label.charAt(0).toUpperCase()}${label.slice(1)} concerns in ${ward}`,
      title_hi: `${ward} में ${label} संबंधी शिकायतें`,
      summary: signals[0]?.summary ?? "Aggregated civic concern from public signals.",
      action: {
        type: "COORDINATION",
        title: `Coordinate response on ${label} in ${ward}`,
        body: "Review the aggregated citizen and news signals and assign a coordinator.",
        mplads_eligible: false,
      },
    };
  }

  const list = signals
    .map((s, i) => `${i + 1}. [${s.source} · ${s.category} · ${s.urgency} · ${s.ward}] ${s.summary}`)
    .join("\n");
  const { object } = await generateObject({
    model: chatModel(),
    schema: SynthesisSchema,
    system:
      "You turn a set of civic signals (news + social) into ONE actionable issue for a " +
      "Member of Parliament's New Delhi office. Be concrete and neutral. Pick the action " +
      "pathway that fits: MPLADS (local dev fund works), STATE (state-subject escalation), " +
      "CENTRAL (central-govt), or COORDINATION (multi-agency follow-up).",
    prompt: `Signals grouped into one issue:\n\n${list}\n\nDominant ward: ${ward}. Synthesize the issue.`,
  });
  return object;
}

export function buildPromotedCluster(
  signals: EnrichedSignal[],
  synth: IssueSynthesis,
): DemoCluster {
  const ward = mode(signals.map((s) => s.ward), "New Delhi");
  const category = mode(signals.map((s) => s.category as string), "other") as Category;
  const urgency = signals
    .map((s) => s.urgency)
    .reduce((a, b) => (URGENCY_RANK[b] > URGENCY_RANK[a] ? b : a), "low" as Urgency);
  const centroid = WARD_CENTROIDS[ward] ?? CENTER;

  const source_breakdown: SourceBreakdown = {
    whatsapp: 0,
    twitter: 0,
    reddit: 0,
    widget: 0,
    portal: 0,
    news: 0,
    document: 0,
  };
  for (const s of signals) source_breakdown[s.source] += 1;

  // Evidence media pulled from the source posts/articles (tweet photo, RSS image).
  const media = signals
    .filter((s) => s.mediaUrl)
    .slice(0, 4)
    .map((s) => ({
      type: "image" as const,
      src: s.mediaUrl as string,
      aspect: "4/3" as const,
      alt: `Source media — ${s.handle}`,
      external: true,
    }));
  // Clickable links back to each origin post/article.
  const sourceLinks = signals.map((s) => ({ source: s.source, url: s.url, label: s.handle }));

  const now = ts(Date.now());
  return {
    id: `cl_p${Date.now().toString(36)}`,
    title: synth.title,
    title_hi: synth.title_hi,
    category,
    subcategory: category,
    geo: {
      constituency: "new-delhi-ls",
      ward,
      centroid,
      bounding_box: [centroid.lng - 0.01, centroid.lat - 0.01, centroid.lng + 0.01, centroid.lat + 0.01],
    },
    urgency,
    submission_ids: signals.map((s) => s.id),
    submission_count: signals.length,
    source_breakdown,
    trend: { current_week: signals.length, previous_week: 0, percent_change: 0 }, // isNew → "new"
    cross_reference: [],
    suggested_action: {
      type: synth.action.type,
      title: synth.action.title,
      body: synth.action.body,
      mplads_eligible: synth.action.mplads_eligible,
      compliance_notes: [],
    },
    rank_score: 60 + URGENCY_RANK[urgency] * 10, // fresh issues rank respectably
    status: "new",
    centroid_embedding: [],
    created_at: now,
    updated_at: now,
    ui: {
      wardLabel: ward === "Unknown" ? "New Delhi" : ward,
      crossRefProse: synth.summary,
      media: media.length ? media : undefined,
      sourceLinks,
    },
  };
}
