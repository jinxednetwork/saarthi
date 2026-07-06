import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public client config. Only exposes values that are safe in the browser — the
 * Maps JavaScript key is one (Google Maps runs client-side; the key is locked
 * to the Maps JS API and to our origins by HTTP-referrer restriction). Absent
 * key → the dashboard renders the key-free Leaflet fallback instead.
 */
export function GET() {
  return NextResponse.json(
    { mapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? null },
    { headers: { "cache-control": "no-store" } },
  );
}
