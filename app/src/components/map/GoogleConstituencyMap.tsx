"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useTheme } from "next-themes";
import type { Urgency } from "@saarthi/shared";
import { groupOf } from "@/lib/categories";
import { useDashboardStore, type MapFilter } from "@/lib/dashboard-store";
import { MAP_STYLE_DARK, MAP_STYLE_LIGHT } from "@/lib/map-styles";
import { MOCK_CLUSTERS, type DemoCluster } from "@/lib/mock-data";
import { URGENCY_UI } from "@/lib/ui";
import { mapRegistry } from "./mapRegistry";

const MARKER_SIZE = { critical: 22, high: 17, medium: 14, low: 14 } as const;
const CENTER = { lat: 28.59, lng: 77.19 };

/**
 * Google Maps Platform stage (§3.2 of the handoff). Themed via in-code JSON
 * styles (no cloud Map ID needed), so dark/light swap instantly via setOptions —
 * matching the CARTO-tile behaviour it replaces. Markers are HTML OverlayViews,
 * so they keep the exact urgency dots + critical pulse and retheme through CSS
 * vars; each is a focusable role=button for keyboard parity with Leaflet.
 * Registers its pan handler on `mapRegistry` for the drawer's "View on map".
 */
export function GoogleConstituencyMap({
  apiKey,
  filter,
  onSelect,
}: {
  apiKey: string;
  filter: MapFilter;
  onSelect?: (clusterId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<google.maps.OverlayView[]>([]);
  const filterRef = useRef(filter);
  filterRef.current = filter;
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
    const loader = new Loader({ apiKey, version: "weekly" });
    loader
      .importLibrary("maps")
      .then(({ Map }) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const isDark = document.documentElement.classList.contains("dark");
        const map = new Map(containerRef.current, {
          center: CENTER,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          keyboardShortcuts: true,
          clickableIcons: false,
          styles: isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT,
          backgroundColor: isDark ? "#0e1626" : "#f2eee4",
          gestureHandling: "greedy",
        });
        mapRef.current = map;
        mapRegistry.flyTo = (lat, lng, zoom) => {
          map.panTo({ lat, lng });
          smoothZoomTo(map, zoom ?? 15);
        };
        mapRegistry.focusArea = (focus) => focusAreaGoogle(map, focus);
        mapRegistry.recenter = (lat, lng) => map.panTo({ lat, lng }); // native eased pan, no zoom change
        renderMarkers(
          map,
          overlaysRef,
          filterRef.current,
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
          if (pending.radiusM != null) focusAreaGoogle(map, pending);
          else {
            map.panTo({ lat: pending.lat, lng: pending.lng });
            smoothZoomTo(map, pending.zoom ?? 15);
          }
        }
      })
      .catch((err) => console.error("[map] Google Maps failed to load:", err));
    return () => {
      cancelled = true;
      mapRegistry.flyTo = null;
      mapRegistry.focusArea = null;
      mapRegistry.recenter = null;
      clearOverlays(overlaysRef);
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Theme → restyle, no re-init
  useEffect(() => {
    mapRef.current?.setOptions({
      styles: resolvedTheme === "dark" ? MAP_STYLE_DARK : MAP_STYLE_LIGHT,
    });
  }, [resolvedTheme]);

  // Filter/highlight/urgency/live-events → re-render markers
  useEffect(() => {
    if (mapRef.current) {
      renderMarkers(
        mapRef.current,
        overlaysRef,
        filter,
        highlightedClusterId,
        urgencyEmphasis,
        liveEvents,
        closedClusterIds,
        promotedClusters,
        (id) => onSelectRef.current?.(id),
      );
    }
  }, [filter, highlightedClusterId, urgencyEmphasis, liveEvents, closedClusterIds, promotedClusters]);

  return <div ref={containerRef} className="saarthi-gmap h-full w-full bg-[hsl(var(--map-canvas))]" />;
}

// ponytail: integer step-zoom polyfill — Maps JS smooth zoom needs a vector Map
// ID, which would drop the in-code JSON theming above; a stepped setTimeout is
// simpler than rAF since zoom levels are integers anyway, and reads as eased at
// demo scale. Upgrade to a vector-map easing API if that theming trade-off changes.
function smoothZoomTo(map: google.maps.Map, target: number) {
  const cur = Math.round(map.getZoom() ?? target);
  const step = cur < target ? 1 : cur > target ? -1 : 0;
  if (!step) return;
  map.setZoom(cur + step);
  window.setTimeout(() => smoothZoomTo(map, target), 180);
}

/**
 * Frame a hotspot area: fit the camera to the zone, then draw a saffron circle
 * that pulses out and fades (map-space analogue of the marker halo) before
 * auto-removing. No new dependency — a short interval grows the radius.
 */
function focusAreaGoogle(map: google.maps.Map, focus: { lat: number; lng: number; radiusM?: number }) {
  const center = { lat: focus.lat, lng: focus.lng };
  const radius = focus.radiusM ?? 700;
  const circle = new google.maps.Circle({
    map,
    center,
    radius,
    strokeColor: "hsl(28 90% 55%)",
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: "hsl(28 90% 55%)",
    fillOpacity: 0.12,
    clickable: false,
  });
  const bounds = circle.getBounds();
  if (bounds) map.fitBounds(bounds, 64);

  // Pulse: grow + fade twice, then remove.
  let t = 0;
  const timer = window.setInterval(() => {
    t += 0.06;
    const phase = t % 1;
    circle.setRadius(radius * (1 + phase * 0.6));
    circle.setOptions({ strokeOpacity: 0.9 * (1 - phase), fillOpacity: 0.12 * (1 - phase) });
    if (t >= 2) {
      window.clearInterval(timer);
      circle.setMap(null);
    }
  }, 40);
}

function clearOverlays(ref: React.MutableRefObject<google.maps.OverlayView[]>) {
  for (const o of ref.current) o.setMap(null);
  ref.current = [];
}

function renderMarkers(
  map: google.maps.Map,
  overlaysRef: React.MutableRefObject<google.maps.OverlayView[]>,
  filter: MapFilter,
  highlightedClusterId: string | null,
  urgencyEmphasis: Urgency[],
  liveEvents: DemoCluster[],
  closedClusterIds: string[],
  promotedClusters: DemoCluster[],
  onSelect: (clusterId: string) => void,
) {
  clearOverlays(overlaysRef);

  const promotedIds = new Set(promotedClusters.map((c) => c.id));
  for (const c of [...MOCK_CLUSTERS, ...liveEvents, ...promotedClusters]) {
    if (filter !== "all" && groupOf(c.category) !== filter) continue;
    const size = MARKER_SIZE[c.urgency];
    const u = URGENCY_UI[c.urgency];
    const isClosed = closedClusterIds.includes(c.id);
    const isPromoted = promotedIds.has(c.id);
    const isCritical = c.urgency === "critical" && !isClosed;
    const isHighlighted = c.id === highlightedClusterId;
    // A closed/resolved issue reads muted grey; urgency-emphasis dim is separate.
    const dotColor = isClosed ? "hsl(var(--muted-foreground))" : u.dot;
    const dimmed = isClosed || (urgencyEmphasis.length > 0 && !urgencyEmphasis.includes(c.urgency));

    const el = document.createElement("div");
    el.className = "saarthi-gmarker";
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${c.title} — ${c.ui.wardLabel}, ${u.label}`);
    el.title = `${c.title} · ${c.ui.wardLabel} · ${u.label}`;
    el.style.cssText = `position:absolute;width:${size}px;height:${size}px;transform:translate(-50%,-50%);cursor:pointer;opacity:${isClosed ? 0.45 : dimmed ? 0.2 : 1};transition:opacity 0.3s;`;
    el.innerHTML = `
      ${
        isCritical
          ? `<span style="position:absolute;inset:0;border-radius:50%;background:${dotColor};opacity:0.5;animation:halo 1.8s ease-out infinite;"></span>`
          : ""
      }
      ${
        isPromoted
          ? `<span style="position:absolute;inset:-6px;border-radius:50%;border:2px solid hsl(var(--saffron));opacity:0.7;"></span>`
          : ""
      }
      ${
        isHighlighted
          ? `<span style="position:absolute;inset:-10px;border-radius:50%;border:2px solid hsl(var(--saffron));animation:halo 0.6s ease-out 3 forwards;"></span>`
          : ""
      }
      <span style="position:absolute;inset:0;border-radius:50%;background:${dotColor};border:2px solid hsl(var(--surface));box-shadow:0 0 0 1px ${dotColor},0 2px 6px rgba(0,0,0,0.3);"></span>`;
    el.addEventListener("click", () => onSelect(c.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(c.id);
      }
    });

    const overlay = makeMarker(map, { lat: c.geo.centroid.lat, lng: c.geo.centroid.lng }, el);
    overlaysRef.current.push(overlay);
  }
}

/**
 * Minimal HTML marker over a JSON-styled (raster) map. AdvancedMarkerElement
 * would need a cloud Map ID (which disables in-code JSON styling), so we place
 * the element via an OverlayView on the overlayMouseTarget pane (clicks + focus).
 */
function makeMarker(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  el: HTMLElement,
): google.maps.OverlayView {
  const overlay = new google.maps.OverlayView();
  overlay.onAdd = function () {
    this.getPanes()!.overlayMouseTarget.appendChild(el);
  };
  overlay.draw = function () {
    const p = this.getProjection()?.fromLatLngToDivPixel(new google.maps.LatLng(position));
    if (p) {
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
    }
  };
  overlay.onRemove = function () {
    el.remove();
  };
  overlay.setMap(map);
  return overlay;
}
