import "server-only";
import { embedMany, generateObject } from "ai";
import { z } from "zod";
import { NEW_DELHI_WARDS } from "@saarthi/shared";
import { chatModel, embeddingModel, hasGeminiKey } from "@/lib/ai/gemini";
import type { EnrichedSignal, RawPost, Sentiment, Urgency } from "./types";

/**
 * Gemini enrichment — the Google-AI heart of intake. Each raw post is triaged by
 * Gemini 2.5 Flash (relevance, category, urgency, sentiment, ward, summary) and
 * embedded with text-embedding-004 for clustering. No key → a keyword classifier
 * so the pipeline still runs offline (marked mode:"keyword").
 */
const ItemSchema = z.object({
  relevant: z.boolean().describe("True only if this is a genuine local civic grievance for New Delhi"),
  category: z.enum(["water", "health", "air_quality", "infrastructure", "other"]),
  urgency: z.enum(["critical", "high", "medium", "low"]),
  sentiment: z.enum(["angry", "concerned", "neutral", "positive"]),
  ward: z.string().describe("The New Delhi ward it most likely refers to, or 'Unknown'"),
  summary: z.string().describe("One neutral sentence summarising the civic issue"),
});
const BatchSchema = z.object({ items: z.array(ItemSchema) });

const SYSTEM =
  "You triage civic social-media posts for a Member of Parliament's office in New Delhi. " +
  "Return one entry per numbered post, in order. Be strict about `relevant`: memes, jokes, " +
  "national politics, and non-Delhi content are not relevant. Map to the closest category.";

const WARD_NAMES = NEW_DELHI_WARDS.map((w) => w.name);

function geminiPrompt(posts: RawPost[]): string {
  const list = posts
    .map((p, i) => `${i + 1}. [${p.source} ${p.handle}] ${p.title}\n${p.text}`.slice(0, 600))
    .join("\n\n");
  return `New Delhi wards: ${WARD_NAMES.join(", ")}.\n\nPosts:\n\n${list}`;
}

/* ---------------- keyword fallback ---------------- */

const KW: Record<string, string[]> = {
  water: ["water", "drain", "sewage", "tap", "waterlog", "pipeline", "tanker", "flood"],
  air_quality: ["pollution", "aqi", "smog", "dust", "air quality", "pm2.5", "pm 2.5"],
  health: ["hospital", "clinic", "dengue", "disease", "sanitation", "garbage", "mosquito", "health"],
  infrastructure: ["pothole", "road", "streetlight", "street light", "footpath", "metro", "construction", "electricity", "power cut"],
};
const URGENT = ["urgent", "emergency", "danger", "accident", "flood", "severe", "crisis", "dying"];
const ANGRY = ["angry", "fed up", "pathetic", "shame", "worst", "disgusting", "ridiculous"];

function keywordEnrich(p: RawPost): Omit<EnrichedSignal, "embedding" | "mode"> {
  const hay = `${p.title} ${p.text}`.toLowerCase();
  let category: EnrichedSignal["category"] = "other";
  for (const [cat, words] of Object.entries(KW)) {
    if (words.some((w) => hay.includes(w))) {
      category = cat as EnrichedSignal["category"];
      break;
    }
  }
  const urgency: Urgency = URGENT.some((w) => hay.includes(w)) ? "high" : "medium";
  const sentiment: Sentiment = ANGRY.some((w) => hay.includes(w)) ? "angry" : "concerned";
  const ward = WARD_NAMES.find((w) => hay.includes(w.toLowerCase())) ?? "Unknown";
  return {
    id: p.id,
    source: p.source,
    author: p.author,
    handle: p.handle,
    url: p.url,
    createdAt: p.createdAt,
    text: p.text || p.title,
    relevant: category !== "other",
    category,
    urgency,
    sentiment,
    ward,
    summary: p.title || p.text.slice(0, 120),
    mediaUrl: p.mediaUrl,
  };
}

/* ---------------- entry point ---------------- */

export async function enrich(posts: RawPost[]): Promise<EnrichedSignal[]> {
  if (posts.length === 0) return [];

  if (!hasGeminiKey()) {
    return posts.map((p) => ({ ...keywordEnrich(p), embedding: [], mode: "keyword" as const }));
  }

  try {
    const { object } = await generateObject({
      model: chatModel(),
      schema: BatchSchema,
      system: SYSTEM,
      prompt: geminiPrompt(posts),
    });
    const items = object.items;
    const summaries = posts.map((p, i) => items[i]?.summary ?? p.title);

    // Embeddings are for future clustering — a failure here must NOT discard the
    // Gemini classification we just got.
    let embeddings: number[][] = [];
    try {
      embeddings = (await embedMany({ model: embeddingModel(), values: summaries })).embeddings;
    } catch (embedErr) {
      console.error("[intake/classify] embedding failed (keeping classification):", embedErr);
    }

    return posts.map((p, i) => {
      const it = items[i];
      const base = it
        ? {
            relevant: it.relevant,
            category: it.category,
            urgency: it.urgency,
            sentiment: it.sentiment,
            ward: it.ward,
            summary: it.summary,
          }
        : keywordEnrich(p);
      return {
        id: p.id,
        source: p.source,
        author: p.author,
        handle: p.handle,
        url: p.url,
        createdAt: p.createdAt,
        text: p.text || p.title,
        ...base,
        embedding: embeddings[i] ?? [],
        mediaUrl: p.mediaUrl,
        mode: "gemini" as const,
      };
    });
  } catch (err) {
    console.error("[intake/classify] Gemini enrich failed, using keyword fallback:", err);
    return posts.map((p) => ({ ...keywordEnrich(p), embedding: [], mode: "keyword" as const }));
  }
}
