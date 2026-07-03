import { CATEGORIES, EMBEDDING_DIM } from "@saarthi/shared";
import type { Category, Urgency } from "@saarthi/shared";

/**
 * AI provider abstraction (§8.8). Real implementations wrap Gemini + Vertex AI;
 * `MockAiClient` runs the whole pipeline offline (SAARTHI_MOCK_AI=true) with
 * deterministic outputs so clustering/ranking are demonstrable without cloud.
 */
export interface ClassificationResult {
  category: Category;
  subcategory: string;
  urgency: Urgency;
  is_political_noise: boolean;
}

export interface AiClient {
  /** Vertex text-embedding-004 in prod; deterministic bag-of-words here. */
  embed(text: string): Promise<number[]>;
  /** Gemini Flash category/urgency classification (§8.8). */
  classify(text: string): Promise<ClassificationResult>;
  /** Translate any language → English (§7.7 step 3). */
  translate(text: string): Promise<string>;
  /** Gemini Pro free-form generation (cluster titles, letters, RAG answers). */
  generate(prompt: string): Promise<string>;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  water: ["water", "पानी", "tap", "supply", "sewage", "drain", "sanitation", "leak"],
  health: ["health", "clinic", "phc", "hospital", "doctor", "स्वास्थ्य", "dengue", "medicine"],
  air_quality: ["air", "aqi", "pm2.5", "pm10", "smog", "pollution", "प्रदूषण", "dust"],
  infrastructure: ["road", "सड़क", "pothole", "streetlight", "bridge", "footpath", "drainage"],
  other: [],
};

const URGENCY_KEYWORDS: Record<Exclude<Urgency, "low">, string[]> = {
  critical: ["emergency", "no water", "collapse", "outbreak", "urgent", "तुरंत"],
  high: ["days", "severe", "repeated", "worsening", "spike"],
  medium: ["issue", "problem", "complaint", "समस्या"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}.]+/u)
    .filter(Boolean);
}

/** Deterministic, offline stand-in for real Gemini/Vertex calls. */
export class MockAiClient implements AiClient {
  async embed(text: string): Promise<number[]> {
    // Hashed bag-of-words → L2-normalised vector. Similar text ⇒ similar vector,
    // so cosine similarity in clustering is meaningful for the demo.
    const vec = new Array<number>(EMBEDDING_DIM).fill(0);
    for (const tok of tokenize(text)) {
      let h = 2166136261;
      for (let i = 0; i < tok.length; i++) {
        h ^= tok.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      const idx = Math.abs(h) % EMBEDDING_DIM;
      vec[idx] = (vec[idx] ?? 0) + 1;
    }
    const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
    return vec.map((x) => x / norm);
  }

  async classify(text: string): Promise<ClassificationResult> {
    const tokens = new Set(tokenize(text));
    let best: Category = "other";
    let bestHits = 0;
    for (const cat of CATEGORIES) {
      const hits = CATEGORY_KEYWORDS[cat].filter((k) => tokens.has(k)).length;
      if (hits > bestHits) {
        best = cat;
        bestHits = hits;
      }
    }
    let urgency: Urgency = "low";
    for (const level of ["critical", "high", "medium"] as const) {
      if (URGENCY_KEYWORDS[level].some((k) => text.toLowerCase().includes(k))) {
        urgency = level;
        break;
      }
    }
    return {
      category: best,
      subcategory: bestHits > 0 ? `${best}_general` : "unclassified",
      urgency,
      is_political_noise: /\b(vote|party|election|rally)\b/i.test(text),
    };
  }

  async translate(text: string): Promise<string> {
    // Offline: identity. Real client routes non-English through Gemini Flash.
    return text;
  }

  async generate(prompt: string): Promise<string> {
    return `[mock-generated] ${prompt.slice(0, 80)}`;
  }
}

/** Factory honouring SAARTHI_MOCK_AI / SAARTHI_MODE (§ .env.example). */
export function createAiClient(): AiClient {
  const mock =
    process.env.SAARTHI_MOCK_AI === "true" ||
    process.env.SAARTHI_MODE === "emulator" ||
    !process.env.GEMINI_API_KEY;
  if (mock) return new MockAiClient();
  // TODO(Phase 2): return new GeminiVertexClient() wrapping @google/genai + Vertex.
  return new MockAiClient();
}
