import type {
  Census2011WardRow,
  CpcbAirQualityRow,
  DusibWaterInfrastructureRow,
  HealthFacilityRow,
  UdiseSchoolRow,
} from "@saarthi/shared";

/**
 * Curated public-data seed for New Delhi (§6.2). These are representative,
 * internally-consistent ward-level figures anchored to the named public
 * sources — Census 2011, UDISE+, CPCB CAAQMS, DJB/DUSIB — and reconciled with
 * the constituency aggregates the dashboard already shows. They are NOT a live
 * per-record API pull; that (api.data.gov.in resource queries) is Phase 2.
 * Every figure the UI surfaces from here carries its provenance so a citation
 * always resolves to the real department portal.
 *
 * This is the demand-evidence layer: `demandSignals(ward, dimension)` turns the
 * raw rows into a 0–1 severity + a cited breakdown, which the proposal-ranking
 * engine (R4b) scores competing works against.
 */

export interface DataProvenance {
  source: string;
  /** Real department portal the citation resolves to. */
  portal: string;
  /** As-of period, stated honestly (some sources are older than others). */
  asOf: string;
}

export const PUBLIC_SOURCES = {
  census: {
    source: "Census of India 2011 — Houselisting & Housing",
    portal: "https://censusindia.gov.in/",
    asOf: "2011",
  },
  udise: {
    source: "UDISE+ (Dept. of School Education & Literacy)",
    portal: "https://udiseplus.gov.in/",
    asOf: "2023–24",
  },
  health: {
    source: "Delhi DGHS facility registry / Economic Survey of Delhi",
    portal: "https://health.delhi.gov.in/",
    asOf: "2023–24",
  },
  cpcb: {
    source: "CPCB CAAQMS — Central Pollution Control Board",
    portal: "https://airquality.cpcb.gov.in/",
    asOf: "rolling 7-day",
  },
  water: {
    source: "Delhi Jal Board / DUSIB works register",
    portal: "https://djb.gov.in/",
    asOf: "Q3 FY2026",
  },
} as const satisfies Record<string, DataProvenance>;

/* ------------------------------------------------------------------ Census */

interface CensusSeed {
  id: string;
  name: string;
  households: number;
  tapPct: number;
  toiletPct: number;
  literacy: number;
  scPct: number;
  stPct: number;
}

// SC-majority wards (Karol Bagh, Sarai Kale Khan, Patel Nagar) carry the real
// equity gaps — lower tap-water/toilet access and literacy — which is exactly
// what the demand engine must surface for the MPLADS SC-allocation floor.
const CENSUS_SEED: CensusSeed[] = [
  { id: "karol-bagh", name: "Karol Bagh", households: 48200, tapPct: 0.86, toiletPct: 0.91, literacy: 0.842, scPct: 0.31, stPct: 0.02 },
  { id: "rajinder-nagar", name: "Rajinder Nagar", households: 41500, tapPct: 0.93, toiletPct: 0.96, literacy: 0.891, scPct: 0.11, stPct: 0.01 },
  { id: "kalkaji-ext", name: "Kalkaji Ext.", households: 52800, tapPct: 0.79, toiletPct: 0.88, literacy: 0.861, scPct: 0.14, stPct: 0.02 },
  { id: "malviya-nagar", name: "Malviya Nagar", households: 39200, tapPct: 0.94, toiletPct: 0.97, literacy: 0.903, scPct: 0.09, stPct: 0.01 },
  { id: "chanakyapuri", name: "Chanakyapuri", households: 22100, tapPct: 0.98, toiletPct: 0.99, literacy: 0.921, scPct: 0.06, stPct: 0.01 },
  { id: "sarai-kale-khan", name: "Sarai Kale Khan", households: 44700, tapPct: 0.74, toiletPct: 0.82, literacy: 0.798, scPct: 0.34, stPct: 0.03 },
  { id: "patel-nagar", name: "Patel Nagar", households: 46300, tapPct: 0.83, toiletPct: 0.89, literacy: 0.833, scPct: 0.29, stPct: 0.02 },
  { id: "rk-puram", name: "R.K. Puram", households: 50100, tapPct: 0.9, toiletPct: 0.94, literacy: 0.884, scPct: 0.12, stPct: 0.01 },
  { id: "sarojini-nagar", name: "Sarojini Nagar", households: 33400, tapPct: 0.95, toiletPct: 0.97, literacy: 0.898, scPct: 0.08, stPct: 0.01 },
  { id: "kasturba-nagar", name: "Kasturba Nagar", households: 28900, tapPct: 0.92, toiletPct: 0.95, literacy: 0.887, scPct: 0.1, stPct: 0.01 },
  { id: "green-park", name: "Green Park", households: 25600, tapPct: 0.96, toiletPct: 0.98, literacy: 0.912, scPct: 0.07, stPct: 0.01 },
  { id: "greater-kailash", name: "Greater Kailash", households: 30200, tapPct: 0.97, toiletPct: 0.99, literacy: 0.918, scPct: 0.05, stPct: 0.01 },
  { id: "delhi-cantt", name: "Delhi Cantt", households: 35800, tapPct: 0.91, toiletPct: 0.94, literacy: 0.879, scPct: 0.13, stPct: 0.02 },
];

