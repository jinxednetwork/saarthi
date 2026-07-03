import type {
  Cluster,
  Constituency,
  SourceBreakdown,
  Timestamp,
} from "@saarthi/shared";

/**
 * Deterministic mock data for the offline skeleton (SAARTHI_MODE=emulator).
 * Everything here is typed against @saarthi/shared — if a Firestore shape changes
 * in the shared package, this file fails to compile. That's the anti-drift check
 * working (§4). Replaced by real Firestore listeners in Phase 4.
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
const NOW = 1_751_500_000_000; // fixed reference instant (~2025-07); keeps mocks stable

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
    { id: "chandrapur", name: "Chandrapur", sc_majority: true, st_majority: false },
    { id: "karol-bagh", name: "Karol Bagh", sc_majority: false, st_majority: false },
    { id: "rk-puram", name: "R.K. Puram", sc_majority: false, st_majority: false },
    { id: "sarojini", name: "Sarojini Nagar", sc_majority: true, st_majority: false },
  ],
  mplads: {
    allocation_annual: 50_000_000,
    utilization_ytd: 31_000_000,
    sc_percent_ytd: 0.11,
    st_percent_ytd: 0.06,
    fiscal_year: "2026-27",
  },
};

export const MOCK_CLUSTERS: Cluster[] = [
  {
    id: "cl_water_chandrapur",
    title: "Water shortage — Chandrapur Ward",
    title_hi: "पानी की कमी — चंद्रपुर वार्ड",
    category: "water",
    subcategory: "supply_interruption",
    geo: {
      constituency: "new-delhi-ls",
      ward: "chandrapur",
      locality: "Block C",
      centroid: { lat: 28.6139, lng: 77.209 },
      bounding_box: [77.2, 28.61, 77.22, 28.62],
    },
    urgency: "critical",
    submission_ids: [],
    submission_count: 34,
    source_breakdown: breakdown({ whatsapp: 20, twitter: 8, news: 4, reddit: 2 }),
    trend: { current_week: 34, previous_week: 19, percent_change: 78.9 },
    cross_reference: [
      {
        dataset: "Census-2011",
        metric: "Households with tap water",
        value: "41% (below constituency avg 68%)",
        citation_url: "https://censusindia.gov.in/",
      },
    ],
    suggested_action: {
      type: "MPLADS",
      title: "Sanction borewell + storage tank, Chandrapur Block C",
      body: "Draft recommendation to install a community borewell and 20,000L storage tank...",
      mplads_eligible: true,
      mplads_sector: "drinking_water",
      estimated_cost_lakhs: 18,
      compliance_notes: ["Permitted sector: drinking water", "Helps close SC gap: current 11%, target 15%"],
    },
    rank_score: 92,
    rank_components: {
      demand_signal: 0.9,
      public_data_severity: 0.85,
      urgency: 1,
      mplads_eligibility: 1,
      compliance_leverage: 0.9,
      trend: 0.8,
    },
    status: "new",
    centroid_embedding: [],
    created_at: ts(NOW - 6 * DAY),
    updated_at: ts(NOW - 1 * DAY),
  },
  {
    id: "cl_air_rkpuram",
    title: "Air quality spike — R.K. Puram",
    title_hi: "वायु गुणवत्ता में गिरावट — आर.के. पुरम",
    category: "air_quality",
    subcategory: "pm25_exceedance",
    geo: {
      constituency: "new-delhi-ls",
      ward: "rk-puram",
      centroid: { lat: 28.5636, lng: 77.1766 },
      bounding_box: [77.17, 28.56, 77.19, 28.57],
    },
    urgency: "high",
    submission_ids: [],
    submission_count: 21,
    source_breakdown: breakdown({ twitter: 11, news: 6, widget: 4 }),
    trend: { current_week: 21, previous_week: 12, percent_change: 75 },
    cross_reference: [
      {
        dataset: "CPCB",
        metric: "PM2.5 (7-day avg)",
        value: "312 µg/m³ (severe)",
        citation_url: "https://cpcb.nic.in/",
      },
    ],
    suggested_action: {
      type: "COORDINATION",
      title: "Convene DPCC + MCD on construction-dust enforcement",
      body: "Draft coordination note to Delhi Pollution Control Committee...",
      mplads_eligible: false,
      compliance_notes: ["Requires multi-stakeholder coordination (DPCC + MCD)"],
    },
    rank_score: 81,
    status: "new",
    centroid_embedding: [],
    created_at: ts(NOW - 4 * DAY),
    updated_at: ts(NOW - 1 * DAY),
  },
  {
    id: "cl_road_karolbagh",
    title: "Road & drainage collapse — Karol Bagh",
    title_hi: "सड़क और नाली क्षति — करोल बाग",
    category: "infrastructure",
    subcategory: "road_drainage",
    geo: {
      constituency: "new-delhi-ls",
      ward: "karol-bagh",
      centroid: { lat: 28.6516, lng: 77.1907 },
      bounding_box: [77.18, 28.65, 77.2, 28.66],
    },
    urgency: "high",
    submission_ids: [],
    submission_count: 17,
    source_breakdown: breakdown({ whatsapp: 9, reddit: 5, widget: 3 }),
    trend: { current_week: 17, previous_week: 15, percent_change: 13.3 },
    cross_reference: [],
    suggested_action: {
      type: "MPLADS",
      title: "Resurface arterial lane + storm drain, Karol Bagh",
      body: "Draft recommendation for road resurfacing and drain repair...",
      mplads_eligible: true,
      mplads_sector: "roads_pathways_bridges",
      estimated_cost_lakhs: 42,
      compliance_notes: ["Permitted sector: roads/pathways/bridges"],
    },
    rank_score: 74,
    status: "reviewed",
    centroid_embedding: [],
    created_at: ts(NOW - 9 * DAY),
    updated_at: ts(NOW - 2 * DAY),
  },
  {
    id: "cl_health_sarojini",
    title: "PHC staffing shortfall — Sarojini Nagar",
    title_hi: "पीएचसी स्टाफ की कमी — सरोजिनी नगर",
    category: "health",
    subcategory: "facility_staffing",
    geo: {
      constituency: "new-delhi-ls",
      ward: "sarojini",
      centroid: { lat: 28.5772, lng: 77.1946 },
      bounding_box: [77.19, 28.57, 77.2, 28.58],
    },
    urgency: "medium",
    submission_ids: [],
    submission_count: 12,
    source_breakdown: breakdown({ whatsapp: 6, news: 3, document: 3 }),
    trend: { current_week: 12, previous_week: 11, percent_change: 9.1 },
    cross_reference: [
      {
        dataset: "NFHS-5",
        metric: "PHC beds per 10k",
        value: "4.1 (below norm 6.0)",
        citation_url: "https://rchiips.org/nfhs/",
      },
    ],
    suggested_action: {
      type: "STATE",
      title: "Letter to Delhi Health Dept on PHC staffing",
      body: "Draft letter to the Delhi Directorate of Health Services...",
      mplads_eligible: false,
      compliance_notes: ["Health staffing is a state subject — STATE pathway"],
    },
    rank_score: 63,
    status: "new",
    centroid_embedding: [],
    created_at: ts(NOW - 5 * DAY),
    updated_at: ts(NOW - 2 * DAY),
  },
  {
    id: "cl_water_sarojini",
    title: "Sewage overflow — Sarojini market",
    title_hi: "सीवेज ओवरफ्लो — सरोजिनी बाज़ार",
    category: "water",
    subcategory: "sanitation",
    geo: {
      constituency: "new-delhi-ls",
      ward: "sarojini",
      centroid: { lat: 28.5779, lng: 77.1955 },
      bounding_box: [77.19, 28.57, 77.2, 28.58],
    },
    urgency: "medium",
    submission_ids: [],
    submission_count: 9,
    source_breakdown: breakdown({ whatsapp: 5, widget: 2, twitter: 2 }),
    trend: { current_week: 9, previous_week: 4, percent_change: 125 },
    cross_reference: [],
    suggested_action: {
      type: "MPLADS",
      title: "Sanction drain de-silting, Sarojini market",
      body: "Draft recommendation for market-area sewage line de-silting...",
      mplads_eligible: true,
      mplads_sector: "healthcare_sanitation",
      estimated_cost_lakhs: 7,
      compliance_notes: ["Permitted sector: healthcare/sanitation"],
    },
    rank_score: 58,
    status: "new",
    centroid_embedding: [],
    created_at: ts(NOW - 3 * DAY),
    updated_at: ts(NOW - 1 * DAY),
  },
];

/** Top-N clusters by rank, as the dashboard's "Today's Top 5" would compute. */
export function topClusters(n = 5): Cluster[] {
  return [...MOCK_CLUSTERS].sort((a, b) => b.rank_score - a.rank_score).slice(0, n);
}
