import "server-only";
import { getDb } from "@/lib/firestore";
import type { EnrichedSignal } from "./types";

/**
 * Intake store — enriched real-world signals. Firestore `intake_signals` when
 * available (the worker would write, the dashboard subscribe), else a globalThis
 * in-memory store for offline dev. Deduped by id; newest first; capped.
 */
const COL = "intake_signals";

const g = globalThis as unknown as {
  __saarthiIntake?: EnrichedSignal[];
  __saarthiIntakeAt?: string | null;
};
g.__saarthiIntake ??= [];
g.__saarthiIntakeAt ??= null;

export function lastRefresh(): string | null {
  return g.__saarthiIntakeAt ?? null;
}

export async function listSignals(): Promise<EnrichedSignal[]> {
  const db = await getDb();
  if (db) {
    const snap = await db.collection(COL).orderBy("createdAt", "desc").limit(120).get();
    return snap.docs.map((d) => d.data() as EnrichedSignal);
  }
  return [...g.__saarthiIntake!].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Merge new signals (dedupe by id); returns how many were new. */
export async function mergeSignals(incoming: EnrichedSignal[]): Promise<number> {
  g.__saarthiIntakeAt = new Date().toISOString();
  if (incoming.length === 0) return 0;

  const db = await getDb();
  if (db) {
    const refs = incoming.map((s) => db.collection(COL).doc(s.id));
    const existing = await db.getAll(...refs);
    const known = new Set(existing.filter((d) => d.exists).map((d) => d.id));
    const fresh = incoming.filter((s) => !known.has(s.id));
    const batch = db.batch();
    // Drop the embedding from Firestore (large; clustering uses vector search later).
    for (const s of fresh) batch.set(db.collection(COL).doc(s.id), { ...s, embedding: [] });
    await batch.commit();
    return fresh.length;
  }

  const existing = g.__saarthiIntake!;
  const known = new Set(existing.map((s) => s.id));
  const fresh = incoming.filter((s) => !known.has(s.id));
  g.__saarthiIntake = [...fresh, ...existing]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 120);
  return fresh.length;
}
