import type {
  Category,
  Cluster,
  Constituency,
  SourceBreakdown,
  SubmissionSource,
  Timestamp,
  Urgency,
} from "@saarthi/shared";
import { CLUSTER_MEDIA, type MediaAsset } from "./media";
import { datasetUrl } from "./datasets";

/**
 * Deterministic demo data — content ported from the design session handoff
 * (`Awaaz Design Session Handoff/Dashboard.dc.html`). Typed against
 * @saarthi/shared: if a Firestore shape changes, this fails to compile (§4).
 * Replaced by real Firestore listeners in Phase 4.
 */

/** Build an SDK-agnostic Timestamp from epoch millis (deterministic). */
export function ts(ms: number): Timestamp {
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1e6,
    toDate: () => new Date(ms),
    toMillis: () => ms,
  };
}

const DAY = 86_400_000;
const NOW = 1_751_500_000_000; // fixed reference instant; keeps mocks stable

function breakdown(p: Partial<SourceBreakdown>): SourceBreakdown {
  return {
    whatsapp: 0,
    twitter: 0,
    reddit: 0,
    widget: 0,
    portal: 0,
    news: 0,
    document: 0,
    ...p,
  };
}

export const MOCK_CONSTITUENCY: Constituency = {
  id: "new-delhi-ls",
  name: "New Delhi",
  name_hi: "नई दिल्ली",
  state: "Delhi",
  district: "New Delhi",
  mp: {
    name: "Bansuri Swaraj",
    handle_x: "@BansuriSwaraj",
  },
  boundaries_geojson_url: "/data/constituencies/new-delhi-ls.geojson",
  wards: [
    { id: "karol-bagh", name: "Karol Bagh", sc_majority: true, st_majority: false },
    { id: "rajinder-nagar", name: "Rajinder Nagar", sc_majority: false, st_majority: false },
    { id: "kalkaji-ext", name: "Kalkaji Ext.", sc_majority: false, st_majority: false },
    { id: "malviya-nagar", name: "Malviya Nagar", sc_majority: false, st_majority: false },
    { id: "chanakyapuri", name: "Chanakyapuri", sc_majority: false, st_majority: false },
    { id: "sarai-kale-khan", name: "Sarai Kale Khan", sc_majority: true, st_majority: false },
    { id: "patel-nagar", name: "Patel Nagar", sc_majority: true, st_majority: false },
    { id: "rk-puram", name: "R.K. Puram", sc_majority: false, st_majority: false },
    { id: "sarojini-nagar", name: "Sarojini Nagar", sc_majority: false, st_majority: false },
    { id: "kasturba-nagar", name: "Kasturba Nagar", sc_majority: false, st_majority: false },
    { id: "green-park", name: "Green Park", sc_majority: false, st_majority: false },
    { id: "greater-kailash", name: "Greater Kailash", sc_majority: false, st_majority: false },
    { id: "delhi-cantt", name: "Delhi Cantt", sc_majority: false, st_majority: false },
  ],
  mplads: {
    allocation_annual: 50_000_000, // ₹5.0 Cr
    utilization_ytd: 34_200_000, //  ₹3.42 Cr → 68.4%
    sc_percent_ytd: 0.128, //        12.8% (₹11 L below the 15% floor)
    st_percent_ytd: 0.082, //        8.2% (0.7 pt buffer above 7.5%)
    fiscal_year: "2026-27",
  },
};

/** Dashboard-wide header/KPI copy from the design. */
export const DASHBOARD_META = {
  signalsThisWeek: 1842,
  sourceCount: 5,
  openClusters: 47,
  criticalClusters: 5,
  openClustersSub: "3 categories · 8 wards",
  scGapCopy: "₹11 L below required",
  stBufferCopy: "0.7 pt buffer above required",
  syncedCopy: "Synced 12:47 PM · Week 44",
  constituencyCopy: "New Delhi Lok Sabha · 10 assembly segments · 1.5M citizens",
  weekLabel: "Week 44, 2026",
} as const;

/** One radial-hub channel spoke (design `_radialSpec`). */
export interface RadialChannel {
  key: SubmissionSource;
  name: string;
  angle: number;
  color: string;
  count: number;
  trend: string;
  live: boolean;
}

