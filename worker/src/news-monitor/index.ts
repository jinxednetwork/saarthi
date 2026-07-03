/**
 * News monitoring (§7.5): poll RSS feeds (data/news-sources) every 15 min via
 * rss-parser → Gemini Flash filters for constituency relevance → each relevant
 * article becomes a `submission` with source "news" (+ news_ref).
 *
 * TODO(Phase 2): implement RSS poll + relevance filter. Feed list:
 * data/news-sources/feeds.json.
 */
export {};