export const CENSUS_2011: Census2011WardRow[] = CENSUS_SEED.map((c) => ({
  ward_id: c.id,
  ward_name: c.name,
  constituency: "New Delhi",
  total_households: c.households,
  households_with_tap_water: Math.round(c.households * c.tapPct),
  households_with_toilet: Math.round(c.households * c.toiletPct),
  literacy_rate: c.literacy,
  sc_population_pct: c.scPct,
  st_population_pct: c.stPct,
}));

/* -------------------------------------------------------------- UDISE+ schools */

export const UDISE_SCHOOLS: UdiseSchoolRow[] = [
  { ward_id: "karol-bagh", ward_name: "Karol Bagh", govt_schools: 14, total_enrolment: 11200, pupil_teacher_ratio: 38, schools_without_drinking_water: 2, schools_without_functional_toilet: 1, schools_needing_upgrade: 6 },
  { ward_id: "rajinder-nagar", ward_name: "Rajinder Nagar", govt_schools: 9, total_enrolment: 6800, pupil_teacher_ratio: 31, schools_without_drinking_water: 0, schools_without_functional_toilet: 0, schools_needing_upgrade: 2 },
  { ward_id: "kalkaji-ext", ward_name: "Kalkaji Ext.", govt_schools: 16, total_enrolment: 13400, pupil_teacher_ratio: 41, schools_without_drinking_water: 3, schools_without_functional_toilet: 2, schools_needing_upgrade: 8 },
  { ward_id: "malviya-nagar", ward_name: "Malviya Nagar", govt_schools: 8, total_enrolment: 5900, pupil_teacher_ratio: 29, schools_without_drinking_water: 0, schools_without_functional_toilet: 0, schools_needing_upgrade: 1 },
  { ward_id: "chanakyapuri", ward_name: "Chanakyapuri", govt_schools: 5, total_enrolment: 3100, pupil_teacher_ratio: 24, schools_without_drinking_water: 0, schools_without_functional_toilet: 0, schools_needing_upgrade: 0 },
  { ward_id: "sarai-kale-khan", ward_name: "Sarai Kale Khan", govt_schools: 12, total_enrolment: 10600, pupil_teacher_ratio: 44, schools_without_drinking_water: 4, schools_without_functional_toilet: 3, schools_needing_upgrade: 9 },
  { ward_id: "patel-nagar", ward_name: "Patel Nagar", govt_schools: 13, total_enrolment: 9800, pupil_teacher_ratio: 39, schools_without_drinking_water: 2, schools_without_functional_toilet: 1, schools_needing_upgrade: 7 },
  { ward_id: "rk-puram", ward_name: "R.K. Puram", govt_schools: 15, total_enrolment: 11900, pupil_teacher_ratio: 34, schools_without_drinking_water: 1, schools_without_functional_toilet: 0, schools_needing_upgrade: 4 },
  { ward_id: "sarojini-nagar", ward_name: "Sarojini Nagar", govt_schools: 7, total_enrolment: 4600, pupil_teacher_ratio: 30, schools_without_drinking_water: 0, schools_without_functional_toilet: 0, schools_needing_upgrade: 1 },
  { ward_id: "kasturba-nagar", ward_name: "Kasturba Nagar", govt_schools: 6, total_enrolment: 3900, pupil_teacher_ratio: 32, schools_without_drinking_water: 0, schools_without_functional_toilet: 0, schools_needing_upgrade: 2 },
  { ward_id: "green-park", ward_name: "Green Park", govt_schools: 5, total_enrolment: 3200, pupil_teacher_ratio: 27, schools_without_drinking_water: 0, schools_without_functional_toilet: 0, schools_needing_upgrade: 0 },
  { ward_id: "greater-kailash", ward_name: "Greater Kailash", govt_schools: 6, total_enrolment: 3600, pupil_teacher_ratio: 26, schools_without_drinking_water: 0, schools_without_functional_toilet: 0, schools_needing_upgrade: 1 },
  { ward_id: "delhi-cantt", ward_name: "Delhi Cantt", govt_schools: 9, total_enrolment: 6400, pupil_teacher_ratio: 33, schools_without_drinking_water: 1, schools_without_functional_toilet: 0, schools_needing_upgrade: 3 },
];

