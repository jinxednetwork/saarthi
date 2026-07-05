import "server-only";
import type { RawPost } from "./types";

/**
 * X (Twitter) intake via Apify — the official X API is ~$200/mo for limited
 * reads, so this uses the pay-per-result Apify actor behind APIFY_TOKEN. No
 * token → returns nothing (Reddit still carries the demo). Server-only.
 */
const ACTOR = "kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest";
const SEARCH_TERMS = ["New Delhi water OR drain OR pothole OR pollution OR garbage"];

export function hasApifyToken(): boolean {
  return typeof process.env.APIFY_TOKEN === "string" && process.env.APIFY_TOKEN.length > 0;
}

export async function fetchX(maxItems = 15): Promise<RawPost[]> {
  if (!hasApifyToken()) return [];
  try {
    const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // The actor's input shape; adjust field names to the actor's schema if needed.
      body: JSON.stringify({ searchTerms: SEARCH_TERMS, maxItems, sort: "Latest" }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Apify ${res.status}`);
    const items = (await res.json()) as Record<string, unknown>[];
    return items.slice(0, maxItems).map((it, i) => {
      const text = String(it.text ?? it.full_text ?? "");
      const authorObj = (it.author ?? {}) as Record<string, unknown>;
      const handle = String(authorObj.userName ?? it.username ?? "unknown");
      return {
        id: `x_${String(it.id ?? it.id_str ?? i)}`,
        source: "twitter" as const,
        author: `@${handle}`,
        title: text.slice(0, 80),
        text: text.slice(0, 1200),
        url: String(it.url ?? it.twitterUrl ?? "https://x.com"),
        createdAt: String(it.createdAt ?? it.created_at ?? new Date().toISOString()),
        handle: `@${handle}`,
      };
    });
  } catch (err) {
    console.error("[intake/apify] X fetch failed:", err);
    return [];
  }
}
