import { NextResponse } from "next/server";
import type { Cluster, ClusterStatus } from "@saarthi/shared";
import { MOCK_CLUSTERS } from "@/lib/mock-data";

/**
 * GET /api/clusters — list clusters (§9.1). Filter by category / urgency / status.
 * Skeleton reads mock data; Phase 4 swaps in a Firestore query scoped by RBAC.
 */
export function GET(request: Request): NextResponse<Cluster[]> {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const urgency = searchParams.get("urgency");
  const status = searchParams.get("status") as ClusterStatus | null;

  let clusters = [...MOCK_CLUSTERS];
  if (category) clusters = clusters.filter((c) => c.category === category);
  if (urgency) clusters = clusters.filter((c) => c.urgency === urgency);
  if (status) clusters = clusters.filter((c) => c.status === status);
  clusters.sort((a, b) => b.rank_score - a.rank_score);

  return NextResponse.json(clusters);
}
