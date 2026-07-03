/**
 * Enrichment stage (§7.7 steps 1–8): STT (Cloud Speech Chirp), Vision photo
 * analysis, document parse, translation, geolocation (NER + landmark matching),
 * political-noise + credibility scoring.
 *
 * TODO(Phase 2): implement against Cloud STT / Vertex Vision / Gemini. For now the
 * text-only path lives in `../pipeline.ts#enrichSubmission` using the AiClient.
 */
export {};
