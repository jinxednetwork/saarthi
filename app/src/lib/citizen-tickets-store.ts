import "server-only";
import type { CitizenTicket, SubmitTicketInput } from "@saarthi/shared";

/**
 * Server-side ticket store — the single data layer the standalone Citizen Portal
 * writes to and the MP dashboard reads from, so the two can be hosted on
 * separate links and still share grievances. In-memory + Firestore-shaped
 * (async, swappable): production replaces the module array with a Firestore
 * `tickets` collection + realtime listener, leaving the API surface untouched.
 * Seeded so the MP feed shows portal activity before anyone submits.
 */
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
const g = globalThis as unknown as { __saarthiTickets?: CitizenTicket[] };
g.__saarthiTickets ??= seed();

function all(): CitizenTicket[] {
  return (g.__saarthiTickets ??= seed());
}

export async function listTickets(): Promise<CitizenTicket[]> {
  return [...all()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTicket(
  input: SubmitTicketInput,
  ai?: { photoInsight?: string; voiceTranscript?: string },
): Promise<CitizenTicket> {
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
    photoInsight: ai?.photoInsight,
    voiceTranscript: ai?.voiceTranscript,
    status: "received",
    createdAt: new Date().toISOString(),
  };
  g.__saarthiTickets = [ticket, ...all()].slice(0, 200);
  return ticket;
}

export async function findTicket(id: string): Promise<CitizenTicket | undefined> {
  const norm = id.trim().toUpperCase();
  return all().find((t) => t.id.toUpperCase() === norm);
}
