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

let cached: Firestore | null | undefined;

export async function getDb(): Promise<Firestore | null> {
  if (cached !== undefined) return cached;
  if (!hasFirestore()) {
    cached = null;
    return null;
  }
  try {
    const { getApps, initializeApp } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    if (!getApps().length) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      });
    }
    cached = getFirestore();
    return cached;
  } catch (err) {
    console.error("[firestore] init failed — falling back to in-memory:", err);
    cached = null;
    return null;
  }
}
