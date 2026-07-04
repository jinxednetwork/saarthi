import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { EmbeddingModel, LanguageModel } from "ai";

/**
 * Gemini provider — server-only (§14: the key never reaches the client). Every
 * caller guards on `hasGeminiKey()` and falls back to the scripted brain when
 * the key is absent, so the app runs fully offline for judging without a key.
 *
 * Models: gemini-2.5-flash (chat / RAG / parse), gemini-2.5-pro (briefs),
 * text-embedding-004 (768-dim, matches EMBEDDING_DIM).
 */
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export function hasGeminiKey(): boolean {
  return typeof API_KEY === "string" && API_KEY.length > 0;
}

const provider = hasGeminiKey() ? createGoogleGenerativeAI({ apiKey: API_KEY }) : null;

function requireProvider() {
  if (!provider) throw new Error("Gemini key missing — call hasGeminiKey() before using a model.");
  return provider;
}

export function chatModel(): LanguageModel {
  return requireProvider()("gemini-2.5-flash");
}

export function proModel(): LanguageModel {
  return requireProvider()("gemini-2.5-pro");
}

export function embeddingModel(): EmbeddingModel<string> {
  return requireProvider().textEmbeddingModel("text-embedding-004");
}
