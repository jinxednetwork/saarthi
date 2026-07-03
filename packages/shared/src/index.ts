/**
 * @saarthi/shared — the single source of truth for Saarthi's domain model.
 *
 * Firestore document shapes and BigQuery row types are defined here ONCE and
 * imported by `app`, `worker`, and `functions` so write-side and read-side shapes
 * never drift (ENGINEERING_HANDOFF.md §4).
 */
export * from "./types/index";