export const RADIAL_CHANNELS: RadialChannel[] = [
  { key: "whatsapp", name: "WhatsApp", angle: 0, color: "#25D366", count: 892, trend: "↑ 24%", live: true },
  { key: "twitter", name: "X (post)", angle: 72, color: "#14192A", count: 617, trend: "↑ 18%", live: true },
  { key: "reddit", name: "Reddit", angle: 144, color: "#FF4500", count: 128, trend: "↑ 9%", live: false },
  { key: "portal", name: "Portal", angle: 216, color: "#054A91", count: 143, trend: "↑ 42%", live: false },
  { key: "news", name: "News", angle: 288, color: "#8A5219", count: 62, trend: "↑ 4%", live: false },
];

/** UI-only extras the design attaches to a cluster (narrative cross-ref, links). */
export interface ClusterUi {
  /** Citizen-submitted photos/videos (demo: curated stock stand-ins). */
  media?: MediaAsset[];
  /** Human-written cross-reference narrative shown on full cards. */
  crossRefProse?: string;
  /** Compact "Ward A · Ward B" location line. */
  wardLabel: string;
  /** Short suggestion line for the queue rail. */
  queueSuggestion?: string;
  /** "MPLADS-eligible" / "State subject" flag next to the pathway pill. */
  pathwayFlag?: string;
  /** Pre-seeded dispatch state (cluster #03 in the design ships in-progress). */
  dispatched?: { date: string; detail: string; progress: number };
  /** Clickable links back to the origin posts/articles (promoted-issue evidence). */
  sourceLinks?: { source: SubmissionSource; url: string; label: string }[];
}

export interface DemoCluster extends Cluster {
  ui: ClusterUi;
}

interface ClusterSeed {
  num: number;
  title: string;
  title_hi?: string;
  category: Category;
  subcategory: string;
  urgency: Urgency;
  ward: string;
  wardLabel: string;
  lat: number;
  lng: number;
  count?: number;
  sources?: Partial<SourceBreakdown>;
  trendPct?: number; // percent_change; 0 + previous 0 renders as "new"
  isNew?: boolean;
  crossRefProse?: string;
  crossRefs?: { dataset: string; metric: string }[];
  actionType?: Cluster["suggested_action"]["type"];
  actionTitle?: string;
  actionBody?: string;
  mpladsEligible?: boolean;
  costLakhs?: number;
  queueSuggestion?: string;
  pathwayFlag?: string;
  rank: number;
  status?: Cluster["status"];
  dispatched?: ClusterUi["dispatched"];
}

function mkCluster(s: ClusterSeed): DemoCluster {
  const count = s.count ?? 8;
  const previous = s.isNew ? 0 : Math.max(1, Math.round(count / (1 + (s.trendPct ?? 10) / 100)));
  return {
    id: `cl_${String(s.num).padStart(2, "0")}`,
    title: s.title,
    title_hi: s.title_hi ?? s.title,
    category: s.category,
    subcategory: s.subcategory,
    geo: {
      constituency: "new-delhi-ls",
      ward: s.ward,
      centroid: { lat: s.lat, lng: s.lng },
      bounding_box: [s.lng - 0.01, s.lat - 0.01, s.lng + 0.01, s.lat + 0.01],
    },
    urgency: s.urgency,
    submission_ids: [],
    submission_count: count,
    source_breakdown: breakdown(s.sources ?? { whatsapp: count }),
    trend: {
      current_week: count,
      previous_week: previous,
      percent_change: s.isNew ? 0 : (s.trendPct ?? 10),
    },
    cross_reference: (s.crossRefs ?? []).map((c) => ({
      dataset: c.dataset,
      metric: c.metric,
      value: "",
      citation_url: datasetUrl(c.dataset) ?? "https://data.gov.in/",
    })),
    suggested_action: {
      type: s.actionType ?? "COORDINATION",
      title: s.actionTitle ?? `Review ${s.title}`,
      body: s.actionBody ?? "",
      mplads_eligible: s.mpladsEligible ?? false,
      estimated_cost_lakhs: s.costLakhs,
      compliance_notes: [],
    },
    rank_score: s.rank,
    status: s.status ?? "new",
    centroid_embedding: [],
    created_at: ts(NOW - 10 * DAY),
    updated_at: ts(NOW - 1 * DAY),
    ui: {
      media: CLUSTER_MEDIA[`cl_${String(s.num).padStart(2, "0")}`],
      crossRefProse: s.crossRefProse,
      wardLabel: s.wardLabel,
      queueSuggestion: s.queueSuggestion,
      pathwayFlag: s.pathwayFlag,
      dispatched: s.dispatched,
    },
  };
}

