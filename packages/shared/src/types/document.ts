import type { Category, Timestamp } from "./common";

export type DocumentFileType = "pdf" | "docx" | "txt";

/** Personal = owner-only; constituency = shared to the whole office (§14). */
export type DocumentVisibility = "constituency" | "personal";

export interface ExtractedEntities {
  people: string[];
  places: string[];
  organizations: string[];
  dates: string[];
  monetary_values: string[];
}

/** A ~500-token RAG chunk with its embedding (§7.6). */
export interface DocumentChunk {
  chunk_id: string;
  text: string;
  embedding: number[];
  page?: number;
}

export interface DocumentPage {
  page: number;
  text: string;
}

/**
 * `documents/{document_id}` — an uploaded PDF/DOCX/report, parsed + chunked for RAG.
 * ENGINEERING_HANDOFF.md §6.1, §7.6.
 */
export interface SaarthiDocument {
  id: string;
  uploaded_by: string;
  constituency: string;
  filename: string;
  /** Cloud Storage signed URL (1h expiry). */
  original_url: string;
  file_type: DocumentFileType;
  parsed_text: string;
  parsed_pages?: DocumentPage[];
  extracted_entities: ExtractedEntities;
  /** Gemini-generated summary. */
  summary: string;
  category?: Category;
  chunks: DocumentChunk[];
  visibility: DocumentVisibility;
  created_at: Timestamp;
}

export const DOCUMENTS_COLLECTION = "documents" as const;
