/**
 * Intelligence screen content — ported from the design session handoff
 * (`Awaaz Design Session Handoff/Intelligence.dc.html`). Static demo data;
 * Phase 4+ replaces this with model output from the worker (§8).
 */

export const INTELLIGENCE_META = {
  subtitle: "AI-generated recommendations for Bansuri Swaraj MP, week 44",
  modelLine: "Model v2.3.1 · every recommendation cites its evidence",
  modelFooter: "Model v2.3.1 · retrained monthly",
} as const;

/** Insight type → accent colours (design `_typeStyles`). */
export const INSIGHT_TYPES = {
  predictive: { color: "#C15A15", bg: "#C15A1518", label: "Predictive" },
  causal: { color: "#054A91", bg: "#054A9118", label: "Causal" },
  political: { color: "#1D6B3B", bg: "#1D6B3B18", label: "Political" },
  sentiment: { color: "#8A5219", bg: "#8A521918", label: "Sentiment" },
} as const;
export type InsightType = keyof typeof INSIGHT_TYPES;

export const FORECAST_HERO = {
  eyebrow: "Forecast · 12 weeks out",
  meta: "Confidence 82% · updated 12:47 PM",
  headline:
    "Air quality complaints will spike ~4× starting week 45 through Diwali & winter inversion.",
  body: "Historical pattern (2021–24) shows PM2.5 breaches 300 μg/m³ within 6–9 days after Diwali in New Delhi wards. Complaint volume tracks AQI with a 3-day lag. Chanakyapuri and Sarai Kale Khan are the most affected wards last three years running.",
  actionsLabel: "Recommended pre-emptive actions",
  actions: [
    "Coordinate DDA + CPWD to pause dust-generating construction in Chanakyapuri from week 45",
    "Pre-request MoEFCC sprinkler deployment for embassy zone approach roads",
    "Advance the Parliament Question you were planning for week 46 to week 44",
  ],
  cta: "Apply all 3 recommendations",
  citations: [
    "CPCB · 4-year PM2.5 archive",
    "IMD · winter inversion forecast",
    "Saarthi historical signal archive",
    "DDA permit register",
  ],
} as const;

export const BUDGET_HERO = {
  eyebrow: "Budget optimizer · MPLADS",
  meta: "Compliance rules · 2023 revision",
  headline: "Close the SC allocation gap of ₹11 L in 3 moves this month.",
  body: "You're at 12.8% SC allocation — 2.2 points below MPLADS's 15% floor. Three permitted works in SC-designated wards would clear the gap while addressing your top-ranked citizen priorities.",
  moves: [
    {
      title: "Solar streetlights, Sriniwaspuri SC-designated blocks",
      note: "Addresses cluster #04 · aligns with weekly priorities",
      cost: "₹6.2 L",
    },
    {
      title: "Drainage repair, Ambedkar Nagar service lane",
      note: "Preventive · in Karol Bagh waterlogging watershed",
      cost: "₹3.4 L",
    },
    {
      title: "Community tuition centre, Valmiki Colony",
      note: "Long-standing request · Sarojini Nagar constituency office",
      cost: "₹1.8 L",
    },
  ],
  outcome: { label: "After these 3:", value: "SC allocation → 15.4%", status: "On track" },
  cta: "Draft all 3 sanctions",
} as const;