/** All 12 demo clusters (design `_clusterList` + enriched top 5). */
export const MOCK_CLUSTERS: DemoCluster[] = [
  mkCluster({
    num: 1,
    title: "Waterlogging on arterial roads",
    title_hi: "मुख्य सड़कों पर जलभराव",
    category: "infrastructure",
    subcategory: "drainage",
    urgency: "critical",
    ward: "karol-bagh",
    wardLabel: "Karol Bagh · Rajinder Nagar",
    lat: 28.6519,
    lng: 77.1902,
    count: 71,
    sources: { whatsapp: 12, twitter: 47, reddit: 8, portal: 3, news: 1 },
    trendPct: 340,
    crossRefProse:
      "DUSIB Drain #4 (Karol Bagh main) last de-silted Sep 2025. IMD forecast 24mm rain in next 48h. CPWD road-repair contract active on adjoining stretch since Oct 12.",
    crossRefs: [
      { dataset: "DUSIB", metric: "Drain register" },
      { dataset: "IMD", metric: "Delhi forecast" },
      { dataset: "CPWD", metric: "works portal" },
    ],
    actionType: "MPLADS",
    actionTitle: "Emergency drain de-silting works",
    actionBody:
      "Recommend emergency de-silting works — est. ₹28.5 L from MPLADS Urban Development window.",
    mpladsEligible: true,
    costLakhs: 28.5,
    queueSuggestion: "Emergency drain de-silting works",
    pathwayFlag: "MPLADS-eligible",
    rank: 97,
  }),
  mkCluster({
    num: 2,
    title: "Contaminated drinking water",
    category: "water",
    subcategory: "quality",
    urgency: "critical",
    ward: "kalkaji-ext",
    wardLabel: "Kalkaji Ext. · Malviya Nagar",
    lat: 28.5423,
    lng: 77.2531,
    count: 58,
    sources: { whatsapp: 22, twitter: 19, portal: 12, reddit: 4, news: 1 },
    trendPct: 180,
    crossRefProse:
      "DJB water quality test 21 Oct · TDS 890 mg/L (BIS limit 500). CGWB shows falling water table in Kalkaji Ext borewell array. No DJB tanker route serving 4 of 7 affected pockets.",
    crossRefs: [
      { dataset: "DJB", metric: "quality register" },
      { dataset: "CGWB", metric: "groundwater" },
      { dataset: "DJB", metric: "tanker routes" },
    ],
    actionType: "STATE",
    actionTitle: "Coordinate DJB × DUSIB inspection",
    actionBody:
      "Coordinate joint DJB × DUSIB inspection · request temporary tanker augmentation to affected pockets.",
    queueSuggestion: "Coordinate DJB × DUSIB inspection",
    pathwayFlag: "State subject",
    rank: 93,
  }),
  mkCluster({
    num: 3,
    title: "Air quality — construction dust",
    category: "air_quality",
    subcategory: "construction_dust",
    urgency: "high",
    ward: "chanakyapuri",
    wardLabel: "Chanakyapuri · Sarai Kale Khan",
    lat: 28.5985,
    lng: 77.1893,
    count: 44,
    sources: { twitter: 24, whatsapp: 11, reddit: 6, portal: 3 },
    trendPct: 62,
    crossRefProse:
      "CPCB Chanakyapuri station · 7-day PM2.5 avg 168 μg/m³ (Very Poor). 3 active construction permits within 500m (DDA public register). Metro line-4 spoil-yard operational.",
    crossRefs: [
      { dataset: "CPCB", metric: "monitoring" },
      { dataset: "DDA", metric: "permits" },
      { dataset: "DMRC", metric: "works log" },
    ],
    actionType: "CENTRAL",
    actionTitle: "Ministry letter · MoEFCC",
    actionBody:
      "Ministry letter dispatched to Union Environment Minister (MoEFCC) requesting review of construction dust control and short-term sprinkler deployment.",
    queueSuggestion: "Ministry letter · MoEFCC",
    rank: 84,
    status: "action_taken",
    dispatched: {
      date: "3 days ago · 01 Nov",
      detail:
        "Ministry letter dispatched to Union Environment Minister (MoEFCC) requesting review of construction dust control and short-term sprinkler deployment.",
      progress: 42,
    },
  }),
  mkCluster({
    num: 4,
    title: "Broken street lights, public safety",
    category: "infrastructure",
    subcategory: "street_lighting",
    urgency: "high",
    ward: "rajinder-nagar",
    wardLabel: "Rajinder Nagar · Patel Nagar",
    lat: 28.6398,
    lng: 77.1802,
    count: 29,
    sources: { whatsapp: 14, portal: 9, twitter: 6 },
    trendPct: 41,
    actionType: "MPLADS",
    actionTitle: "LED replacement programme",
    mpladsEligible: true,
    queueSuggestion: "LED replacement programme",
    rank: 71,
  }),
  mkCluster({
    num: 5,
    title: "Sewer overflow near residences",
    category: "water",
    subcategory: "sanitation",
    urgency: "high",
    ward: "rk-puram",
    wardLabel: "R.K. Puram Sector 4 & 7",
    lat: 28.5665,
    lng: 77.1794,
    count: 17,
    sources: { whatsapp: 9, news: 3, widget: 5 },
    isNew: true,
    actionType: "STATE",
    actionTitle: "Escalate to DUSIB",
    queueSuggestion: "Escalate to DUSIB",
    rank: 66,
  }),
  mkCluster({
    num: 6, title: "Waste collection irregular", category: "infrastructure", subcategory: "waste",
    urgency: "medium", ward: "sarojini-nagar", wardLabel: "Sarojini Nagar",
    lat: 28.573, lng: 77.1936, count: 11, trendPct: 12, rank: 48,
  }),
  mkCluster({
    num: 7, title: "Stray dog complaints", category: "health", subcategory: "animal_control",
    urgency: "medium", ward: "kasturba-nagar", wardLabel: "Kasturba Nagar",
    lat: 28.547, lng: 77.226, count: 9, trendPct: 8, rank: 42,
  }),
  mkCluster({
    num: 8, title: "Water supply irregular", category: "water", subcategory: "supply",
    urgency: "medium", ward: "patel-nagar", wardLabel: "Patel Nagar",
    lat: 28.628, lng: 77.158, count: 8, trendPct: 15, rank: 40,
  }),
  mkCluster({
    num: 9, title: "Potholes on approach roads", category: "infrastructure", subcategory: "roads",
    urgency: "low", ward: "delhi-cantt", wardLabel: "Delhi Cantt",
    lat: 28.5382, lng: 77.2109, count: 6, trendPct: 5, rank: 30,
  }),
  mkCluster({
    num: 10, title: "Dust pollution — metro construction", category: "air_quality", subcategory: "construction_dust",
    urgency: "high", ward: "sarai-kale-khan", wardLabel: "Sarai Kale Khan",
    lat: 28.612, lng: 77.24, count: 13, trendPct: 22, rank: 55,
  }),
  mkCluster({
    num: 11, title: "Public toilet sanitation", category: "water", subcategory: "sanitation",
    urgency: "medium", ward: "green-park", wardLabel: "Green Park",
    lat: 28.551, lng: 77.202, count: 7, trendPct: 6, rank: 36,
  }),
  mkCluster({
    num: 12, title: "Park maintenance", category: "infrastructure", subcategory: "parks",
    urgency: "low", ward: "greater-kailash", wardLabel: "Greater Kailash",
    lat: 28.5645, lng: 77.241, count: 4, trendPct: 3, rank: 22,
  }),
  mkCluster({
    num: 13, title: "Open manhole hazard", category: "infrastructure", subcategory: "drainage",
    urgency: "high", ward: "karol-bagh", wardLabel: "Karol Bagh", lat: 28.6465, lng: 77.1975,
    count: 15, trendPct: 28, rank: 61,
  }),
  mkCluster({
    num: 14, title: "Mosquito breeding — stagnant water", category: "health", subcategory: "vector_control",
    urgency: "high", ward: "kalkaji-ext", wardLabel: "Kalkaji Ext.", lat: 28.5361, lng: 77.259,
    count: 19, trendPct: 34, rank: 58,
  }),
  mkCluster({
    num: 15, title: "Illegal garbage dumping", category: "infrastructure", subcategory: "waste",
    urgency: "medium", ward: "patel-nagar", wardLabel: "Patel Nagar", lat: 28.6342, lng: 77.1668,
    count: 10, trendPct: 14, rank: 45,
  }),
  mkCluster({
    num: 16, title: "Low water pressure", category: "water", subcategory: "supply",
    urgency: "medium", ward: "malviya-nagar", wardLabel: "Malviya Nagar", lat: 28.5352, lng: 77.2115,
    count: 12, trendPct: 11, rank: 47,
  }),
  mkCluster({
    num: 17, title: "Traffic signal outage", category: "infrastructure", subcategory: "roads",
    urgency: "high", ward: "chanakyapuri", wardLabel: "Chanakyapuri", lat: 28.6013, lng: 77.1876,
    count: 21, trendPct: 39, rank: 63,
  }),
  mkCluster({
    num: 18, title: "Burning waste — air quality", category: "air_quality", subcategory: "open_burning",
    urgency: "critical", ward: "sarai-kale-khan", wardLabel: "Sarai Kale Khan", lat: 28.6, lng: 77.255,
    count: 33, trendPct: 120, rank: 79,
  }),
  mkCluster({
    num: 19, title: "Blocked storm drain", category: "water", subcategory: "drainage",
    urgency: "high", ward: "rk-puram", wardLabel: "R.K. Puram", lat: 28.5701, lng: 77.174,
    count: 16, trendPct: 26, rank: 57,
  }),
  mkCluster({
    num: 20, title: "Streetlight flicker complaints", category: "infrastructure", subcategory: "street_lighting",
    urgency: "low", ward: "green-park", wardLabel: "Green Park", lat: 28.5586, lng: 77.206,
    count: 6, trendPct: 7, rank: 33,
  }),
  mkCluster({
    num: 21, title: "Clinic overcrowding", category: "health", subcategory: "public_health",
    urgency: "medium", ward: "sarojini-nagar", wardLabel: "Sarojini Nagar", lat: 28.5772, lng: 77.1985,
    count: 9, trendPct: 12, rank: 41,
  }),
  mkCluster({
    num: 22, title: "Encroached footpath", category: "infrastructure", subcategory: "roads",
    urgency: "low", ward: "kasturba-nagar", wardLabel: "Kasturba Nagar", lat: 28.5745, lng: 77.223,
    count: 5, trendPct: 4, rank: 28,
  }),
];

