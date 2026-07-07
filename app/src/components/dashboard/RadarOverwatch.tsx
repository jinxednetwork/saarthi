"use client";

import { useEffect } from "react";
import { recenterMap } from "@/components/map/mapRegistry";
import { useDashboardStore } from "@/lib/dashboard-store";
import { makeLiveEvent } from "@/lib/mock-data";

/**
 * AI overwatch: while radar is on, every ~12s a synthetic "just now" event lands
 * on the map; Saarthi gently ease-pans to re-centre on it (no zoom change) and
 * pulses a highlight ring. Renders nothing — the interval lives in a component
 * (per the store's "feed tick stays in components" convention), gated on `radarOn`.
 */
export function RadarOverwatch() {
  const radarOn = useDashboardStore((s) => s.radarOn);

  useEffect(() => {
    if (!radarOn) return;
    let n = 0;
    const spawn = () => {
      const evt = makeLiveEvent(n++);
      const { addLiveEvent, highlightCluster } = useDashboardStore.getState();
      addLiveEvent(evt);
      highlightCluster(evt.id);
      recenterMap(evt.geo.centroid.lat, evt.geo.centroid.lng);
    };
    const timer = setInterval(spawn, 12_000);
    const kickoff = setTimeout(spawn, 1_500); // first event soon after switching on
    return () => {
      clearInterval(timer);
      clearTimeout(kickoff);
    };
  }, [radarOn]);

  return null;
}
