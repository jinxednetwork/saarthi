import "server-only";
import type { RawPost } from "./types";
import { fetchXApify, hasApifyToken } from "./apify";

/**
 * X (Twitter) intake. PRIMARY path is the official X API v2 recent-search
 * endpoint (GET /2/tweets/search/recent) when X_BEARER_TOKEN is set — more
 * trustworthy than a third-party scraper. Falls back to the Apify actor
 * (see apify.ts) otherwise. Recent search is available on all tiers, but the
 * monthly Post-read cap is low on Free (~100/mo), so max_results stays modest.
 * No source configured → [] and the route falls back to sample posts.
 */
// "Delhi" required + a civic term, English, no retweets/replies. ≤512 chars.
const QUERY =
  "(water OR drain OR sewage OR waterlogging OR pothole OR pollution OR AQI OR garbage OR sanitation) Delhi lang:en -is:retweet -is:reply";

export function hasXOfficial(): boolean {
  return typeof process.env.X_BEARER_TOKEN === "string" && process.env.X_BEARER_TOKEN.length > 0;
}

/** X is fetchable via the official API (preferred) or the Apify actor. */
export function hasXSource(): boolean {
  return hasXOfficial() || hasApifyToken();
}

export async function fetchX(maxItems = 15): Promise<RawPost[]> {
  if (hasXOfficial()) return fetchXOfficial(maxItems);
  if (hasApifyToken()) return fetchXApify(maxItems);
  return [];
}

interface XTweet {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
  attachments?: { media_keys?: string[] };
}
interface XUser {
  id: string;
  username: string;
}
interface XMedia {
  media_key: string;
  type: string;
  url?: string;
  preview_image_url?: string;
}
interface XSearchResponse {
  data?: XTweet[];
  includes?: { users?: XUser[]; media?: XMedia[] };
}

async function fetchXOfficial(maxItems: number): Promise<RawPost[]> {
  try {
    // max_results must be 10..100; keep it modest to conserve the read cap.
    const maxResults = Math.min(100, Math.max(10, maxItems));
    const params = new URLSearchParams({
      query: QUERY,
      max_results: String(maxResults),
      "tweet.fields": "created_at,author_id,lang,attachments",
      expansions: "author_id,attachments.media_keys",
      "user.fields": "username",
      "media.fields": "url,preview_image_url,type",
    });
    const res = await fetch(`https://api.x.com/2/tweets/search/recent?${params}`, {
      headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`X API ${res.status} ${await res.text().catch(() => "")}`.slice(0, 200));
    const json = (await res.json()) as XSearchResponse;
    const users = new Map((json.includes?.users ?? []).map((u) => [u.id, u.username]));
    const media = new Map((json.includes?.media ?? []).map((m) => [m.media_key, m.url ?? m.preview_image_url]));
    return (json.data ?? []).slice(0, maxItems).map((t) => {
      const handle = users.get(t.author_id ?? "") ?? "unknown";
      const mediaUrl = t.attachments?.media_keys?.map((k) => media.get(k)).find(Boolean) ?? undefined;
      return {
        id: `x_${t.id}`,
        source: "twitter" as const,
        author: `@${handle}`,
        title: t.text.slice(0, 80),
        text: t.text.slice(0, 1200),
        url: `https://x.com/${handle}/status/${t.id}`,
        createdAt: t.created_at ?? new Date().toISOString(),
        handle: `@${handle}`,
        mediaUrl,
      };
    });
  } catch (err) {
    console.error("[intake/x] official X fetch failed:", err);
    return [];
  }
}
