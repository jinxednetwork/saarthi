import "server-only";
import { generateText } from "ai";
import { chatModel, hasGeminiKey } from "./gemini";

/**
 * Gemini multimodal helpers for citizen-submitted media (R6b/R6c). Vision
 * describes a grievance photo; audio transcription turns a spoken complaint into
 * text — both on the single Gemini key, server-side. Any failure → undefined so
 * the ticket still saves.
 */
function parseDataUrl(dataUrl: string): { mimeType: string; bytes: Uint8Array } | null {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  try {
    return { mimeType: m[1]!, bytes: new Uint8Array(Buffer.from(m[2]!, "base64")) };
  } catch {
    return null;
  }
}

const PHOTO_PROMPT =
  "You are triaging a photo attached to a civic grievance for an Indian MP's office. " +
  "In ONE short sentence, describe the civic issue visible (e.g. 'Overflowing drain with garbage beside a residential road'). " +
  "If no clear civic issue is visible, reply exactly: No clear civic issue visible.";

export async function describePhoto(dataUrl: string): Promise<string | undefined> {
  if (!hasGeminiKey()) return undefined;
  const parsed = parseDataUrl(dataUrl);
  if (!parsed || !parsed.mimeType.startsWith("image/")) return undefined;
  try {
    const { text } = await generateText({
      model: chatModel(),
      messages: [
        { role: "user", content: [{ type: "text", text: PHOTO_PROMPT }, { type: "image", image: parsed.bytes }] },
      ],
    });
    return text.trim().slice(0, 240) || undefined;
  } catch (err) {
    console.error("[ai/media] describePhoto failed:", err);
    return undefined;
  }
}

const AUDIO_PROMPT =
  "Transcribe this voice note from a citizen reporting a civic issue, verbatim. " +
  "It may be in Hindi, English, or a mix. Return only the transcript text.";

export async function transcribeAudio(dataUrl: string): Promise<string | undefined> {
  if (!hasGeminiKey()) return undefined;
  const parsed = parseDataUrl(dataUrl);
  if (!parsed || !parsed.mimeType.startsWith("audio/")) return undefined;
  try {
    const { text } = await generateText({
      model: chatModel(),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: AUDIO_PROMPT },
            { type: "file", data: parsed.bytes, mimeType: parsed.mimeType },
          ],
        },
      ],
    });
    return text.trim().slice(0, 800) || undefined;
  } catch (err) {
    console.error("[ai/media] transcribeAudio failed:", err);
    return undefined;
  }
}
