import crypto from "node:crypto";

/**
 * Fires a real Meta-shaped WhatsApp webhook payload — signed with
 * WHATSAPP_APP_SECRET — at the live /api/ingest/whatsapp endpoint. Demo
 * fallback for when the Meta Developer app itself is blocked (account-level
 * enforcement, unrelated to this code): proves the actual production webhook
 * works without needing Meta's approval.
 *
 * Run: WHATSAPP_APP_SECRET=<same value deployed on Cloud Run> \
 *   pnpm --filter @saarthi/scripts sim:whatsapp -- "Drain overflowing near Karol Bagh market" [phone] [url]
 */
const [message, phone = "919999999999", url = "https://saarthi-app-353201937460.asia-south1.run.app/api/ingest/whatsapp"] =
  process.argv.slice(2);

const secret = process.env.WHATSAPP_APP_SECRET;

if (!message) {
  console.error('Usage: sim:whatsapp -- "<message text>" [phone] [webhook url]');
  process.exit(1);
}
if (!secret) {
  console.error("WHATSAPP_APP_SECRET is not set — must match the value deployed on Cloud Run (app/.env.local).");
  process.exit(1);
}

const body = JSON.stringify({
  entry: [{ changes: [{ value: { messages: [{ from: phone, text: { body: message } }] } }] }],
});
const signature = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-hub-signature-256": signature },
  body,
});
console.log(res.status, await res.text());
