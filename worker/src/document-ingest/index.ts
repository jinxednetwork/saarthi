/**
 * Document ingest (§7.6): parse uploaded PDF/DOCX (Gemini multimodal / Document AI)
 * → structured text + entity extraction → ~500-token chunks with embeddings for RAG
 * → optional per-chunk `submission` when a chunk references a specific issue/geo.
 *
 * TODO(Phase 4): implement parse + chunk + embed. Writes `documents/{id}` (§6.1).
 */
export {};
