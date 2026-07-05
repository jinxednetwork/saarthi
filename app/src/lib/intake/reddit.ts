import "server-only";
import type { RawPost } from "./types";

/**
 * Reddit intake. Reddit now blocks anonymous datacenter access to its public
 * JSON (403), so real fetching uses application-only OAuth — free, just a
 * registered app's client id + secret (REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET).
 * No creds → returns nothing and the route falls back to labelled sample posts,
 * so the Gemini enrichment pipeline is demoable before credentials land.
 */
const SUBREDDITS = ["delhi", "DelhiNCR"];
const QUERY =
  "waterlogging OR drain OR sewage OR water OR pothole OR garbage OR pollution OR AQI OR streetlight OR sanitation";
const UA = "Saarthi/0.1 (MP civic-intake)";

export function hasRedditCreds(): boolean {
  return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
}

async function appToken(): Promise<string | null> {
  if (!hasRedditCreds()) return null;
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
    new URLSearchParams({ q: QUERY, restrict_sr: "on", sort: "new", t: "month", limit: String(limit) });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reddit ${sub} ${res.status}`);
  const json = (await res.json()) as { data?: { children?: { data: Record<string, unknown> }[] } };
  return parse(json.data?.children ?? [], sub);
}

/** Real civic posts across the target subreddits; [] when creds are absent. */
export async function fetchReddit(limitPerSub = 12): Promise<RawPost[]> {
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
    console.error("[intake/reddit] fetch failed:", err);
    return [];
  }
}
