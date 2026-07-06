import "server-only";
import type { Firestore } from "firebase-admin/firestore";

/**
 * Firestore access (§6, §11). Auto-activates on Google infra (Cloud Run /
 * Firebase App Hosting) via Application Default Credentials, and locally when a
 * project or the emulator is configured. When unavailable it returns null and
 * callers fall back to the in-memory demo stores — so offline dev is unaffected.
 *
 *   FIREBASE_PROJECT_ID / GOOGLE_CLOUD_PROJECT — the project (set on GCP)
 *   FIRESTORE_EMULATOR_HOST — use the local emulator
 *   GOOGLE_APPLICATION_CREDENTIALS — service-account JSON (local)
 */
export function hasFirestore(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.K_SERVICE ||
      process.env.FIRESTORE_EMULATOR_HOST,
  );
}

// Resolve once per process, then reuse. Cache the PROMISE (not the value) so
// concurrent first-callers share a single probe instead of racing.
let probe: Promise<Firestore | null> | undefined;

async function connect(): Promise<Firestore | null> {
  if (!hasFirestore()) return null;
  try {
    const { getApps, initializeApp } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (!getApps().length) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      });
    }
    const db = getFirestore();
    // Init never touches the network, so it "succeeds" even when the Firestore
    // API is disabled or no database exists — the failure only surfaces on the
    // first real call. Probe once here so a misconfigured project degrades to
    // the in-memory store transparently instead of 500ing every route.
    // (Collection id must not match /__.*__/ — that pattern is reserved.)
    await db.collection("_reachability_probe").limit(1).get();
    return db;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[firestore] unreachable — using in-memory store. (${msg.slice(0, 120)})`);
    return null;
  }
}

export async function getDb(): Promise<Firestore | null> {
  return (probe ??= connect());
}
