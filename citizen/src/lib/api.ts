import type { CitizenTicket, SubmitTicketInput } from "@saarthi/shared";

/**
 * Client for the shared Saarthi tickets API. The portal is a separate
 * deployment, so this points at the dashboard/API origin (env-configured, CORS
 * open on the server). Submissions here appear in the MP's live feed.
 */
const BASE = process.env.NEXT_PUBLIC_SAARTHI_API_URL ?? "http://localhost:3000";

export async function submitTicket(input: SubmitTicketInput): Promise<CitizenTicket> {
  const res = await fetch(`${BASE}/api/citizen/tickets`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Submission failed.");
  return data.ticket as CitizenTicket;
}

export async function findTicket(id: string): Promise<CitizenTicket | undefined> {
  // Look up the single ticket by id (server normalises casing/whitespace) rather
  // than downloading the whole list — no other citizen's data crosses the wire.
  const res = await fetch(`${BASE}/api/citizen/tickets?id=${encodeURIComponent(id.trim())}`, {
    cache: "no-store",
  });
  if (res.status === 404) return undefined;
  const data = await res.json();
  return data.ticket as CitizenTicket | undefined;
}
