import type { MapFocus } from "@/components/map/mapRegistry";
import { MOCK_CLUSTERS, MOCK_CONSTITUENCY } from "./mock-data";
import { groupOf, type CategoryGroup } from "./categories";
import type { DemoCluster } from "./mock-data";

/**
 * Voice/command-shaped queries — "show me water issues", "open cases related
 * to roads", "highlight Karol Bagh", "take me to MPLADS", "resume where I left
 * off". Mirrors assistant-brain.ts's Intent shape (plain regex, no NLU/Gemini)
 * but resolves to a side-effect-free action descriptor; the caller
 * (dashboard-store) applies it. Runs BEFORE the /api/assistant network call —
 * a match never touches Gemini/RAG.
 */
export interface ActionResult {
  kind: "focus-area" | "filter-open" | "resume" | "navigate";
  /** Category filter to apply (map commands). */
  filter?: CategoryGroup;
  /** Single cluster to open in the drawer (filter-open). */
  clusterId?: string;
  centroid?: { lat: number; lng: number };
  /** Hotspot area to frame + pulse (focus-area). */
  focus?: MapFocus;
  /** App route to navigate to (navigate). */
  route?: string;
  text: string;
}

interface ActionIntent {
  id: string;
  test: (q: string) => boolean;
  run: () => ActionResult | null;
}

function detectGroup(q: string): CategoryGroup | null {
  if (/water|पानी|जल/.test(q)) return "water";
  if (/health|स्वास्थ्य|hospital|air|smog|dust|pollution/.test(q)) return "health";
  if (/infra|road|सड़क|street|garbage/.test(q)) return "infra";
  return null;
}

function detectSubcategory(q: string): string | null {
  if (/road|सड़क/.test(q)) return "roads";
  return null;
}

/** Match a ward by its name (e.g. "karol bagh", "rk puram"). Returns the ward id. */
function detectWard(q: string): string | null {
  for (const w of MOCK_CONSTITUENCY.wards) {
    const name = w.name.toLowerCase().replace(/[.\s]+/g, " ").trim();
    if (q.includes(name) || q.includes(name.replace(/\s+/g, ""))) return w.id;
  }
  return null;
}

/** Keyword → app route, for "take me to X" navigation. Order = specificity. */
function detectRoute(q: string): { route: string; label: string } | null {
  if (/proposal|प्रस्ताव/.test(q)) return { route: "/proposals", label: "Proposals" };
  if (/mplads|budget|fund|एमपीलैड्स|बजट|निधि/.test(q)) return { route: "/mplads", label: "MPLADS" };
  if (/action|letter|dispatch|tracker|कार्रवाई/.test(q)) return { route: "/actions", label: "Actions" };
  if (/document|\bfile\b|दस्तावेज़/.test(q)) return { route: "/documents", label: "Documents" };
  if (/intelligence|insight|analytic|इंटेलिजेंस/.test(q)) return { route: "/intelligence", label: "Intelligence" };
  if (/live feed|live signal|the feed|फ़ीड/.test(q)) return { route: "/live", label: "Live feed" };
  if (/dashboard|home (page|screen)|main screen|डैशबोर्ड/.test(q)) return { route: "/dashboard", label: "Dashboard" };
  return null;
}

function topClusterFor(group: CategoryGroup, subcategory: string | null) {
  const hits = MOCK_CLUSTERS.filter(
    (c) => groupOf(c.category) === group && (!subcategory || c.subcategory === subcategory),
  ).sort((a, b) => b.rank_score - a.rank_score);
  return hits[0] ?? null;
}

/** Rough metres between two lat/lng (equirectangular — fine at constituency scale). */
function metresBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (a.lat - b.lat) * 111_320;
  const dLng = (a.lng - b.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/**
 * A hotspot area from a set of clusters: centroid of their centroids, plus a
 * radius that covers the spread (padded, min-clamped) so the zone ring frames
 * the whole cluster rather than a single point.
 */
function areaFor(clusters: DemoCluster[]): MapFocus {
  const pts = clusters.map((c) => c.geo.centroid);
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  const spread = Math.max(0, ...pts.map((p) => metresBetween({ lat, lng }, p)));
  const radiusM = Math.max(600, spread * 1.3 + 300);
  return { lat, lng, radiusM };
}

const ACTION_INTENTS: ActionIntent[] = [
  {
    id: "resume",
    test: (q) => /where i (last )?left off|resume|continue where|पिछली बार|जहां छोड़ा/.test(q),
    run: () => ({ kind: "resume", text: "Taking you back to where you left off." }),
  },
  {
    id: "open-case",
    test: (q) => /open|case|cluster|complaint|खोलो/.test(q) && detectGroup(q) != null,
    run: () => {
      const group = detectGroup(lastQuery)!;
      const subcategory = detectSubcategory(lastQuery);
      const top = topClusterFor(group, subcategory);
      if (!top) return null;
      return {
        kind: "filter-open",
        filter: group,
        clusterId: top.id,
        centroid: top.geo.centroid,
        text: `Opening ${top.title} — ${top.ui.wardLabel}.`,
      };
    },
  },
  {
    id: "focus-area",
    test: (q) =>
      /show|display|highlight|zoom|hotspot|focus|take me to|le chalo|दिखा/.test(q) &&
      (detectGroup(q) != null || detectWard(q) != null),
    run: () => {
      const group = detectGroup(lastQuery);
      const wardId = detectWard(lastQuery);
      let clusters = MOCK_CLUSTERS as DemoCluster[];
      if (group) clusters = clusters.filter((c) => groupOf(c.category) === group);
      if (wardId) clusters = clusters.filter((c) => c.geo.ward === wardId);
      if (clusters.length === 0) return null;
      const focus = areaFor(clusters);
      const wardName = wardId
        ? MOCK_CONSTITUENCY.wards.find((w) => w.id === wardId)?.name
        : undefined;
      const scope = [group ? `${group} issues` : "issues", wardName ? `in ${wardName}` : null]
        .filter(Boolean)
        .join(" ");
      return {
        kind: "focus-area",
        filter: group ?? undefined,
        focus,
        text: `Framing ${scope} — ${clusters.length} cluster${clusters.length === 1 ? "" : "s"} in view.`,
      };
    },
  },
  {
    id: "navigate",
    test: (q) => detectRoute(q) != null,
    run: () => {
      const dest = detectRoute(lastQuery)!;
      return { kind: "navigate", route: dest.route, text: `Opening ${dest.label}.` };
    },
  },
];

let lastQuery = "";

/** Route a query to a resolved action, or null if it's not command-shaped (falls through to RAG). */
export function matchAction(query: string): ActionResult | null {
  const q = query.toLowerCase().trim();
  lastQuery = q;
  for (const intent of ACTION_INTENTS) {
    if (intent.test(q)) {
      const result = intent.run();
      if (result) return result;
    }
  }
  return null;
}
