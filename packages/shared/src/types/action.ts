import type { Timestamp } from "./common";

export const ACTION_TYPES = [
  "MPLADS_LETTER",
  "STATE_LETTER",
  "PARLIAMENT_QUESTION",
  "MEETING",
  "BRIEF_SHARED",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_STATUSES = [
  "draft",
  "sent",
  "responded",
  "completed",
] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const ACTION_OUTCOMES = [
  "sanctioned",
  "denied",
  "underway",
  "completed",
  "no_response",
] as const;
export type ActionOutcome = (typeof ACTION_OUTCOMES)[number];

export type ActionAuthor = "ai" | "staff" | "mp";

export interface AuditLogEntry {
  timestamp: Timestamp;
  actor: string;
  event: string;
}

/**
 * `actions/{action_id}` — a tracked action taken on a cluster, with an audit trail.
 * ENGINEERING_HANDOFF.md §6.1.
 */
export interface Action {
  id: string;
  cluster_id: string;
  type: ActionType;
  status: ActionStatus;
  drafted_by: ActionAuthor;
  approved_by?: string;
  sent_to: string;
  sent_at?: Timestamp;
  response?: string;
  outcome?: ActionOutcome;
  /** Generated brief/letter PDF (Cloud Storage). */
  document_url?: string;
  audit_log: AuditLogEntry[];
}

export const ACTIONS_COLLECTION = "actions" as const;
