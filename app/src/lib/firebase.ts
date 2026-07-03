/**
 * Firebase client configuration (§3.2).
 *
 * NOTE: the `firebase` SDK is intentionally NOT a dependency yet — the skeleton
 * runs fully offline against mock data so `pnpm install` needs no cloud packages.
 * When Phase 4 (auth + Firestore listeners) begins, add `firebase` to
 * app/package.json and replace the `initFirebase()` stub below with real
 * `initializeApp` / `getAuth` / `getFirestore` calls, wiring the emulator
 * connectors when `useEmulators` is true.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

export const useEmulators =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

/** Placeholder — see file header. Real init lands in Phase 4. */
export function initFirebase(): never {
  throw new Error(
    "Firebase SDK not wired yet. Add `firebase` to app/package.json and " +
      "implement initFirebase() (Phase 4). The skeleton uses mock data.",
  );
}
