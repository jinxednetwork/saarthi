/**
 * Seed Firestore from data/seed (§ scripts). Requires the Firestore emulator
 * running (`pnpm emulators`) and `firebase-admin` installed.
 *
 * TODO(Phase 1/4): add `firebase-admin`, connect to FIRESTORE_EMULATOR_HOST, run
 * each raw seed submission through the worker pipeline (enrich → cluster → rank) and
 * write submissions + clusters + the New Delhi constituency doc.
 *
 * Run: `pnpm seed:firestore`
 */
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

if (!emulatorHost) {
  console.error(
    "FIRESTORE_EMULATOR_HOST is not set. Start emulators (`pnpm emulators`) and set " +
      "the env (see .env.example) before seeding. Aborting — not writing to a real project.",
  );
  process.exitCode = 1;
} else {
  console.log(`Would seed Firestore at ${emulatorHost}.`);
  console.log("Not yet implemented — add firebase-admin + pipeline wiring (see file header).");
}
