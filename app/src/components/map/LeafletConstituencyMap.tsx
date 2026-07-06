"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { useTheme } from "next-themes";
import { groupOf } from "@/lib/categories";
import type { MapFilter } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS } from "@/lib/mock-data";
import { URGENCY_UI } from "@/lib/ui";
import { mapRegistry } from "./mapRegistry";

const MARKER_SIZE = { critical: 22, high: 17, medium: 14, low: 14 } as const;
const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

/**
 * Key-free fallback stage (Leaflet + CARTO tiles). Used when no Google Maps key
 * is configured, so the dashboard always shows a live map. Theme switches tiles
 * via setUrl — no re-init. Markers are keyboard-focusable and click through to
 * the cluster drawer via onSelect. Registers its pan handler on `mapRegistry`.
 */
export function LeafletConstituencyMap({
  filter,
  onSelect,
}: {
  filter: MapFilter;
  onSelect?: (clusterId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const tileRef = useRef<Leaflet.TileLayer | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const { resolvedTheme } = useTheme();

  // Init once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center: [28.59, 77.19],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: true,
        preferCanvas: true,
        keyboard: true,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      const isDark = document.documentElement.classList.contains("dark");
      tileRef.current = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      mapRegistry.flyTo = (lat, lng) => map.flyTo([lat, lng], 14, { duration: 0.8 });
      renderMarkers(L, map, layerRef, filter, (id) => onSelectRef.current?.(id));
    })();
    return () => {
      cancelled = true;
      mapRegistry.flyTo = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme → tile swap, no re-init
  useEffect(() => {
    tileRef.current?.setUrl(resolvedTheme === "dark" ? TILE_DARK : TILE_LIGHT);
  }, [resolvedTheme]);

  // Filter → re-render markers
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (L && map) renderMarkers(L, map, layerRef, filter, (id) => onSelectRef.current?.(id));
  }, [filter]);

  return <div ref={containerRef} className="h-full w-full bg-[hsl(var(--map-canvas))]" />;
}

function renderMarkers(
  L: typeof Leaflet,
  map: Leaflet.Map,
  layerRef: React.MutableRefObject<Leaflet.LayerGroup | null>,
  filter: MapFilter,
  onSelect: (clusterId: string) => void,
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
        <div style="position:absolute;inset:0;border-radius:50%;background:${u.dot};border:2px solid hsl(var(--surface));box-shadow: 0 0 0 1px ${u.dot}, 0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>`;
    const icon = L.divIcon({
      className: "saarthi-marker",
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    const marker = L.marker([c.geo.centroid.lat, c.geo.centroid.lng], {
      icon,
      keyboard: true,
      alt: `${c.title} — ${c.ui.wardLabel}, ${u.label}`,
    }).addTo(layer);
    marker.bindTooltip(
      `<div style="font-weight:600;margin-bottom:2px;">${c.title}</div>
       <div style="opacity:0.7;font-size:11px;">${c.ui.wardLabel} · ${u.label} · click for detail</div>`,
      { direction: "top", offset: [0, -size / 2], className: "saarthi-tt" },
    );
    marker.on("click", () => onSelect(c.id));
    marker.on("keypress", (e) => {
      if ((e.originalEvent as KeyboardEvent).key === "Enter") onSelect(c.id);
    });
  }
}
