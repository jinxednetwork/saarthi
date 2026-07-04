import { embed, streamText } from "ai";
import { ask, type AssistantCitation } from "@/lib/assistant-brain";
import { baseCorpus, type EmbeddedChunk } from "@/lib/ai/corpus";
import { chatModel, embeddingModel, hasGeminiKey } from "@/lib/ai/gemini";
import { topK } from "@/lib/ai/cosine";

export const runtime = "nodejs";

/**
 * POST /api/assistant — grounded RAG answer (§8.6). The key lives only here
 * (§14). Flow: embed the query → cosine top-K over the base corpus merged with
 * the MP's uploaded-document chunks → Gemini answers strictly from that context
 * → citations (computed server-side from the retrieved records, never from the
 * model's free text) travel in the `x-saarthi-meta` header while the answer
 * streams in the body. No key or any error → the scripted brain answers through
 * the identical body+header contract, so the client path never branches.
 */

interface AssistantRequest {
  query?: string;
  /** Uploaded-document chunks the client carries (R3C5); empty for now. */
  docChunks?: EmbeddedChunk[];
}

interface Meta {
  mode: "gemini" | "scripted";
  citations: AssistantCitation[];
  chips: string[];
}

const GEMINI_CHIPS = [
  "What changed this week?",
  "Which issues could I fund with MPLADS?",
  "How is my budget tracking?",
];

function encodeMeta(meta: Meta): string {
  return Buffer.from(JSON.stringify(meta), "utf8").toString("base64");
}

/** Same body+header shape as the streamed path, so the client never branches. */
function scriptedResponse(query: string): Response {
  const a = ask(query);
  const meta: Meta = { mode: "scripted", citations: a.citations, chips: a.chips };
  return new Response(a.text, {
    headers: { "content-type": "text/plain; charset=utf-8", "x-saarthi-meta": encodeMeta(meta) },
  });
}

function dedupeCitations(citations: AssistantCitation[], max = 4): AssistantCitation[] {
  const seen = new Set<string>();
  const out: AssistantCitation[] = [];
  for (const c of citations) {
    const key = c.clusterId ?? c.documentId ?? c.href ?? c.label;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= max) break;
  }
  return out;
}

const SYSTEM = `You are Saarthi, an executive-intelligence assistant for a Member of Parliament in India.
Answer ONLY from the numbered CONTEXT provided. It is drawn from this constituency's live citizen signals, MPLADS budget, and public-data cross-references.
Rules:
- Be concise and direct, in the register of a senior aide briefing an MP. Lead with the answer.
- Use only figures present in the context; never invent numbers, wards, or dataset names.
- When the context does not cover the question, say so plainly and suggest what the MP could ask instead. Do not speculate.
- Refer to clusters by their title (the interface shows the citations separately, so do not print bracketed indices or a sources list).
- Keep it under ~140 words unless the question needs a short list.`;

export async function POST(request: Request): Promise<Response> {
  let body: AssistantRequest;
  try {
    body = (await request.json()) as AssistantRequest;
  } catch {
    body = {};
  }
  const query = (body.query ?? "").trim();
  if (!query) return new Response("Ask me about your constituency's signals, budget, or actions.", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-saarthi-meta": encodeMeta({ mode: "scripted", citations: [], chips: GEMINI_CHIPS }),
    },
  });

  if (!hasGeminiKey()) return scriptedResponse(query);

  try {
    const { embedding } = await embed({ model: embeddingModel(), value: query });
    const docChunks = Array.isArray(body.docChunks) ? body.docChunks : [];
    const corpus: EmbeddedChunk[] = [...(await baseCorpus()), ...docChunks];
    const hits = topK(corpus, embedding, 6);

    const context = hits
      .map((h, i) => `[${i + 1}] ${h.item.text}`)
      .join("\n\n");
    const citations = dedupeCitations(hits.map((h) => h.item.citation));
    const meta: Meta = { mode: "gemini", citations, chips: GEMINI_CHIPS };

    const result = await streamText({
      model: chatModel(),
      system: SYSTEM,
      prompt: `CONTEXT:\n${context}\n\nMP's question: ${query}`,
      temperature: 0.3,
    });

    return result.toTextStreamResponse({ headers: { "x-saarthi-meta": encodeMeta(meta) } });
  } catch (err) {
    // Any Gemini failure (quota, network, bad key) degrades to the scripted brain.
    console.error("[/api/assistant] falling back to scripted brain:", err);
    return scriptedResponse(query);
  }
}
