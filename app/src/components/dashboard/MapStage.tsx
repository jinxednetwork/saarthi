"use client";

import { useEffect } from "react";
import { AssistantDock } from "@/components/assistant/AssistantDock";
import { ConstituencyMap } from "@/components/map/ConstituencyMap";
import { MapToolbar } from "@/components/map/MapToolbar";
import { LiveFeed } from "@/components/live-feed/LiveFeed";
import { KpiStack } from "@/components/panels/KpiStack";
import { RadialHubTile } from "@/components/panels/RadialHubTile";
import { PriorityQueue } from "@/components/priority-queue/PriorityQueue";
import { useDashboardStore } from "@/lib/dashboard-store";

/**
 * The dashboard stage: full-bleed map with glass panels floating over it.
 *
 * ≥lg: map absolute inset-0; a pointer-events-none overlay grid floats the
 * panels. Pointer events re-enable ON EACH PANEL (CollapsiblePanel root), not
 * on the columns — so space freed by a collapsed panel is genuinely
 * map-draggable. `isolate` contains Leaflet's internal z-indexes.
 *
 * <lg: the same components stack in normal document flow; map becomes a
 * fixed-height block. One DOM — the map node never remounts across the fork.
 */
export function MapStage() {
  const { activeFilter, selectCluster, hydratePanels } = useDashboardStore();

  useEffect(() => {
    hydratePanels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="isolate h-full overflow-y-auto pt-16 lg:relative lg:overflow-hidden lg:pt-0">
      {/* Map — block on mobile, full-bleed behind panels on lg+ */}
      <div className="relative z-0 mx-4 h-[45vh] overflow-hidden rounded-xl lg:absolute lg:inset-0 lg:m-0 lg:h-auto lg:rounded-none">
        <ConstituencyMap filter={activeFilter} onSelect={selectCluster} />
      </div>

      {/* Mobile-only toolbar (directly under the map in flow) */}
      <div className="mt-3 px-4 lg:hidden">
        <MapToolbar />
      </div>

      {/* Floating panel overlay — columns never take pointer events */}
      <div className="mt-4 flex flex-col gap-3 px-4 pb-6 lg:pointer-events-none lg:absolute lg:inset-0 lg:z-10 lg:mt-0 lg:grid lg:grid-cols-[340px_minmax(0,1fr)_340px] lg:gap-4 lg:p-4 lg:pb-14 lg:pt-[72px] xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        {/* Left: KPIs + queue */}
        <div className="flex min-h-0 flex-col gap-3">
          <KpiStack />
          <PriorityQueue />
        </div>

        {/* Centre: map breathing room; assistant island + toolbar at the bottom */}
        <div className="hidden min-h-0 flex-col items-center justify-end gap-2.5 lg:flex">
          <AssistantDock />
          <MapToolbar />
        </div>

        {/* Right: signal sources + live feed */}
        <div className="flex min-h-0 flex-col gap-3">
          <RadialHubTile />
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
