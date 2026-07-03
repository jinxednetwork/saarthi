import type { Timestamp } from "./common";

export type MessageRole = "user" | "assistant";

export const CITATION_TYPES = [
  "cluster",
  "submission",
  "document",
  "public_data",
] as const;
export type CitationType = (typeof CITATION_TYPES)[number];

/**
 * A resolvable pointer to a source record backing an assistant answer (§8.6, §14).
 * `id` must resolve to a real, retrievable record — no hallucinated citations.
 */
export interface Citation {
  type: CitationType;
  id: string;
  snippet: string;
  url?: string;
}

export interface ConversationMessage {
  role: MessageRole;
  content: string;
  /** Present on assistant messages. */
  citations?: Citation[];
  generated_at: Timestamp;
}

/**
 * `conversations/{conversation_id}` — a Saarthi Assistant (RAG) thread.
 * ENGINEERING_HANDOFF.md §6.1, §8.6.
 */
export interface Conversation {
  id: string;
  user_id: string;
  constituency: string;
  /** AI-generated from the first query. */
  title: string;
  messages: ConversationMessage[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export const CONVERSATIONS_COLLECTION = "conversations" as const;
