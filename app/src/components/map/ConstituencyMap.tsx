"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { groupOf } from "@/lib/categories";
import type { MapFilter } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS } from "@/lib/mock-data";
import { URGENCY_UI } from "@/lib/ui";

const MARKER_SIZE = { critical: 20, high: 16, medium: 13, low: 13 } as const;

/**
 * Leaflet cluster map (design: CARTO light tiles, urgency-coloured dot markers,
 * pulsing halo on critical). Client-only — the parent imports this with
 * `dynamic(..., { ssr: false })`.
 *
 * NOTE: the engineering handoff (§3.2) locks Google Maps Platform; the design
 * prototype ships Leaflet + CARTO (key-free). Swapping later only touches this
 * file — the section interface (filter in, markers out) stays put.
 */
export function ConstituencyMap({ filter }: { filter: MapFilter }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);

  // Init once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center: [28.59, 77.205],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
        preferCanvas: true,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      renderMarkers(L, map, layerRef, filter);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render markers on filter change
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (L && map) renderMarkers(L, map, layerRef, filter);
  }, [filter]);

  return <div ref={containerRef} className="h-[500px] w-full bg-[#E8E2D0]" />;
}

function renderMarkers(
  L: typeof Leaflet,
  map: Leaflet.Map,
  layerRef: React.MutableRefObject<Leaflet.LayerGroup | null>,
  filter: MapFilter,
) {
  layerRef.current?.remove();
  const layer = L.layerGroup().addTo(map);
  layerRef.current = layer;

  for (const c of MOCK_CLUSTERS) {
    if (filter !== "all" && groupOf(c.category) !== filter) continue;
    const size = MARKER_SIZE[c.urgency];
    const u = URGENCY_UI[c.urgency];
    const isCritical = c.urgency === "critical";
    const html = `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${
          isCritical
            ? `<div style="position:absolute;inset:0;border-radius:50%;background:${u.dot};opacity:0.5;animation: halo 1.8s ease-out infinite;"></div>`
            : ""
        }
        <div style="position:absolute;inset:0;border-radius:50%;background:${u.dot};border:2px solid #FFFFFF;box-shadow: 0 0 0 1px ${u.dot}, 0 2px 4px rgba(0,0,0,0.2);"></div>
      </div>`;
    const icon = L.divIcon({
      className: "saarthi-marker",
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    L.marker([c.geo.centroid.lat, c.geo.centroid.lng], { icon })
      .addTo(layer)
      .bindTooltip(
        `<div style="font-weight:600;margin-bottom:2px;">${c.title}</div>
         <div style="opacity:0.7;font-size:11px;">${c.ui.wardLabel} · ${u.label}</div>`,
        { direction: "top", offset: [0, -size / 2], className: "saarthi-tt" },
      );
  }
}
