import { embedMany, generateObject } from "ai";
import { z } from "zod";
import { chatModel, embeddingModel, hasGeminiKey } from "@/lib/ai/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/documents/parse — parse an uploaded letter/report (§7.6). Gemini
 * reads the PDF/image/text multimodally and returns structured fields + RAG
 * chunks, which are then embedded so the Assistant can answer over the document.
 * The key stays server-only (§14). No key or any failure → a deterministic mock
 * parse, so the whole pipeline (upload → parse → library) works offline.
 */

const MAX_BYTES = 10 * 1024 * 1024;

const DocSchema = z.object({
  docType: z.string().describe("Document type, e.g. 'Official letter', 'Notice', 'Circular', 'Report'"),
  summary: z.string().describe("A 2-3 sentence executive summary written for a Member of Parliament"),
  sender: z.string().optional().describe("Originating office / sender, if identifiable"),
  recipient: z.string().optional().describe("Addressee, if identifiable"),
  subject: z.string().optional().describe("The subject line / reference of the document"),
  dates: z.array(z.string()).describe("Key dates: issue date, deadlines, meeting dates"),
  amounts: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .describe("Monetary values / budget figures, each with what it refers to"),
  entities: z
    .array(z.object({ name: z.string(), type: z.string() }))
    .describe("Key named entities (person, organization, place, scheme) with their type"),
  chunks: z
    .array(z.string())
    .describe("The document split into 3-8 self-contained passages (~2-4 sentences) for retrieval"),
});

type Parsed = z.infer<typeof DocSchema>;

interface ParseResponse {
  mode: "gemini" | "mock";
  parsed: Omit<Parsed, "chunks">;
  chunks: { chunkId: string; text: string; embedding: number[] }[];
}

const INSTRUCTION =
  "You are parsing an official document received by an Indian MP's office. Extract the fields precisely from the document's actual content. Write the summary for a busy MP. Split the full text into retrieval passages that each stand on their own.";

function mockParse(filename: string): ParseResponse {
  const base = filename.replace(/\.[^.]+$/, "");
  const chunks = [
    `This document (${base}) is an official communication received by the MP office for New Delhi constituency. It concerns constituency development works under the MPLADS scheme.`,
    "The District Magistrate requests confirmation of the sanctioned works list and the release schedule for the second tranche of funds for the current fiscal year.",
    "A compliance note reminds that the SC/ST allocation floors (15% and 7.5%) must be reflected in the sanctioned works before the tranche is released.",
    "A response is requested within 15 working days, failing which the pending works may be deferred to the next quarter.",
  ];
  return {
    mode: "mock",
    parsed: {
      docType: "Official letter",
      summary:
        "The District Magistrate's office seeks confirmation of the MPLADS sanctioned-works list and the fund-release schedule, and flags the statutory SC/ST allocation floors. A response is due within 15 working days.",
      sender: "Office of the District Magistrate, New Delhi District",
      recipient: "Member of Parliament, New Delhi",
      subject: "MPLADS sanctioned works — confirmation & second-tranche release",
      dates: ["Response due: within 15 working days"],
      amounts: [{ label: "Second tranche (indicative)", value: "₹2.5 Cr" }],
      entities: [
        { name: "District Magistrate, New Delhi", type: "organization" },
        { name: "MPLADS", type: "scheme" },
        { name: "New Delhi", type: "place" },
      ],
    },
    chunks: chunks.map((text, i) => ({ chunkId: `c${i}`, text, embedding: [] })),
  };
}

export async function POST(request: Request): Promise<Response> {
  // Reject oversize bodies up front, before formData() buffers the whole upload
  // into memory (margin over MAX_BYTES covers multipart framing overhead).
  const declaredLen = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLen) && declaredLen > MAX_BYTES + 1_000_000) {
    return Response.json({ error: "File too large (max 10 MB)." }, { status: 413 });
  }
  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    /* fall through to error below */
  }
  if (!file) return Response.json({ error: "No file provided." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "File too large (max 10 MB)." }, { status: 413 });

  const filename = file.name || "document";
  if (!hasGeminiKey()) return Response.json(mockParse(filename));

  try {
    const mime = file.type || "application/octet-stream";
    const bytes = new Uint8Array(await file.arrayBuffer());

    const filePart =
      mime.startsWith("image/")
        ? { type: "image" as const, image: bytes }
        : mime === "text/plain"
          ? { type: "text" as const, text: `Document text:\n\n${new TextDecoder().decode(bytes).slice(0, 20000)}` }
          : { type: "file" as const, data: bytes, mimeType: mime };

    const { object } = await generateObject({
      model: chatModel(),
      schema: DocSchema,
      messages: [{ role: "user", content: [{ type: "text", text: INSTRUCTION }, filePart] }],
    });

    const texts = object.chunks.length ? object.chunks : [object.summary];
    const { embeddings } = await embedMany({ model: embeddingModel(), values: texts });
    const { chunks: _drop, ...parsed } = object;

    const res: ParseResponse = {
      mode: "gemini",
      parsed,
      chunks: texts.map((text, i) => ({ chunkId: `c${i}`, text, embedding: embeddings[i] ?? [] })),
    };
    return Response.json(res);
  } catch (err) {
    console.error("[/api/documents/parse] falling back to mock:", err);
    return Response.json(mockParse(filename));
  }
}
