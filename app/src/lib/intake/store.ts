import "server-only";
import type { EnrichedSignal } from "./types";

/**
 * Intake store — enriched real-world signals, on globalThis so they survive dev
 * recompiles. (Production: Firestore, with the worker writing and the dashboard
 * subscribing.) Deduped by id; newest first; capped.
 */
const g = globalThis as unknown as {
  __saarthiIntake?: EnrichedSignal[];
  __saarthiIntakeAt?: string | null;
};
g.__saarthiIntake ??= [];
g.__saarthiIntakeAt ??= null;

export function listSignals(): EnrichedSignal[] {
  return [...g.__saarthiIntake!].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function lastRefresh(): string | null {
  return g.__saarthiIntakeAt ?? null;
}

/** Merge new signals (dedupe by id), keep the most recent 120. */
export function mergeSignals(incoming: EnrichedSignal[]): number {
  const existing = g.__saarthiIntake!;
  const known = new Set(existing.map((s) => s.id));
  const fresh = incoming.filter((s) => !known.has(s.id));
  g.__saarthiIntake = [...fresh, ...existing]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 120);
  g.__saarthiIntakeAt = new Date().toISOString();
  return fresh.length;
}
