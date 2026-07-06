/**
 * Google Maps JSON styles for the two themes (§ DESIGN "Command Deck"):
 * dark = command-center navy-black, light = warm "Apple Maps daytime" off-white.
 * Both are deliberately muted — roads/POI/transit dimmed or hidden — so the
 * frosted glass panels and the meaning-locked urgency markers stay legible on top.
 *
 * Hex is unavoidable here: the Maps styling API takes only hex, not the app's
 * HSL vars. These values track --map-canvas / --surface for each theme; keep
 * them in sync if the tokens move. This is the one sanctioned hex exception.
 */
export const MAP_STYLE_DARK: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b6b86" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }, { weight: 2 }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a3a55" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#8798b5" }] },
  { featureType: "administrative.neighborhood", elementType: "labels.text.fill", stylers: [{ color: "#6d7d9c" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2740" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#27395d" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1120" }] },
];

export const MAP_STYLE_LIGHT: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f2eee4" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8371" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f6f2ea" }, { weight: 2 }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#d9d1c0" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6f6957" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#f8f3e9" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#efe7d6" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d6dd" }] },
];
