import type { Timestamp } from "./common";

/** Generated output types (§8.7). `cabinet_note` is pitch-only for v1. */
export const BRIEF_TYPES = [
  "daily_briefing",
  "meeting_prep",
  "policy_summary",
  "parliament_question",
  "mplads_letter",
  "cabinet_note",
] as const;
export type BriefType = (typeof BRIEF_TYPES)[number];

export const BRIEF_FORMATS = ["pdf", "pptx", "docx"] as const;
export type BriefFormat = (typeof BRIEF_FORMATS)[number];

export const BRIEF_STATUSES = ["generating", "ready", "failed"] as const;
export type BriefStatus = (typeof BRIEF_STATUSES)[number];

/**
 * `briefs/{brief_id}` — a generated executive output with full input provenance.
 * ENGINEERING_HANDOFF.md §6.1, §8.7.
 */
export interface Brief {
  id: string;
  generated_by: string;
  constituency: string;
  type: BriefType;
  format: BriefFormat;
  title: string;
  /** The user's ask, if any. */
  prompt: string;
  input_cluster_ids: string[];
  input_document_ids: string[];
  /** Cloud Storage signed URL. */
  output_url: string;
  output_size_bytes: number;
  status: BriefStatus;
  created_at: Timestamp;
}

export const BRIEFS_COLLECTION = "briefs" as const;