/** 12-week outlook chart (design SVG geometry, viewBox 0 0 1280 300). */
export const OUTLOOK_CHART = {
  legend: [
    { key: "health", label: "Public health", color: "#C15A15" },
    { key: "water", label: "Water & sanitation", color: "#054A91" },
    { key: "infra", label: "Urban infrastructure", color: "#12325B" },
  ],
  /** Amber health/AQ line with its 80% confidence band. */
  healthLine:
    "80,218 150,215 220,197 290,145 340,111 400,47 460,32 520,60 580,115 640,148 700,165 760,188 820,200 880,208 940,220 1000,224 1060,220 1120,213 1180,210 1240,208",
  healthBand:
    "M 80 218 L 150 215 L 220 197 L 290 145 L 340 111 L 400 47 L 460 32 L 520 60 L 580 115 L 640 148 L 700 165 L 760 188 L 820 200 L 880 208 L 940 220 L 1000 224 L 1060 220 L 1120 213 L 1180 210 L 1240 208 L 1240 232 L 1180 234 L 1120 230 L 1060 236 L 1000 240 L 940 236 L 880 224 L 820 216 L 760 204 L 700 181 L 640 164 L 580 131 L 520 76 L 460 48 L 400 63 L 340 130 Z",
  infraLine:
    "80,208 150,205 220,201 290,193 340,177 400,183 460,187 520,192 580,196 640,200 700,196 760,190 820,184 880,180 940,183 1000,190 1060,197 1120,201 1180,203 1240,207",
  waterLine:
    "80,232 150,224 220,213 290,208 340,190 400,196 460,201 520,205 580,209 640,213 700,215 760,218 820,222 880,225 940,226 1000,224 1060,222 1120,220 1180,217 1240,215",
  /** x of the actual/forecast split ("now"), and per-line y at that x. */
  nowX: 340,
  nowDots: [
    { y: 111, color: "#C15A15" },
    { y: 177, color: "#12325B" },
    { y: 190, color: "#054A91" },
  ],
  annotations: [
    { x: 440, label: "Diwali · wk 45", color: "#C15A15" },
    { x: 890, label: "Winter session · wk 49", color: "#054A91" },
  ],
  peak: { x: 460, y: 32, label: "Peak · ~220" },
  yLabels: [
    { y: 32, label: "250" },
    { y: 92, label: "200" },
    { y: 152, label: "150" },
    { y: 212, label: "100" },
    { y: 264, label: "50" },
  ],
  xLabels: [
    { x: 80, label: "Wk 40" },
    { x: 220, label: "Wk 42" },
    { x: 340, label: "Wk 44 · now", now: true },
    { x: 500, label: "Wk 46" },
    { x: 700, label: "Wk 49" },
    { x: 940, label: "Wk 52" },
    { x: 1240, label: "Wk 56" },
  ] as { x: number; label: string; now?: boolean }[],
  footer: {
    trainedOn: "Trained on 4 years of Delhi complaint archives + public data",
    confidence: 82,
  },
} as const;

export interface CrossRef {
  type: InsightType;
  title: string;
  detail: string;
  confidence: string;
  sources: string[];
  actionLabel: string;
}

export const CROSS_REFS: CrossRef[] = [
  {
    type: "predictive",
    title: "Waterlogging risk on Bagirathi Road matches DUSIB drain lifecycle",
    detail:
      "Drains that go 12+ months without de-silting show a 3.4× waterlogging rate. Bagirathi Road drains crossed 14 months last week. Weekly monsoon forecast: 24mm rain in 48h.",
    confidence: "Confidence 74%",
    sources: ["DUSIB drain register", "IMD 48-h forecast", "Saarthi signal history"],
    actionLabel: "Draft MPLADS letter",
  },
  {
    type: "causal",
    title: "RK Puram sewer complaints correlate with adjacent construction start dates",
    detail:
      "Every DDA-approved construction start within 300m of a sewer line correlates with a 2.1× complaint spike within 6–10 days. Two active permits in RK Puram Sector 4.",
    confidence: "Confidence 89%",
    sources: ["DDA permit register", "DUSIB complaint log", "Saarthi signal history"],
    actionLabel: "Notify contractors",
  },
  {
    type: "sentiment",
    title: "Rajinder Nagar drainage complaints shifted from “report” to “demand”",
    detail:
      "Language classifier shows a 42% swing this week — citizens moving from filing complaints to expressing frustration with the response cycle. Historically a leading indicator for escalation.",
    confidence: "Confidence 68%",
    sources: ["Saarthi sentiment classifier", "Historical escalation patterns"],
    actionLabel: "Schedule field visit",
  },
];

export interface Anomaly {
  title: string;
  magnitude: string;
  detail: string;
  baseline: string;
  color: string;
}

export const ANOMALIES: Anomaly[] = [
  {
    title: "Karol Bagh signal spike outpaces IMD prediction by 2×",
    magnitude: "↑ 340% w/w",
    detail:
      "Waterlogging signals exceed what the drainage-lifecycle + rainfall model predicts by a factor of 2. Suggests undocumented drain blockage or unrecorded construction spillover.",
    baseline: "Expected: ~55% w/w increase · Actual: 340%",
    color: "#A3311F",
  },
  {
    title: "Malviya Nagar water complaints without matching DJB signal",
    magnitude: "18 signals",
    detail:
      "Citizens report tanker delays but DJB tanker-routing feed shows 100% on-time. Data gap — likely private tanker vendor or unofficial route.",
    baseline: "DJB reported deliveries: 42/42 · Saarthi signals: 18 delays",
    color: "#B77321",
  },
];

export interface BenchmarkRow {
  name: string;
  count: number;
  response: string;
  highlight: boolean;
}

export const BENCHMARK_ROWS: BenchmarkRow[] = [
  { name: "New Delhi (yours)", count: 12.3, response: "3.2 days", highlight: true },
  { name: "South Delhi Lok Sabha", count: 8.7, response: "4.8 days", highlight: false },
  { name: "Chandni Chowk", count: 14.1, response: "2.9 days", highlight: false },
  { name: "East Delhi", count: 11.5, response: "5.1 days", highlight: false },
];
