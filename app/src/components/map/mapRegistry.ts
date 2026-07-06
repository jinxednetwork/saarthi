/**
 * Engine-agnostic handle so the cluster drawer's "View on map" pans the map
 * regardless of which engine is mounted (Google Maps when a key is configured,
 * the Leaflet fallback otherwise). Whichever map mounts registers its `flyTo`.
 */
export const mapRegistry: { flyTo: ((lat: number, lng: number) => void) | null } = {
  flyTo: null,
};

export function flyToCluster(lat: number, lng: number) {
  mapRegistry.flyTo?.(lat, lng);
}