/**
 * A synthetic "just now" event for the radar / AI overwatch mode. Jittered near
 * a random existing cluster (keeps it in-bounds and realistic), urgency weighted
 * toward high/critical for drama. Session-only; not part of MOCK_CLUSTERS.
 */
const LIVE_TITLES = [
  "New waterlogging report",
  "Sudden AQI spike detected",
  "Power outage cluster forming",
  "Burst water main reported",
  "Road accident — signal down",
  "Sewage overflow flagged",
  "Fresh dust-pollution surge",
  "Garbage fire reported",
];
const LIVE_URGENCIES: Urgency[] = ["high", "high", "critical", "medium", "critical"];
const LIVE_CATEGORIES: Category[] = ["water", "air_quality", "infrastructure", "health"];

export function makeLiveEvent(index: number): DemoCluster {
  const anchor = MOCK_CLUSTERS[Math.floor(Math.random() * MOCK_CLUSTERS.length)]!;
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;
  const jitter = () => (Math.random() - 0.5) * 0.016;
  const evt = mkCluster({
    num: 900 + index,
    title: pick(LIVE_TITLES),
    category: pick(LIVE_CATEGORIES),
    subcategory: "live_event",
    urgency: pick(LIVE_URGENCIES),
    ward: anchor.geo.ward,
    wardLabel: anchor.ui.wardLabel,
    lat: anchor.geo.centroid.lat + jitter(),
    lng: anchor.geo.centroid.lng + jitter(),
    count: 1 + Math.floor(Math.random() * 6),
    isNew: true,
    rank: 50,
  });
  return { ...evt, id: `live_${900 + index}` };
}

