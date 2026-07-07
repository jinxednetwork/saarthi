import "server-only";
import type { RawPost } from "./types";

/**
 * X (Twitter) intake via Apify — the official X API is ~$200/mo for limited
 * reads, so this uses a pay-per-result Apify actor behind APIFY_TOKEN. No
 * token → returns nothing (Reddit/news still carry the demo). Server-only.
 *
 * Actor: kaitoeasyapi/twitter-x-data-tweet-scraper (…-cheapest). Chosen because,
 * unlike the higher-profile apidojo scrapers, it permits API use on Apify's FREE
 * plan (verified 2026-07-07). Input { searchTerms, maxItems, sort }; output items
 * carry text, url/twitterUrl, author.userName, createdAt, id.
 */
const ACTOR = "kaitoeasyapi~twitter-x-data-tweet-scraper-pay-per-result-cheapest";
// Grouped so "Delhi" is required AND at least one civic term matches — a bare OR
// chain makes X match any word globally (e.g. "garbage" in unrelated tweets).
// Gemini's `relevant` filter still scopes to New Delhi wards downstream.
const SEARCH_TERMS = [
  "Delhi (water OR drain OR sewage OR waterlogging OR pothole OR pollution OR AQI OR garbage OR sanitation)",
];

export function hasApifyToken(): boolean {
  return typeof process.env.APIFY_TOKEN === "string" && process.env.APIFY_TOKEN.length > 0;
}

/** X via the Apify actor — the fallback path when no official X bearer token is set (see x.ts). */
export async function fetchXApify(maxItems = 15): Promise<RawPost[]> {
  if (!hasApifyToken()) return [];
  try {
    const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ searchTerms: SEARCH_TERMS, maxItems, sort: "Latest" }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Apify ${res.status}`);
    const items = (await res.json()) as Record<string, unknown>[];
    return items.slice(0, maxItems).map((it, i) => {
      const text = String(it.text ?? it.fullText ?? it.full_text ?? "");
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
