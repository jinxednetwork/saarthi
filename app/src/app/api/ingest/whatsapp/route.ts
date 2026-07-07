import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { CITIZEN_CATEGORIES, NEW_DELHI_WARDS } from "@saarthi/shared";
import { generateText } from "ai";
import { chatModel, hasGeminiKey } from "@/lib/ai/gemini";
import { createTicket } from "@/lib/citizen-tickets-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Meta WhatsApp Business Cloud API webhook (§7.1, §9.2). Reuses the same
 * `createTicket` store the Citizen Portal widget writes to, so a WhatsApp
 * message shows up on the MP dashboard exactly like a portal submission.
 */
const DEMO_WARD = NEW_DELHI_WARDS[0]!;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === token) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function classifyCategory(text: string) {
  if (hasGeminiKey()) {
    try {
      const labels = CITIZEN_CATEGORIES.map((c) => c.category).join(", ");
      const { text: pick } = await generateText({
        model: chatModel(),
        messages: [
          {
            role: "user",
            content:
              `Classify this citizen grievance into exactly one of: ${labels}. ` +
              `Reply with only the category word.\n\n"${text}"`,
          },
        ],
      });
      const match = CITIZEN_CATEGORIES.find((c) => pick.toLowerCase().includes(c.category));
      if (match) return match;
    } catch (err) {
      console.error("[ingest/whatsapp] category classification failed:", err);
    }
  }
  return CITIZEN_CATEGORIES.find((c) => c.category === "other")!;
}

async function sendReply(to: string, body: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return;
  try {
    await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, text: { body } }),
    });
  } catch (err) {
    console.error("[ingest/whatsapp] reply send failed:", err);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message?.text?.body || !message?.from) {
    // Delivery/read-receipt callbacks and non-text messages: acknowledge, no-op.
    return NextResponse.json({ ok: true });
  }

  const text: string = message.text.body;
  const from: string = message.from;

  const cat = await classifyCategory(text);
  const ticket = await createTicket({
    phone: from,
    category: cat.category,
    categoryLabel: cat.label,
    wardId: DEMO_WARD.id,
    wardName: DEMO_WARD.name,
    description: text,
    photoCount: 0,
    hasVoice: false,
  });

  await sendReply(from, `Thanks — logged as ${ticket.id}. Our team will follow up.`);

  return NextResponse.json({ ok: true, ticketId: ticket.id });
}
