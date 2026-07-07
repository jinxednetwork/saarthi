import "server-only";
import type { RawPost } from "./types";

/**
 * News intake. Public RSS feeds for New Delhi — mainstream press plus PIB, the
 * government press-release feed. No credentials needed (RSS is public), so this
 * source is always live; individual feed failures are skipped, never fatal. Each
 * item is triaged by the same Gemini enrichment as Reddit/X (see classify.ts).
 *
 * Source of truth for the feed list is data/news-sources/feeds.json — mirrored
 * here to avoid a cross-package JSON import from inside the Next app.
 */
const FEEDS: { name: string; url: string }[] = [
  { name: "Hindustan Times — Delhi", url: "https://www.hindustantimes.com/feeds/rss/cities/delhi-news/rssfeed.xml" },
  { name: "Times of India — Delhi", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128839596.cms" },
  { name: "The Indian Express — Delhi", url: "https://indianexpress.com/section/cities/delhi/feed/" },
  { name: "The Hindu — Delhi", url: "https://www.thehindu.com/news/cities/Delhi/feeder/default.rss" },
  { name: "PIB India", url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3" },
];
const UA = "Saarthi/0.1 (MP civic-intake)";

/** Strip CDATA, tags and the common HTML entities; collapse whitespace. */
function clean(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#3?9;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function first(block: string, re: RegExp): string {
  return clean(block.match(re)?.[1] ?? "");
}

// ponytail: string/regex RSS 2.0 + Atom extraction — enough for these 5 feeds.
// If a publisher's format breaks parsing, swap in the rss-parser dep (~1 line).
function parseFeed(xml: string, publication: string): RawPost[] {
  const blocks = xml.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  return blocks.map((b) => {
    const title = first(b, /<title[^>]*>([\s\S]*?)<\/title>/i);
    // RSS uses <link>url</link>; Atom uses <link href="url"/>.
    const link =
      first(b, /<link[^>]*>([\s\S]*?)<\/link>/i) ||
      clean(b.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? "");
    const text = first(b, /<(?:description|summary|content:encoded)[^>]*>([\s\S]*?)<\/(?:description|summary|content:encoded)>/i);
    const dateRaw = first(b, /<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i);
    const t = dateRaw ? Date.parse(dateRaw) : NaN;
    // First image: RSS enclosure, media:content/thumbnail, or an <img> in the body.
    const mediaUrl =
      b.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i)?.[1] ??
      b.match(/<media:(?:content|thumbnail)[^>]*url="([^"]+)"/i)?.[1] ??
      b.match(/<img[^>]*src="([^"]+)"/i)?.[1] ??
      undefined;
    return {
      // Firestore doc-id safe (no slashes): last 40 alphanumerics of the link.
      id: `news_${link.replace(/[^a-z0-9]/gi, "").slice(-40)}`,
      source: "news" as const,
      author: publication,
      title,
      text: text.slice(0, 1200),
      url: link,
      createdAt: new Date(Number.isNaN(t) ? Date.now() : t).toISOString(),
      handle: publication,
      mediaUrl,
    };
  });
}

async function fetchFeed(feed: { name: string; url: string }, limit: number): Promise<RawPost[]> {
  const res = await fetch(feed.url, { headers: { "User-Agent": UA }, cache: "no-store" });
  if (!res.ok) throw new Error(`News ${feed.name} ${res.status}`);
  return parseFeed(await res.text(), feed.name)
    .filter((p) => p.title && p.url)
    .slice(0, limit);
}

/** Recent civic-adjacent Delhi news across the RSS feeds; [] on total failure. */
export async function fetchNews(limitPerFeed = 10): Promise<RawPost[]> {
  // allSettled never rejects and per-feed failures map to [], so no try/catch needed.
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f, limitPerFeed)));
  const posts = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const seen = new Set<string>();
  return posts
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