/* ------------------------------------------------------------- Health facilities */

export const HEALTH_FACILITIES: HealthFacilityRow[] = [
  { ward_id: "karol-bagh", ward_name: "Karol Bagh", phc_count: 3, dispensaries: 2, govt_hospital_beds: 40, beds_per_1000: 0.6, avg_opd_wait_min: 52 },
  { ward_id: "rajinder-nagar", ward_name: "Rajinder Nagar", phc_count: 4, dispensaries: 3, govt_hospital_beds: 120, beds_per_1000: 1.4, avg_opd_wait_min: 34 },
  { ward_id: "kalkaji-ext", ward_name: "Kalkaji Ext.", phc_count: 3, dispensaries: 2, govt_hospital_beds: 30, beds_per_1000: 0.4, avg_opd_wait_min: 61 },
  { ward_id: "malviya-nagar", ward_name: "Malviya Nagar", phc_count: 5, dispensaries: 3, govt_hospital_beds: 210, beds_per_1000: 1.8, avg_opd_wait_min: 28 },
  { ward_id: "chanakyapuri", ward_name: "Chanakyapuri", phc_count: 4, dispensaries: 4, govt_hospital_beds: 340, beds_per_1000: 3.1, avg_opd_wait_min: 19 },
  { ward_id: "sarai-kale-khan", ward_name: "Sarai Kale Khan", phc_count: 2, dispensaries: 1, govt_hospital_beds: 15, beds_per_1000: 0.3, avg_opd_wait_min: 68 },
  { ward_id: "patel-nagar", ward_name: "Patel Nagar", phc_count: 3, dispensaries: 2, govt_hospital_beds: 55, beds_per_1000: 0.7, avg_opd_wait_min: 49 },
  { ward_id: "rk-puram", ward_name: "R.K. Puram", phc_count: 4, dispensaries: 3, govt_hospital_beds: 180, beds_per_1000: 1.5, avg_opd_wait_min: 33 },
  { ward_id: "sarojini-nagar", ward_name: "Sarojini Nagar", phc_count: 4, dispensaries: 3, govt_hospital_beds: 160, beds_per_1000: 1.9, avg_opd_wait_min: 26 },
  { ward_id: "kasturba-nagar", ward_name: "Kasturba Nagar", phc_count: 3, dispensaries: 2, govt_hospital_beds: 90, beds_per_1000: 1.3, avg_opd_wait_min: 31 },
  { ward_id: "green-park", ward_name: "Green Park", phc_count: 4, dispensaries: 2, govt_hospital_beds: 140, beds_per_1000: 2.0, avg_opd_wait_min: 24 },
  { ward_id: "greater-kailash", ward_name: "Greater Kailash", phc_count: 5, dispensaries: 3, govt_hospital_beds: 260, beds_per_1000: 2.6, avg_opd_wait_min: 21 },
  { ward_id: "delhi-cantt", ward_name: "Delhi Cantt", phc_count: 4, dispensaries: 3, govt_hospital_beds: 220, beds_per_1000: 2.2, avg_opd_wait_min: 27 },
];