/** Top-N clusters by rank ("Priority action queue" / "This week's priorities"). */
export function topClusters(n = 5): DemoCluster[] {
  return [...MOCK_CLUSTERS].sort((a, b) => b.rank_score - a.rank_score).slice(0, n);
}

/** The three clusters shown as full cards, in the design's display order. */
export function fullCardClusters(): DemoCluster[] {
  const byNum = (n: number) => MOCK_CLUSTERS.find((c) => c.id === `cl_${String(n).padStart(2, "0")}`)!;
  return [byNum(1), byNum(3), byNum(2)];
}

/** Live signal feed items (design `_feedItemsBase`). */
export interface FeedItem {
  source: SubmissionSource;
  sourceName: string;
  category: Category;
  timeMin: number;
  snippet: string;
  link: string;
  /** Cluster this signal joined — click-through target. */
  clusterId?: string;
  /** Citizen ticket this signal is, for tickets not yet joined to a cluster. */
  ticketId?: string;
  /** Attached citizen media (photos/videos) — drives the /live collage. */
  media?: MediaAsset;
  linkNew?: boolean;
  hi?: boolean;
}

export const FEED_ITEMS: FeedItem[] = [
  { source: "twitter", sourceName: "X (post)", category: "infrastructure", timeMin: 2, snippet: "Waterlogging in Karol Bagh main market crossed knee level again — 3rd day running.", link: "joins cluster #01", clusterId: "cl_01" },
  { source: "whatsapp", sourceName: "WhatsApp", category: "water", timeMin: 4, snippet: "पानी बहुत गंदा है, बदबू भी आ रही है। कृपया देखें।", link: "voice note · Hindi · joins cluster #02", clusterId: "cl_02", hi: true },
  { source: "reddit", sourceName: "Reddit", category: "air_quality", timeMin: 7, snippet: "r/delhi · AQI 380 outside the embassy zone at 8am — third day above severe.", link: "joins cluster #03", clusterId: "cl_03" },
  { source: "portal", sourceName: "Portal", category: "infrastructure", timeMin: 12, snippet: "Widget submission · Streetlights on Pusa Road out for 4 nights now, unsafe for women commuters.", link: "joins cluster #04", clusterId: "cl_04" },
  { source: "news", sourceName: "News", category: "water", timeMin: 18, snippet: 'Local daily · "DUSIB sewer complaints spike in RK Puram; residents demand action."', link: "joins cluster #05", clusterId: "cl_05" },
  { source: "twitter", sourceName: "X (post)", category: "air_quality", timeMin: 24, snippet: "Metro construction dust on the DND stretch — masks required through Nov.", link: "creates new cluster · #10", clusterId: "cl_10", linkNew: true },
  { source: "whatsapp", sourceName: "WhatsApp", category: "infrastructure", timeMin: 33, snippet: "Garbage not collected in Kasturba Nagar for three days. Attaching photo.", link: "joins cluster #06", clusterId: "cl_06" },
  { source: "twitter", sourceName: "X (post)", category: "water", timeMin: 41, snippet: "Malviya Nagar water tanker delayed again this morning, entire block affected.", link: "joins cluster #02", clusterId: "cl_02" },
];

