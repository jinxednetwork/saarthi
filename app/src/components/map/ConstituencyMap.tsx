"use client";

import { useEffect, useState } from "react";
import type { MapFilter } from "@/lib/dashboard-store";
import { GoogleConstituencyMap } from "./GoogleConstituencyMap";
import { LeafletConstituencyMap } from "./LeafletConstituencyMap";

// Re-exported so existing consumers (e.g. the cluster drawer's "View on map")
// keep importing from ConstituencyMap regardless of the active engine.
export { flyToCluster } from "./mapRegistry";

/**
 * Full-bleed constituency stage (the dashboard's hero). Picks the map engine at
 * runtime: Google Maps Platform when a browser key is configured
 * (GOOGLE_MAPS_API_KEY → /api/config), else the key-free Leaflet + CARTO
 * fallback — so the map always renders, with or without a key.
 */
export function ConstituencyMap({
  filter,
  onSelect,
}: {
  filter: MapFilter;
  onSelect?: (clusterId: string) => void;
}) {
  const [cfg, setCfg] = useState<{ loaded: boolean; apiKey: string | null }>({
    loaded: false,
    apiKey: null,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : { mapsApiKey: null }))
      .then((d: { mapsApiKey: string | null }) => {
        if (active) setCfg({ loaded: true, apiKey: d.mapsApiKey });
      })
      .catch(() => {
        if (active) setCfg({ loaded: true, apiKey: null });
      });
    return () => {
      active = false;
    };
  }, []);

  // Hold the map-canvas colour while we resolve which engine to mount.
  if (!cfg.loaded) return <div className="h-full w-full bg-[hsl(var(--map-canvas))]" />;

  return cfg.apiKey ? (
    <GoogleConstituencyMap apiKey={cfg.apiKey} filter={filter} onSelect={onSelect} />
  ) : (
    <LeafletConstituencyMap filter={filter} onSelect={onSelect} />
  );
}
