import { CLUSTER_THRESHOLDS } from "@saarthi/shared";
import type { Cluster, LatLng, Submission } from "@saarthi/shared";

/** Cosine similarity of two equal-length vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** Great-circle distance in kilometres (Haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface ClusterMatch {
  cluster: Cluster;
  similarity: number;
  distanceKm: number;
}

/**
 * Assign a submission to the best existing cluster, or return null to create a new
 * one. All three thresholds (§8.1) must hold: cosine > 0.82 AND ≤2km AND ≤14 days.
 */
export function findMatchingCluster(
  submission: Submission,
  candidates: Cluster[],
  nowMs: number,
): ClusterMatch | null {
  let best: ClusterMatch | null = null;
  for (const cluster of candidates) {
    const similarity = cosineSimilarity(submission.embedding, cluster.centroid_embedding);
    if (similarity <= CLUSTER_THRESHOLDS.minCosineSimilarity) continue;

    const ageDays = (nowMs - cluster.updated_at.toMillis()) / 86_400_000;
    if (ageDays > CLUSTER_THRESHOLDS.maxWindowDays) continue;

    let distanceKm = 0;
    if (submission.geo.lat != null && submission.geo.lng != null) {
      distanceKm = haversineKm(
        { lat: submission.geo.lat, lng: submission.geo.lng },
        cluster.geo.centroid,
      );
      if (distanceKm > CLUSTER_THRESHOLDS.maxDistanceKm) continue;
    }

    if (!best || similarity > best.similarity) {
      best = { cluster, similarity, distanceKm };
    }
  }
  return best;
}

/** Running-mean update of a cluster centroid when a member is added (§8.1). */
export function updateCentroid(
  centroid: number[],
  count: number,
  incoming: number[],
): number[] {
  if (centroid.length === 0) return [...incoming];
  return centroid.map((c, i) => (c * count + (incoming[i] ?? 0)) / (count + 1));
}
