"use client";

import { create } from "zustand";
import { deleteOriginal } from "./idb-docs";

/**
 * Documents store — parsed letter/report records + their RAG chunks, persisted
 * to localStorage (originals live in IndexedDB, §idb-docs). The chunk embeddings
 * are what let the Assistant answer over the MP's own paperwork. Size-guarded:
 * oldest documents evict when the persisted payload nears the localStorage
 * budget (embeddings are ~6 KB/chunk).
 */
export type DocFileType = "pdf" | "image" | "txt";

export interface DocEntity {
  name: string;
  type: string;
}
export interface DocAmount {
  label: string;
  value: string;
}
export interface DocChunk {
  chunkId: string;
  text: string;
  embedding: number[];
}

export interface DocumentRecord {
  id: string;
  filename: string;
  fileType: DocFileType;
  mimeType: string;
  uploadedAt: string;
  docType: string;
  summary: string;
  sender?: string;
  recipient?: string;
  subject?: string;
  dates: string[];
  amounts: DocAmount[];
  entities: DocEntity[];
  chunks: DocChunk[];
  /** "gemini" when a key parsed it; "mock" for the offline demo parse. */
  mode: "gemini" | "mock";
}

/** Wire shape sent to /api/assistant — matches the server EmbeddedChunk. */
export interface AssistantDocChunk {
  id: string;
  kind: "document";
  text: string;
  citation: { label: string; documentId: string };
  embedding: number[];
}

const STORAGE_KEY = "saarthi-documents";
const MAX_BYTES = 3_500_000; // keep well under the 5 MB localStorage ceiling

interface DocumentsState {
  documents: DocumentRecord[];
  hydrated: boolean;
  hydrate(): void;
  addDocument(doc: DocumentRecord): void;
  removeDocument(id: string): void;
  /** Embedded chunks across all docs, for the Assistant's RAG merge. */
  assistantChunks(): AssistantDocChunk[];
}

function persist(documents: DocumentRecord[]): DocumentRecord[] {
  // Evict oldest until the serialized payload fits.
  const kept = [...documents];
  while (kept.length > 0) {
    const payload = JSON.stringify(kept);
    if (payload.length <= MAX_BYTES) {
      try {
        localStorage.setItem(STORAGE_KEY, payload);
      } catch {
        kept.shift();
        continue;
      }
      return kept;
    }
    kept.shift(); // drop oldest (front of the list is oldest)
  }
  try {
    localStorage.setItem(STORAGE_KEY, "[]");
  } catch {}
  return kept;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    let documents: DocumentRecord[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) documents = JSON.parse(raw) as DocumentRecord[];
    } catch {}
    set({ documents, hydrated: true });
  },
  addDocument: (doc) =>
    set((s) => {
      // Newest last (front = oldest, so eviction drops oldest first).
      const documents = persist([...s.documents, doc]);
      return { documents, hydrated: true };
    }),
  removeDocument: (id) => {
    void deleteOriginal(id);
    set((s) => ({ documents: persist(s.documents.filter((d) => d.id !== id)) }));
  },
  assistantChunks: () =>
    get()
      .documents.flatMap((d) =>
        d.chunks
          .filter((c) => c.embedding.length > 0)
          .map((c) => ({
            id: `doc:${d.id}:${c.chunkId}`,
            kind: "document" as const,
            text: c.text,
            citation: { label: d.filename, documentId: d.id },
            embedding: c.embedding,
          })),
      ),
}));
