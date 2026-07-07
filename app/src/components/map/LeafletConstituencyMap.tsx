"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { useTheme } from "next-themes";
import type { Urgency } from "@saarthi/shared";
import { groupOf } from "@/lib/categories";
import { useDashboardStore, type MapFilter } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS, type DemoCluster } from "@/lib/mock-data";
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
  const highlightedClusterId = useDashboardStore((s) => s.highlightedClusterId);
  const highlightedClusterIdRef = useRef(highlightedClusterId);
  highlightedClusterIdRef.current = highlightedClusterId;
  const urgencyEmphasis = useDashboardStore((s) => s.urgencyEmphasis);
  const urgencyEmphasisRef = useRef(urgencyEmphasis);
  urgencyEmphasisRef.current = urgencyEmphasis;
  const liveEvents = useDashboardStore((s) => s.liveEvents);
  const liveEventsRef = useRef(liveEvents);
  liveEventsRef.current = liveEvents;
  const closedClusterIds = useDashboardStore((s) => s.closedClusterIds);
  const closedClusterIdsRef = useRef(closedClusterIds);
  closedClusterIdsRef.current = closedClusterIds;
  const promotedClusters = useDashboardStore((s) => s.promotedClusters);
  const promotedClustersRef = useRef(promotedClusters);
  promotedClustersRef.current = promotedClusters;

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
      mapRegistry.flyTo = (lat, lng, zoom) => map.flyTo([lat, lng], zoom ?? 14, { duration: 0.8 });
      mapRegistry.focusArea = (focus) => focusAreaLeaflet(L, map, focus);
      mapRegistry.recenter = (lat, lng) => map.panTo([lat, lng], { animate: true, duration: 0.8 }); // eased pan, no zoom change
      renderMarkers(
        L,
        map,
        layerRef,
        filter,
        highlightedClusterIdRef.current,
        urgencyEmphasisRef.current,
        liveEventsRef.current,
        closedClusterIdsRef.current,
        promotedClustersRef.current,
        (id) => onSelectRef.current?.(id),
      );
      // Drain a focus queued by a cross-page assistant jump.
      const pending = useDashboardStore.getState().consumePendingFocus();
      if (pending) {
        if (pending.radiusM != null) focusAreaLeaflet(L, map, pending);
        else map.flyTo([pending.lat, pending.lng], pending.zoom ?? 14, { duration: 0.8 });
      }
    })();
    return () => {
      cancelled = true;
      mapRegistry.flyTo = null;
      mapRegistry.focusArea = null;
      mapRegistry.recenter = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme → tile swap, no re-init
  useEffect(() => {
    tileRef.current?.setUrl(resolvedTheme === "dark" ? TILE_DARK : TILE_LIGHT);
  }, [resolvedTheme]);

  // Filter/highlight/urgency/live-events → re-render markers
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (L && map)
      renderMarkers(
        L,
        map,
        layerRef,
        filter,
        highlightedClusterId,
        urgencyEmphasis,
        liveEvents,
        closedClusterIds,
        promotedClusters,
        (id) => onSelectRef.current?.(id),
      );
  }, [filter, highlightedClusterId, urgencyEmphasis, liveEvents, closedClusterIds, promotedClusters]);

  return <div ref={containerRef} className="h-full w-full bg-[hsl(var(--map-canvas))]" />;
}

/**
 * Frame a hotspot area: fly the camera to the zone, then draw a saffron circle
 * that pulses out and fades before auto-removing. No new dependency — a short
 * interval grows the radius (map-space analogue of the marker halo ring).
 */
function focusAreaLeaflet(
  L: typeof Leaflet,
  map: Leaflet.Map,
  focus: { lat: number; lng: number; radiusM?: number },
) {
  const radius = focus.radiusM ?? 700;
  const circle = L.circle([focus.lat, focus.lng], {
    radius,
    color: "hsl(28 90% 55%)",
    weight: 2,
    opacity: 0.9,
    fillColor: "hsl(28 90% 55%)",
    fillOpacity: 0.12,
    interactive: false,
  }).addTo(map);
  map.flyToBounds(circle.getBounds(), { duration: 0.8, padding: [48, 48] });

  let t = 0;
  const timer = window.setInterval(() => {
    t += 0.06;
    const phase = t % 1;
    circle.setRadius(radius * (1 + phase * 0.6));
    circle.setStyle({ opacity: 0.9 * (1 - phase), fillOpacity: 0.12 * (1 - phase) });
    if (t >= 2) {
      window.clearInterval(timer);
      circle.remove();
    }
  }, 40);
}

function renderMarkers(
  L: typeof Leaflet,
  map: Leaflet.Map,
  layerRef: React.MutableRefObject<Leaflet.LayerGroup | null>,
  filter: MapFilter,
  highlightedClusterId: string | null,
  urgencyEmphasis: Urgency[],
  liveEvents: DemoCluster[],
  closedClusterIds: string[],
  promotedClusters: DemoCluster[],
  onSelect: (clusterId: string) => void,
) {
  layerRef.current?.remove();
  const layer = L.layerGroup().addTo(map);
  layerRef.current = layer;

  // Mirror the Google engine: promoted issues get markers, closed issues are muted.
  for (const c of [...MOCK_CLUSTERS, ...liveEvents, ...promotedClusters]) {
    if (filter !== "all" && groupOf(c.category) !== filter) continue;
    const size = MARKER_SIZE[c.urgency];
    const u = URGENCY_UI[c.urgency];
    const isClosed = closedClusterIds.includes(c.id);
    const isCritical = c.urgency === "critical" && !isClosed;
    const isHighlighted = c.id === highlightedClusterId;
    const dotColor = isClosed ? "hsl(var(--muted-foreground))" : u.dot;
    const dimmed = urgencyEmphasis.length > 0 && !urgencyEmphasis.includes(c.urgency);
    const opacity = isClosed ? 0.45 : dimmed ? 0.2 : 1;
    const html = `
      <div style="position:relative;width:${size}px;height:${size}px;opacity:${opacity};transition:opacity 0.3s;">
        ${
          isCritical
            ? `<div style="position:absolute;inset:0;border-radius:50%;background:${dotColor};opacity:0.5;animation: halo 1.8s ease-out infinite;"></div>`
            : ""
        }
        ${
          isHighlighted
            ? `<div style="position:absolute;inset:-10px;border-radius:50%;border:2px solid hsl(var(--saffron));animation: halo 0.6s ease-out 3 forwards;"></div>`
            : ""
        }
        <div style="position:absolute;inset:0;border-radius:50%;background:${dotColor};border:2px solid hsl(var(--surface));box-shadow: 0 0 0 1px ${dotColor}, 0 2px 6px rgba(0,0,0,0.3);"></div>
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
    // Enter + Space activation. Leaflet only forwards keypress/Enter to markers,
    // so bind a native keydown on the icon element to match the Google engine.
    const el = marker.getElement();
    if (el) {
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onSelect(c.id);
        }
      });
    }
  }
}
