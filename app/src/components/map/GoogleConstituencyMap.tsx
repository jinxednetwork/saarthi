"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useTheme } from "next-themes";
import { groupOf } from "@/lib/categories";
import type { MapFilter } from "@/lib/dashboard-store";
import { MAP_STYLE_DARK, MAP_STYLE_LIGHT } from "@/lib/map-styles";
import { MOCK_CLUSTERS } from "@/lib/mock-data";
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
        mapRegistry.flyTo = (lat, lng) => {
          map.panTo({ lat, lng });
          map.setZoom(15);
        };
        renderMarkers(map, overlaysRef, filterRef.current, (id) => onSelectRef.current?.(id));
      })
      .catch((err) => console.error("[map] Google Maps failed to load:", err));
    return () => {
      cancelled = true;
      mapRegistry.flyTo = null;
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

  // Filter → re-render markers
  useEffect(() => {
    if (mapRef.current) {
      renderMarkers(mapRef.current, overlaysRef, filter, (id) => onSelectRef.current?.(id));
    }
  }, [filter]);

  return <div ref={containerRef} className="saarthi-gmap h-full w-full bg-[hsl(var(--map-canvas))]" />;
}

function clearOverlays(ref: React.MutableRefObject<google.maps.OverlayView[]>) {
  for (const o of ref.current) o.setMap(null);
  ref.current = [];
}

function renderMarkers(
  map: google.maps.Map,
  overlaysRef: React.MutableRefObject<google.maps.OverlayView[]>,
  filter: MapFilter,
  onSelect: (clusterId: string) => void,
) {
  clearOverlays(overlaysRef);

  for (const c of MOCK_CLUSTERS) {
    if (filter !== "all" && groupOf(c.category) !== filter) continue;
    const size = MARKER_SIZE[c.urgency];
    const u = URGENCY_UI[c.urgency];
    const isCritical = c.urgency === "critical";

    const el = document.createElement("div");
    el.className = "saarthi-gmarker";
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${c.title} — ${c.ui.wardLabel}, ${u.label}`);
    el.title = `${c.title} · ${c.ui.wardLabel} · ${u.label}`;
    el.style.cssText = `position:absolute;width:${size}px;height:${size}px;transform:translate(-50%,-50%);cursor:pointer;`;
    el.innerHTML = `
      ${
        isCritical
          ? `<span style="position:absolute;inset:0;border-radius:50%;background:${u.dot};opacity:0.5;animation:halo 1.8s ease-out infinite;"></span>`
          : ""
      }
      <span style="position:absolute;inset:0;border-radius:50%;background:${u.dot};border:2px solid hsl(var(--surface));box-shadow:0 0 0 1px ${u.dot},0 2px 6px rgba(0,0,0,0.3);"></span>`;
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