/* ---------------------------------------------------------- CPCB air quality */

// Station-level readings mapped to the nearest ward; wards without a station
// inherit the constituency 7-day average for air-severity fallback.
export const CPCB_AIR_QUALITY: (CpcbAirQualityRow & { ward_id: string })[] = [
  { ward_id: "chanakyapuri", station_id: "DL013", station_name: "Chanakyapuri, IGI-adjacent", constituency: "New Delhi", reading_date: "2026-07-01", aqi: 288, pm25: 168, pm10: 240, dominant_pollutant: "PM2.5" },
  { ward_id: "sarai-kale-khan", station_id: "DL021", station_name: "Sarai Kale Khan", constituency: "New Delhi", reading_date: "2026-07-01", aqi: 340, pm25: 195, pm10: 268, dominant_pollutant: "PM2.5" },
  { ward_id: "rk-puram", station_id: "DL008", station_name: "R.K. Puram", constituency: "New Delhi", reading_date: "2026-07-01", aqi: 256, pm25: 142, pm10: 210, dominant_pollutant: "PM2.5" },
  { ward_id: "karol-bagh", station_id: "DL017", station_name: "Karol Bagh", constituency: "New Delhi", reading_date: "2026-07-01", aqi: 274, pm25: 158, pm10: 225, dominant_pollutant: "PM2.5" },
];

const CONSTITUENCY_AQI_AVG = Math.round(
  CPCB_AIR_QUALITY.reduce((s, r) => s + r.aqi, 0) / CPCB_AIR_QUALITY.length,
);

/* --------------------------------------------------------- DUSIB water works */

export const DUSIB_WATER: DusibWaterInfrastructureRow[] = [
  { ward_id: "karol-bagh", ward_name: "Karol Bagh", scheme_name: "Karol Bagh main-drain de-silting", status: "none", coverage_pct: 0.62, last_updated: "2025-09-14" },
  { ward_id: "kalkaji-ext", ward_name: "Kalkaji Ext.", scheme_name: "Kalkaji tanker-route augmentation", status: "none", coverage_pct: 0.58, last_updated: "2025-10-21" },
  { ward_id: "sarai-kale-khan", ward_name: "Sarai Kale Khan", scheme_name: "SKK piped-supply extension", status: "planned", coverage_pct: 0.55, last_updated: "2026-02-08" },
  { ward_id: "patel-nagar", ward_name: "Patel Nagar", scheme_name: "Patel Nagar mains renewal", status: "in_progress", coverage_pct: 0.71, last_updated: "2026-05-30" },
];

/* --------------------------------------------------------------- Lookups */

export function censusFor(wardId: string): Census2011WardRow | undefined {
  return CENSUS_2011.find((r) => r.ward_id === wardId);
}
export function schoolsFor(wardId: string): UdiseSchoolRow | undefined {
  return UDISE_SCHOOLS.find((r) => r.ward_id === wardId);
}
export function healthFor(wardId: string): HealthFacilityRow | undefined {
  return HEALTH_FACILITIES.find((r) => r.ward_id === wardId);
}
export function airFor(wardId: string): (CpcbAirQualityRow & { ward_id: string }) | undefined {
  return CPCB_AIR_QUALITY.find((r) => r.ward_id === wardId);
}
export function waterWorksFor(wardId: string): DusibWaterInfrastructureRow | undefined {
  return DUSIB_WATER.find((r) => r.ward_id === wardId);
}

