import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import type { EmbeddingModel, LanguageModel } from "ai";

/**
 * Gemini provider — server-only (§14: no credential ever reaches the client).
 *
 * Two backends, chosen once at module load:
 *
 *  1. **Vertex AI via ADC** (preferred). Set `GOOGLE_VERTEX_PROJECT` (or
 *     `GOOGLE_CLOUD_PROJECT`). No API key — it uses Application Default
 *     Credentials: locally from `gcloud auth application-default login`, and in
 *     production from the Cloud Run / App Hosting runtime service account
 *     (which sets `GOOGLE_CLOUD_PROJECT` automatically). This is the
 *     hackathon's recommended enterprise path and lifts the AI-Studio
 *     free-tier daily quota.
 *
 *  2. **AI Studio key** (fallback). `GOOGLE_GENERATIVE_AI_API_KEY`. Zero-setup,
 *     handy for a laptop without gcloud.
 *
 * If neither is configured, `hasGeminiKey()` returns false and every caller
 * falls back to the scripted brain, so the app still runs fully offline.
 *
 * Models: gemini-2.5-flash (chat / RAG / parse), gemini-2.5-pro (briefs),
 * gemini-embedding-001 (3072-dim). The same embedding model runs on BOTH
 * backends, so corpus and query vectors always share dimensionality even if the
 * backend differs between environments.
 */

const VERTEX_PROJECT = process.env.GOOGLE_VERTEX_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const VERTEX_LOCATION = process.env.GOOGLE_VERTEX_LOCATION || "us-central1";
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

type Backend = "vertex" | "studio";
const backend: Backend | null = VERTEX_PROJECT ? "vertex" : API_KEY ? "studio" : null;

/** Which backend is live (for logging / the assistant's `mode` field). */
export function geminiBackend(): Backend | null {
  return backend;
}

/** True when Gemini is reachable by either backend; guard every model call with it. */
export function hasGeminiKey(): boolean {
  return backend !== null;
}

type Provider = {
  chat(model: string): LanguageModel;
  embedding(model: string): EmbeddingModel<string>;
};

const provider: Provider | null = (() => {
  if (backend === "vertex") {
    const vertex = createVertex({ project: VERTEX_PROJECT, location: VERTEX_LOCATION });
    return { chat: (m) => vertex(m), embedding: (m) => vertex.textEmbeddingModel(m) };
  }
  if (backend === "studio") {
    const google = createGoogleGenerativeAI({ apiKey: API_KEY });
    return { chat: (m) => google(m), embedding: (m) => google.textEmbeddingModel(m) };
  }
  return null;
})();

function requireProvider(): Provider {
  if (!provider) throw new Error("Gemini not configured — call hasGeminiKey() before using a model.");
  return provider;
}

export function chatModel(): LanguageModel {
  return requireProvider().chat("gemini-2.5-flash");
}

export function proModel(): LanguageModel {
  return requireProvider().chat("gemini-2.5-pro");
}

export function embeddingModel(): EmbeddingModel<string> {
  return requireProvider().embedding("gemini-embedding-001");
}
