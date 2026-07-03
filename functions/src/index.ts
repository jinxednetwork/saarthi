/**
 * @saarthi/functions — Firebase Cloud Functions entry (§4, §9.2).
 * Re-exports the intake webhook handlers. When wiring Firebase, wrap each in
 * `onRequest` / scheduler triggers here.
 */
export * from "./webhooks";
