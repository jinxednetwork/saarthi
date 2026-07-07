import "server-only";
import type { CitizenTicket, SubmitTicketInput } from "@saarthi/shared";
import { getDb } from "./firestore";

/**
 * Server-side ticket store — the single data layer the standalone Citizen Portal
 * writes to and the MP dashboard reads from. Uses the Firestore `citizen_tickets`
 * collection when available (Cloud Run / App Hosting via ADC), and a globalThis
 * in-memory store otherwise so offline dev is unaffected. Same async surface.
 */
const COL = "citizen_tickets";
function ticketId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NDL-${year}-${rand}`;
}

function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.length >= 4 ? `••••••${d.slice(-4)}` : "••••";
}

const minsAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

function seed(): CitizenTicket[] {
  return [
  {
    id: "NDL-2026-4821",
    phoneMasked: "••••••4471",
    category: "water",
    categoryLabel: "Water supply",
    wardId: "karol-bagh",
    wardName: "Karol Bagh",
    description: "Main road drain overflowing for 3 days near the market, water entering shops.",
    photoCount: 2,
    hasVoice: false,
    status: "acknowledged",
    createdAt: minsAgo(12),
  },
  {
    id: "NDL-2026-5093",
    phoneMasked: "••••••2210",
    category: "health",
    categoryLabel: "Health & sanitation",
    wardId: "kalkaji-ext",
    wardName: "Kalkaji Ext.",
    description: "Mohalla clinic has been shut for 3 days, patients turned away in the morning.",
    photoCount: 0,
    hasVoice: true,
    status: "received",
    createdAt: minsAgo(34),
  },
  ];
}

// Persist on globalThis so the store survives dev/HMR module recompiles (which
// would otherwise reset it to seeds between the portal's POST and the
// dashboard's GET). Production single-instance keeps it until restart; Firestore
// replaces this entirely.
const g = globalThis as unknown as { __saarthiTickets?: CitizenTicket[]; __saarthiSeeded?: boolean };
g.__saarthiTickets ??= seed();
function mem(): CitizenTicket[] {
  return (g.__saarthiTickets ??= seed());
}

function buildTicket(
  input: SubmitTicketInput,
  ai?: { photoInsight?: string; voiceTranscript?: string },
): CitizenTicket {
  const ticket: CitizenTicket = {
    id: ticketId(),
    phoneMasked: maskPhone(input.phone),
    category: input.category,
    categoryLabel: input.categoryLabel,
    wardId: input.wardId,
    wardName: input.wardName,
    description: input.description,
    photoCount: input.photoCount,
    hasVoice: input.hasVoice,
    status: "received",
    createdAt: new Date().toISOString(),
  };
  // Only set optional fields when present (Firestore rejects undefined).
  if (ai?.photoInsight) ticket.photoInsight = ai.photoInsight;
  if (ai?.voiceTranscript) ticket.voiceTranscript = ai.voiceTranscript;
  if (input.lat != null && input.lng != null) {
    ticket.lat = input.lat;
    ticket.lng = input.lng;
  }
  return ticket;
}

// Seed the Firestore collection once (per process) if it's empty, so a fresh
// deployment shows portal activity like the local demo does.
async function ensureSeeded(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  if (g.__saarthiSeeded) return;
  g.__saarthiSeeded = true;
  const snap = await db.collection(COL).limit(1).get();
  if (snap.empty) {
    const batch = db.batch();
    for (const t of seed()) batch.set(db.collection(COL).doc(t.id), t);
    await batch.commit();
  }
}

export async function listTickets(): Promise<CitizenTicket[]> {
  const db = await getDb();
  if (db) {
    await ensureSeeded(db);
    const snap = await db.collection(COL).orderBy("createdAt", "desc").limit(200).get();
    return snap.docs.map((d) => d.data() as CitizenTicket);
  }
  return [...mem()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTicket(
  input: SubmitTicketInput,
  ai?: { photoInsight?: string; voiceTranscript?: string },
): Promise<CitizenTicket> {
  const ticket = buildTicket(input, ai);
  const db = await getDb();
  if (db) await db.collection(COL).doc(ticket.id).set(ticket);
  else g.__saarthiTickets = [ticket, ...mem()].slice(0, 200);
  return ticket;
}

export async function findTicket(id: string): Promise<CitizenTicket | undefined> {
  const norm = id.trim().toUpperCase();
  const db = await getDb();
  if (db) {
    const doc = await db.collection(COL).doc(norm).get();
    return doc.exists ? (doc.data() as CitizenTicket) : undefined;
  }
  return mem().find((t) => t.id.toUpperCase() === norm);
}