/**
 * /live collage feed — the dashboard's 8 base items enriched with media, plus
 * the longer tail of the week's signals. Aspect variance drives the masonry.
 */
export const LIVE_FEED_ITEMS: FeedItem[] = [
  { ...FEED_ITEMS[0]!, media: { type: "image", src: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=70&auto=format", aspect: "16/9", alt: "Flooded arterial road, Karol Bagh main market" } },
  { ...FEED_ITEMS[1]!, media: { type: "video", src: "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=800&q=70&auto=format", poster: "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=800&q=70&auto=format", aspect: "3/4", alt: "Voice-note video — discoloured water, Kalkaji Ext.", duration: "0:14" } },
  { ...FEED_ITEMS[2]!, media: { type: "image", src: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=70&auto=format", aspect: "4/3", alt: "Haze over the India Gate corridor at dawn" } },
  { ...FEED_ITEMS[3]!, media: { type: "image", src: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&q=70&auto=format", aspect: "3/4", alt: "Unlit stretch of Pusa Road after dark" } },
  { ...FEED_ITEMS[4]! },
  { ...FEED_ITEMS[5]!, media: { type: "image", src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=70&auto=format", aspect: "4/3", alt: "Uncovered construction on the DND stretch" } },
  { ...FEED_ITEMS[6]!, media: { type: "image", src: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=70&auto=format", aspect: "1/1", alt: "Uncollected waste, Kasturba Nagar" } },
  { ...FEED_ITEMS[7]! },
  { source: "whatsapp", sourceName: "WhatsApp", category: "water", timeMin: 52, snippet: "टैंकर आज फिर नहीं आया। बच्चे स्कूल से पहले पानी भरने जाते हैं।", link: "voice note · Hindi · joins cluster #08", clusterId: "cl_08", hi: true },
  { source: "portal", sourceName: "Portal", category: "infrastructure", timeMin: 58, snippet: "Widget submission · Footpath tiles caved in on the Delhi Cantt approach road — senior citizens at risk.", link: "joins cluster #09", clusterId: "cl_09", media: { type: "image", src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=70&auto=format", aspect: "16/9", alt: "Damaged footpath near Green Park metro exit" } },
  { source: "twitter", sourceName: "X (post)", category: "air_quality", timeMin: 64, snippet: "Morning walk cancelled again. You can taste the air near Sarai Kale Khan. @SaarthiNewDelhi when does the construction pause?", link: "joins cluster #10", clusterId: "cl_10", media: { type: "image", src: "https://images.unsplash.com/photo-1470723710355-95304d8aece4?w=800&q=70&auto=format", aspect: "16/9", alt: "Traffic haze at the Sarai Kale Khan corridor after dark" } },
  { source: "reddit", sourceName: "Reddit", category: "infrastructure", timeMin: 71, snippet: "r/delhi · Anyone else notice the streetlights out on the entire Patel Nagar service lane? Third week now.", link: "joins cluster #04", clusterId: "cl_04" },
  { source: "news", sourceName: "News", category: "health", timeMin: 83, snippet: 'The Hindu · "Stray dog census delayed; RWA complaints double in South Delhi wards."', link: "joins cluster #07", clusterId: "cl_07", media: { type: "image", src: "https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&q=70&auto=format", aspect: "4/3", alt: "South Delhi neighbourhood park" } },
  { source: "whatsapp", sourceName: "WhatsApp", category: "infrastructure", timeMin: 95, snippet: "Park ke jhoole toot gaye hain, koi repair nahi hua Diwali se pehle se.", link: "joins cluster #12", clusterId: "cl_12", hi: true },
  { source: "portal", sourceName: "Portal", category: "water", timeMin: 104, snippet: "Widget submission · Sewer overflow smell reaching the school compound in Sector 4 by afternoon.", link: "joins cluster #05", clusterId: "cl_05", media: { type: "image", src: "https://images.unsplash.com/photo-1554672408-730436b60dde?w=800&q=70&auto=format", aspect: "3/4", alt: "Citizen reporting via the Saarthi web widget" } },
  { source: "twitter", sourceName: "X (post)", category: "other", timeMin: 118, snippet: "Flag hoisting at the ward office this Sunday — and a reminder that civic pride starts with working drains. 🇮🇳", link: "general civic · unclustered", media: { type: "image", src: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=70&auto=format", aspect: "4/3", alt: "Indian tricolour against a clear sky" } },
];

/** Footer data-source registry (design `_dataSources`). */
export const DATA_SOURCES = [
  { short: "CPCB", name: "Central Pollution Control Board · air quality", updated: "2 min ago" },
  { short: "DUSIB", name: "Delhi Urban Shelter Improvement · works register", updated: "1 hr ago" },
  { short: "DJB", name: "Delhi Jal Board · water quality & tankers", updated: "18 min ago" },
  { short: "DDA", name: "Delhi Development Authority · permits", updated: "4 hr ago" },
  { short: "DMRC", name: "Delhi Metro · works log", updated: "30 min ago" },
  { short: "Delhi Police", name: "FIRs & public safety incident log", updated: "12 min ago" },
  { short: "IMD", name: "Meteorological Dept · forecast + rainfall", updated: "15 min ago" },
  { short: "MoSPI", name: "MPLADS portal · sanction & release", updated: "1 day ago" },
] as const;
