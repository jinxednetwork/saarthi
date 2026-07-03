import type { ActionPathway, Cluster } from "@saarthi/shared";

/**
 * Action tagging (§8.5): decide the pathway (MPLADS / STATE / CENTRAL / COORDINATION)
 * for a cluster and draft suggested body text.
 *
 * TODO(Phase 3): replace this heuristic with a Gemini Pro call that reasons over the
 * cluster + cross-references + MPLADS headroom and drafts the action body.
 */
export function suggestPathway(cluster: Cluster): ActionPathway {
  if (cluster.category === "air_quality") return "COORDINATION";
  if (cluster.category === "health") return "STATE";
  if (cluster.suggested_action.mplads_eligible) return "MPLADS";
  return "COORDINATION";
}