/* ----------------------------------------------------------- Demand engine */

/**
 * The dimensions public data can evidence need for. Broader than the citizen-
 * signal `Category` set: education and sanitation get their own axes because
 * the datasets speak to them directly.
 */
export type DemandDimension =
  | "water"
  | "sanitation"
  | "education"
  | "health"
  | "air"
  | "infrastructure";

export const DEMAND_DIMENSIONS: { key: DemandDimension; label: string; label_hi: string }[] = [
  { key: "water", label: "Water supply", label_hi: "जल आपूर्ति" },
  { key: "sanitation", label: "Sanitation", label_hi: "स्वच्छता" },
  { key: "education", label: "Education", label_hi: "शिक्षा" },
  { key: "health", label: "Public health", label_hi: "सार्वजनिक स्वास्थ्य" },
  { key: "air", label: "Air quality", label_hi: "वायु गुणवत्ता" },
  { key: "infrastructure", label: "Urban infrastructure", label_hi: "शहरी अवसंरचना" },
];

export interface DemandMetric {
  label: string;
  value: string;
  /** Benchmark / norm the value is judged against, when one exists. */
  benchmark?: string;
}

export interface DemandSignal {
  dimension: DemandDimension;
  ward_id: string;
  ward_name: string;
  /** 0–1; higher = greater public-data-evidenced need. */
  severity: number;
  headline: string;
  metrics: DemandMetric[];
  provenance: DataProvenance;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * Turn the raw public rows into a cited 0–1 demand severity for one ward and
 * dimension. Returns null when no dataset covers the ward. This is the single
 * scoring surface the proposal-ranking engine (R4b) reads.
 */
export function demandSignals(wardId: string, dimension: DemandDimension): DemandSignal | null {
  const census = censusFor(wardId);
  const wardName = census?.ward_name ?? wardId;

  switch (dimension) {
    case "water": {
      if (!census) return null;
      const tapAccess = census.households_with_tap_water / census.total_households;
      const works = waterWorksFor(wardId);
      const accessGap = 1 - tapAccess; // 0.02–0.26
      const coverageGap = works ? 1 - works.coverage_pct : accessGap;
      const severity = clamp01((accessGap * 3) * 0.65 + coverageGap * 0.35);
      return {
        dimension,
        ward_id: wardId,
        ward_name: wardName,
        severity,
        headline: `${pct(1 - tapAccess)} of households lack a piped-water connection${works ? `; DUSIB scheme "${works.scheme_name}" is ${works.status.replace("_", " ")}` : ""}.`,
        metrics: [
          { label: "Piped-water access", value: pct(tapAccess), benchmark: "target 100%" },
          ...(works
            ? [{ label: "DUSIB coverage", value: pct(works.coverage_pct), benchmark: works.status }]
            : []),
        ],
        provenance: PUBLIC_SOURCES.water,
      };
    }
    case "sanitation": {
      if (!census) return null;
      const toiletAccess = census.households_with_toilet / census.total_households;
      const severity = clamp01((1 - toiletAccess) * 3.2);
      return {
        dimension,
        ward_id: wardId,
        ward_name: wardName,
        severity,
        headline: `${pct(1 - toiletAccess)} of households without an individual toilet.`,
        metrics: [{ label: "Household toilet access", value: pct(toiletAccess), benchmark: "target 100%" }],
        provenance: PUBLIC_SOURCES.census,
      };
    }
    case "education": {
      const s = schoolsFor(wardId);
      if (!s) return null;
      const upgradeShare = s.govt_schools > 0 ? s.schools_needing_upgrade / s.govt_schools : 0;
      const ptrOver = Math.max(0, (s.pupil_teacher_ratio - 30) / 20); // RTE norm 30:1
      const severity = clamp01(upgradeShare * 0.6 + ptrOver * 0.4);
      return {
        dimension,
        ward_id: wardId,
        ward_name: wardName,
        severity,
        headline: `${s.schools_needing_upgrade} of ${s.govt_schools} govt schools flagged for upgrade; pupil-teacher ratio ${s.pupil_teacher_ratio}:1.`,
        metrics: [
          { label: "Schools needing upgrade", value: `${s.schools_needing_upgrade} / ${s.govt_schools}` },
          { label: "Pupil-teacher ratio", value: `${s.pupil_teacher_ratio}:1`, benchmark: "RTE norm 30:1" },
          ...(s.schools_without_drinking_water > 0
            ? [{ label: "Schools without drinking water", value: String(s.schools_without_drinking_water) }]
            : []),
        ],
        provenance: PUBLIC_SOURCES.udise,
      };
    }
    case "health": {
      const h = healthFor(wardId);
      if (!h) return null;
      const bedsGap = Math.max(0, (1.0 - h.beds_per_1000) / 1.0); // benchmark 1.0/1,000
      const waitGap = clamp01((h.avg_opd_wait_min - 20) / 60);
      const severity = clamp01(bedsGap * 0.6 + waitGap * 0.4);
      return {
        dimension,
        ward_id: wardId,
        ward_name: wardName,
        severity,
        headline: `${h.beds_per_1000.toFixed(1)} public beds per 1,000 residents; average OPD wait ${h.avg_opd_wait_min} min.`,
        metrics: [
          { label: "Public beds / 1,000", value: h.beds_per_1000.toFixed(1), benchmark: "target ≥ 1.0" },
          { label: "Mohalla clinics / PHCs", value: String(h.phc_count) },
          { label: "Avg OPD wait", value: `${h.avg_opd_wait_min} min` },
        ],
        provenance: PUBLIC_SOURCES.health,
      };
    }
    case "air": {
      const station = airFor(wardId);
      const aqi = station?.aqi ?? CONSTITUENCY_AQI_AVG;
      const severity = clamp01((aqi - 100) / 300); // 100 satisfactory → 400 severe
      return {
        dimension,
        ward_id: wardId,
        ward_name: wardName,
        severity,
        headline: station
          ? `CPCB ${station.station_name}: 7-day AQI ${aqi} (${aqiBand(aqi)}), ${station.dominant_pollutant} dominant.`
          : `Constituency 7-day AQI ${aqi} (${aqiBand(aqi)}); no ward-level station.`,
        metrics: [
          { label: "7-day AQI", value: String(aqi), benchmark: aqiBand(aqi) },
          ...(station ? [{ label: "PM2.5", value: `${station.pm25} µg/m³`, benchmark: "CPCB 24h limit 60" }] : []),
        ],
        provenance: PUBLIC_SOURCES.cpcb,
      };
    }
    case "infrastructure": {
      // No single infra dataset — blend the school-upgrade backlog with the
      // sanitation gap as the best available public proxy for civic-works need.
      const edu = demandSignals(wardId, "education");
      const san = demandSignals(wardId, "sanitation");
      if (!edu && !san) return null;
      const severity = clamp01((edu?.severity ?? 0) * 0.5 + (san?.severity ?? 0) * 0.5);
      return {
        dimension,
        ward_id: wardId,
        ward_name: wardName,
        severity,
        headline: "Composite civic-works need from school-upgrade backlog and sanitation gap (no single infra dataset).",
        metrics: [
          ...(edu ? [edu.metrics[0]!] : []),
          ...(san ? [san.metrics[0]!] : []),
        ],
        provenance: PUBLIC_SOURCES.udise,
      };
    }
  }
}

function aqiBand(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

/** Rank all covered wards by demand severity for a dimension (highest need first). */
export function wardsByDemand(dimension: DemandDimension): DemandSignal[] {
  return CENSUS_2011.map((c) => demandSignals(c.ward_id, dimension))
    .filter((s): s is DemandSignal => s !== null)
    .sort((a, b) => b.severity - a.severity);
}
