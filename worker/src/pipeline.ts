import type {
  Cluster,
  Submission,
  SubmissionSource,
  Urgency,
} from "@saarthi/shared";
import type { AiClient } from "./lib/ai-client";
import { ts } from "./lib/time";
import { findMatchingCluster, updateCentroid } from "./cluster/index";
import { computeRankComponents, scoreCluster } from "./rank/index";

/** Minimal raw input as it arrives from an intake channel (pre-enrichment). */
export interface RawSubmission {
  id: string;
  source: SubmissionSource;
  text: string;
  language?: string;
  constituency: string;
  ward: string;
  lat?: number;
  lng?: number;
  created_at_ms: number;
}

/**
 * Enrichment steps 1–9 (§7.7): translate → classify → embed → build Submission.
 * (STT / Vision / geocoding are stubbed here; they slot in ahead of classify.)
 */
export async function enrichSubmission(
  raw: RawSubmission,
  ai: AiClient,
): Promise<Submission> {
  const translated = await ai.translate(raw.text);
  const classification = await ai.classify(translated);
  const embedding = await ai.embed(translated);

  return {
    id: raw.id,
    source: raw.source,
    raw_text: raw.text,
    translated_text: translated,
    original_language: raw.language ?? "en",
    media: {},
    geo: {
      country: "IN",
      state: "Delhi",
      district: raw.constituency,
      constituency: raw.constituency,
      ward: raw.ward,
      lat: raw.lat,
      lng: raw.lng,
      confidence: raw.lat != null ? 0.9 : 0.5,
    },
    category: classification.category,
    subcategory: classification.subcategory,
    urgency: classification.urgency,
    credibility_score: classification.is_political_noise ? 0.3 : 0.8,
    is_political_noise: classification.is_political_noise,
    embedding,
    created_at: ts(raw.created_at_ms),
    processed_at: ts(raw.created_at_ms),
  };
}

export interface AssignmentResult {
  submission: Submission;
  clusterId: string;
  created: boolean;
}

/**
 * Cluster assignment step 10 (§7.7 / §8.1): attach to the best existing cluster or
 * spawn a new one. Mutates the matched cluster's membership + centroid in place.
 */
const URGENCY_ORDER: Urgency[] = ["low", "medium", "high", "critical"];
const higherUrgency = (a: Urgency, b: Urgency): Urgency =>
  URGENCY_ORDER.indexOf(b) > URGENCY_ORDER.indexOf(a) ? b : a;

export function assignToCluster(
  submission: Submission,
  clusters: Cluster[],
  nowMs: number,
): AssignmentResult {
  const match = findMatchingCluster(submission, clusters, nowMs);

  if (match) {
    const c = match.cluster;
    c.submission_ids.push(submission.id);
    c.submission_count += 1;
    c.source_breakdown[submission.source] += 1;
    const prior = c.submission_count - 1; // members before this one
    c.centroid_embedding = updateCentroid(
      c.centroid_embedding,
      prior,
      submission.embedding,
    );
    // Escalate urgency so a later critical report lifts the cluster's rank
    // (previously frozen at the first submission's urgency).
    c.urgency = higherUrgency(c.urgency, submission.urgency);
    // Roll the geographic centroid + bounding box forward too, not just the
    // embedding — otherwise proximity matching stays anchored to the seed point.
    if (submission.geo.lat != null && submission.geo.lng != null) {
      c.geo.centroid = {
        lat: (c.geo.centroid.lat * prior + submission.geo.lat) / (prior + 1),
        lng: (c.geo.centroid.lng * prior + submission.geo.lng) / (prior + 1),
      };
      const [minLng, minLat, maxLng, maxLat] = c.geo.bounding_box;
      c.geo.bounding_box = [
        Math.min(minLng, submission.geo.lng),
        Math.min(minLat, submission.geo.lat),
        Math.max(maxLng, submission.geo.lng),
        Math.max(maxLat, submission.geo.lat),
      ];
    }
    c.updated_at = submission.created_at;
    submission.cluster_id = c.id;
    return { submission, clusterId: c.id, created: false };
  }

  const newCluster = newClusterFromSubmission(submission);
  clusters.push(newCluster);
  submission.cluster_id = newCluster.id;
  return { submission, clusterId: newCluster.id, created: true };
}

function newClusterFromSubmission(s: Submission): Cluster {
  const centroid: [number, number] = [s.geo.lng ?? 0, s.geo.lat ?? 0];
  const ward = s.geo.ward ?? "unknown";
  return {
    id: `cl_${s.category}_${ward}_${s.id}`,
    title: `${s.category} — ${ward}`,
    title_hi: `${s.category} — ${ward}`,
    category: s.category,
    subcategory: s.subcategory,
    geo: {
      constituency: s.geo.constituency,
      ward,
      centroid: { lat: s.geo.lat ?? 0, lng: s.geo.lng ?? 0 },
      bounding_box: [centroid[0], centroid[1], centroid[0], centroid[1]],
    },
    urgency: s.urgency,
    submission_ids: [s.id],
    submission_count: 1,
    source_breakdown: {
      whatsapp: 0,
      twitter: 0,
      reddit: 0,
      widget: 0,
      portal: 0,
      news: 0,
      document: 0,
      [s.source]: 1,
    },
    trend: { current_week: 1, previous_week: 0, percent_change: 0 },
    cross_reference: [],
    suggested_action: {
      type: "COORDINATION",
      title: `Review ${s.category} issue in ${s.geo.ward}`,
      body: "",
      mplads_eligible: false,
      compliance_notes: [],
    },
    rank_score: 0,
    status: "new",
    centroid_embedding: [...s.embedding],
    created_at: s.created_at,
    updated_at: s.created_at,
  };
}

/** Ranking steps 13 (§8.3): recompute + persist components and score on a cluster. */
export function rankCluster(cluster: Cluster): Cluster {
  const components = computeRankComponents(cluster);
  cluster.rank_components = components;
  cluster.rank_score = scoreCluster(components);
  return cluster;
}
