import type { SubmissionSource } from "@saarthi/shared";

/**
 * Intake webhook receivers (§7, §9.2). Each normalises a channel-specific payload
 * into a `NormalizedIntake` and (TODO Phase 2) publishes it to Pub/Sub
 * (`submission-created`) for the worker to enrich + cluster.
 *
 * Kept framework-agnostic for now: real deployment wraps each handler in
 * `firebase-functions/v2/https` onRequest (WhatsApp/widget) or a Cloud Scheduler
 * pull (Reddit/news). Signatures are verified where the platform supports it (§9.2).
 */
export interface NormalizedIntake {
  source: SubmissionSource;
  text: string;
  language?: string;
  external_id?: string;
  author_hash?: string;
  media_urls?: string[];
  received_at_ms: number;
}

export type WebhookHandler = (payload: unknown) => NormalizedIntake[];

/** WhatsApp Business Cloud API (§7.1). TODO: verify X-Hub-Signature. */
export const whatsappWebhook: WebhookHandler = () => {
  // TODO(Phase 2): parse Meta payload (text/voice/photo), hash phone number.
  return [];
};

/** X / Twitter filtered stream (§7.2). TODO: dedupe on tweet id (24h). */
export const twitterWebhook: WebhookHandler = () => [];

/** Reddit poller push (§7.3). TODO: filter civic keywords + geo mentions. */
export const redditWebhook: WebhookHandler = () => [];

/** Embedded widget submissions (§7.4). TODO: rate-limit by origin. */
export const widgetWebhook: WebhookHandler = () => [];

/** News RSS poller push (§7.5). TODO: Gemini Flash relevance filter. */
export const newsWebhook: WebhookHandler = () => [];

/** Dashboard document upload (§7.6). TODO: store to GCS + trigger document-ingest. */
export const documentUploadWebhook: WebhookHandler = () => [];
