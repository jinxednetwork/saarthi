import { ActionComposer } from "@/components/action-composer/ActionComposer";
import { MapStage } from "@/components/dashboard/MapStage";

/**
 * Dashboard home — the map-centric command stage. Full-bleed constituency map
 * with glass panels floating over it: KPIs + priority queue (left), signal
 * sources + live feed (right), map toolbar at the bottom edge.
 */
export default function DashboardPage() {
  return (
    <>
      <MapStage />
      <ActionComposer />
    </>
  );
}
