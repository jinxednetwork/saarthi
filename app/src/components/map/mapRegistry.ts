/**
 * Engine-agnostic handle so callers outside React (the cluster drawer's "View
 * on map", the assistant store) can drive the map regardless of which engine is
 * mounted (Google Maps when a key is configured, the Leaflet fallback otherwise).
 * Whichever map mounts registers its `flyTo` / `focusArea`.
 */

/** A place to frame the camera on. `radiusM` set → draw a pulsing zone circle. */
export interface MapFocus {
  lat: number;
  lng: number;
  zoom?: number;
  radiusM?: number;
}

export const mapRegistry: {
  flyTo: ((lat: number, lng: number, zoom?: number) => void) | null;
  focusArea: ((focus: MapFocus) => void) | null;
  recenter: ((lat: number, lng: number) => void) | null;
} = {
  flyTo: null,
  focusArea: null,
  recenter: null,
};

export function flyToCluster(lat: number, lng: number, zoom?: number) {
  mapRegistry.flyTo?.(lat, lng, zoom);
}

/** Frame a hotspot area (and pulse a zone ring if `radiusM` is set). */
export function focusMapArea(focus: MapFocus) {
  mapRegistry.focusArea?.(focus);
}

/** Gently ease-pan the map to a point WITHOUT changing zoom (radar re-centre). */
export function recenterMap(lat: number, lng: number) {
  mapRegistry.recenter?.(lat, lng);
}
