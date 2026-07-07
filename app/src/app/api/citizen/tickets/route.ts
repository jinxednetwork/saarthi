import { NextResponse } from "next/server";
import { CITIZEN_CATEGORIES, NEW_DELHI_WARDS, type SubmitTicketInput } from "@saarthi/shared";
import { describePhoto, transcribeAudio } from "@/lib/ai/media";
import { createTicket, findTicket, listTickets } from "@/lib/citizen-tickets-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shared tickets API — the bridge between the standalone Citizen Portal (a
 * separate deployment) and the MP dashboard. The portal POSTs a grievance; the
 * dashboard GETs the list. CORS is open so the portal can live on its own
 * origin. (Production: swap the in-memory store for Firestore; API unchanged.)
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: Request) {
  // Single-ticket lookup for the portal's "track your report" — returns just the
  // caller's own ticket instead of shipping every citizen's grievance + GPS.
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const ticket = await findTicket(id);
    if (!ticket) return NextResponse.json({ error: "Not found." }, { status: 404, headers: CORS });
    return NextResponse.json({ ticket }, { headers: CORS });
  }
  const tickets = await listTickets();
  return NextResponse.json({ tickets }, { headers: CORS });
}

export async function POST(request: Request) {
  let body: Partial<SubmitTicketInput>;
  try {
    body = (await request.json()) as Partial<SubmitTicketInput>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400, headers: CORS });
  }

  const ward = NEW_DELHI_WARDS.find((w) => w.id === body.wardId);
  const cat = CITIZEN_CATEGORIES.find((c) => c.category === body.category);
  const description = (body.description ?? "").trim();

  if (!ward || !cat || description.length < 8) {
    return NextResponse.json(
      { error: "A valid ward, category, and a short description are required." },
      { status: 400, headers: CORS },
    );
  }

  // Gemini enriches the attached media (R6b/R6c) — vision on the photo, audio
  // transcription on the voice note. Non-fatal: the ticket saves regardless.
  const [photoInsight, voiceTranscript] = await Promise.all([
    body.photoDataUrl ? describePhoto(body.photoDataUrl).catch(() => undefined) : undefined,
    body.voiceDataUrl ? transcribeAudio(body.voiceDataUrl).catch(() => undefined) : undefined,
  ]);

  const ticket = await createTicket(
    {
      phone: body.phone ?? "",
      category: cat.category,
      categoryLabel: cat.label,
      wardId: ward.id,
      wardName: ward.name,
      description,
      photoCount: Math.max(0, Math.min(8, Number(body.photoCount) || 0)),
      hasVoice: Boolean(body.hasVoice),
      lat: typeof body.lat === "number" ? body.lat : undefined,
      lng: typeof body.lng === "number" ? body.lng : undefined,
    },
    { photoInsight, voiceTranscript },
  );

  return NextResponse.json({ ticket }, { status: 201, headers: CORS });
}
