import "server-only";
import type { RawPost } from "./types";
import { hasApifyToken } from "./apify";

/**
 * Reddit intake. Reddit's 2025-26 Responsible Builder Policy gates new OAuth apps
 * behind a manual approval that rejects non-commercial projects, so the PRIMARY
 * path is the Apify reddit scraper (no Reddit app / approval needed, free-plan
 * friendly — verified 2026-07-07). If REDDIT_CLIENT_ID/SECRET ever get approved,
 * the app-only OAuth path is used instead. No source configured → [] and the
 * route falls back to labelled sample posts.
 */
const SUBREDDITS = ["delhi", "DelhiNCR"];
const CIVIC =
  "waterlogging OR drain OR sewage OR water OR pothole OR garbage OR pollution OR AQI OR streetlight OR sanitation";
const UA = "Saarthi/0.1 (MP civic-intake)";
const REDDIT_ACTOR = "trudax~reddit-scraper-lite";

export function hasRedditOAuth(): boolean {
  return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
}

/** Reddit is fetchable via approved OAuth, or (default) the Apify scraper. */
export function hasRedditSource(): boolean {
  return hasRedditOAuth() || hasApifyToken();
}

/** OAuth (if approved) wins; else Apify; else nothing. */
export async function fetchReddit(limitPerSub = 12): Promise<RawPost[]> {
  if (hasRedditOAuth()) return fetchRedditOAuth(limitPerSub);
  if (hasApifyToken()) return fetchRedditApify(limitPerSub * SUBREDDITS.length);
  return [];
}

/* ---------------- Apify path (primary — bypasses Reddit app approval) ---------------- */

interface ApifyRedditItem {
  id?: string;
  url?: string;
  username?: string;
  title?: string;
  body?: string;
  parsedCommunityName?: string;
  createdAt?: string;
}

async function fetchRedditApify(maxItems: number): Promise<RawPost[]> {
  try {
    // Reddit 403s datacenter IPs, so the scraper must use a residential proxy.
    const startUrls = SUBREDDITS.map((s) => ({
      url: `https://www.reddit.com/r/${s}/search/?q=${encodeURIComponent(CIVIC)}&restrict_sr=1&sort=new`,
    }));
    const url = `https://api.apify.com/v2/acts/${REDDIT_ACTOR}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        startUrls,
        skipComments: true,
        skipUserPosts: true,
        skipCommunity: true,
        maxItems,
        proxy: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Apify reddit ${res.status}`);
    const items = (await res.json()) as ApifyRedditItem[];
    return items
      .filter((it) => it.title || it.body)
      .map((it) => ({
        // Stable id (permalink/title as fallback) so store.ts dedup recognises a
        // re-fetched post — Math.random() here re-inserted it on every refresh.
        id: `reddit_${String(it.id ?? it.url ?? it.title ?? "unknown")}`,
        source: "reddit" as const,
        author: `u/${String(it.username ?? "unknown")}`,
        title: String(it.title ?? ""),
        text: String(it.body ?? "").slice(0, 1200),
        url: String(it.url ?? "https://www.reddit.com"),
        createdAt: String(it.createdAt ?? new Date().toISOString()),
        handle: `r/${String(it.parsedCommunityName ?? "delhi")}`,
      }));
  } catch (err) {
    console.error("[intake/reddit] Apify fetch failed:", err);
    return [];
  }
}

/* ---------------- OAuth path (used only once an app is approved) ---------------- */

async function appToken(): Promise<string | null> {
  const basic = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "content-type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reddit token ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

function parse(children: { data: Record<string, unknown> }[], sub: string): RawPost[] {
  return children.map((c) => {
    const d = c.data;
    return {
      id: `reddit_${String(d.id)}`,
      source: "reddit" as const,
      author: `u/${String(d.author ?? "unknown")}`,
      title: String(d.title ?? ""),
      text: String(d.selftext ?? "").slice(0, 1200),
      url: `https://www.reddit.com${String(d.permalink ?? "")}`,
      createdAt: new Date(Number(d.created_utc ?? 0) * 1000).toISOString(),
      handle: `r/${sub}`,
    };
  });
}

async function fetchSub(sub: string, token: string, limit: number): Promise<RawPost[]> {
  const url =
    `https://oauth.reddit.com/r/${sub}/search?` +
    new URLSearchParams({ q: CIVIC, restrict_sr: "on", sort: "new", t: "month", limit: String(limit) });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reddit ${sub} ${res.status}`);
  const json = (await res.json()) as { data?: { children?: { data: Record<string, unknown> }[] } };
  return parse(json.data?.children ?? [], sub);
}

async function fetchRedditOAuth(limitPerSub: number): Promise<RawPost[]> {
  try {
    const token = await appToken();
    if (!token) return [];
    const results = await Promise.allSettled(SUBREDDITS.map((s) => fetchSub(s, token, limitPerSub)));
    const posts = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const seen = new Set<string>();
    return posts
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    console.error("[intake/reddit] OAuth fetch failed:", err);
    return [];
  }
}
