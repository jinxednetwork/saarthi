/**
 * Common primitives and shared unions used across the Saarthi data model.
 * See ENGINEERING_HANDOFF.md §6.
 */

/**
 * SDK-agnostic Firestore timestamp shape. Both `firebase-admin` and the
 * `firebase/firestore` client `Timestamp` classes satisfy this structurally,
 * so `@saarthi/shared` never has to depend on a specific Firebase SDK.
 */
export interface Timestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

/** [west, south, east, north] */
export type BoundingBox = [number, number, number, number];

/** Intake channels (§2, §6.1 submissions.source). */
export const SUBMISSION_SOURCES = [
  "whatsapp",
  "twitter",
  "reddit",
  "widget",
  "portal",
  "news",
  "document",
] as const;
export type SubmissionSource = (typeof SUBMISSION_SOURCES)[number];

/** v1 category scope (§2). `subcategory` stays free-form string. */
export const CATEGORIES = [
  "water",
  "health",
  "air_quality",
  "infrastructure",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

/** Action pathway determined by the action-tagger (§8.5). */
export const ACTION_PATHWAYS = [
  "MPLADS",
  "STATE",
  "CENTRAL",
  "COORDINATION",
] as const;
export type ActionPathway = (typeof ACTION_PATHWAYS)[number];

/** UI + citizen-intake language codes. "hi-en" = code-mixed Hinglish. */
export type LanguageCode = "en" | "hi" | "hi-en" | (string & {});

/** Languages the dashboard UI is localised into (§10). */
export const UI_LANGUAGES = ["en", "hi"] as const;
export type UiLanguage = (typeof UI_LANGUAGES)[number];
