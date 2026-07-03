import type {
  Category,
  LanguageCode,
  SubmissionSource,
  Timestamp,
  Urgency,
} from "./common";

/** Geographic resolution attached to a submission (§6.1). */
export interface SubmissionGeo {
  country: "IN";
  state: string;
  district: string;
  constituency: string;
  assembly?: string;
  ward?: string;
  locality?: string;
  lat?: number;
  lng?: number;
  /** 0–1 confidence in the resolved location. */
  confidence: number;
}

export interface SubmissionMedia {
  voice_note_url?: string;
  photo_urls?: string[];
  transcription?: string;
  photo_tags?: string[];
  photo_captions?: string[];
}

/** Present when `source === "news"`. */
export interface NewsRef {
  url: string;
  publication: string;
  published_at: Timestamp;
}

/**
 * `submissions/{submission_id}` — a single ingested civic signal from any channel.
 * ENGINEERING_HANDOFF.md §6.1.
 */
export interface Submission {
  id: string;
  source: SubmissionSource;
  raw_text: string;
  /** Always English for internal processing. */
  translated_text: string;
  original_language: LanguageCode;
  media: SubmissionMedia;
  /** Set when `source === "document"` — links to `documents/{id}`. */
  document_ref?: string;
  /** Set when `source === "news"`. */
  news_ref?: NewsRef;
  geo: SubmissionGeo;
  category: Category;
  subcategory: string;
  urgency: Urgency;
  cluster_id?: string;
  /** 0–1 credibility (source + account age + verification + language quality). */
  credibility_score: number;
  is_political_noise: boolean;
  /** Hashed per-constituency (§14). Never displayed. */
  citizen_id?: string;
  /** Vertex text-embedding-004 vector (768-dim). For vector search. */
  embedding: number[];
  created_at: Timestamp;
  processed_at?: Timestamp;
}

/** Firestore collection path. */
export const SUBMISSIONS_COLLECTION = "submissions" as const;
