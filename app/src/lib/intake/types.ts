import type { Category } from "@saarthi/shared";

/** A raw social/news post before Gemini enrichment. */
export interface RawPost {
  id: string;
  source: "reddit" | "twitter" | "news";
  author: string;
  title: string;
  text: string;
  url: string;
  createdAt: string;
  /** Subreddit / handle. */
  handle: string;
  /** First image on the post/article, if any (tweet media / RSS enclosure). */
  mediaUrl?: string;
}

export type Sentiment = "angry" | "concerned" | "neutral" | "positive";
export type Urgency = "critical" | "high" | "medium" | "low";

/** A post after Gemini classification + embedding — a real intake signal. */
export interface EnrichedSignal {
  id: string;
  source: "reddit" | "twitter" | "news";
  author: string;
  handle: string;
  url: string;
  createdAt: string;
  text: string;
  /** Gemini-assigned fields (or keyword-fallback). */
  relevant: boolean;
  category: Category;
  urgency: Urgency;
  sentiment: Sentiment;
  ward: string;
  summary: string;
  embedding: number[];
  /** First image on the source post/article, if any — carried for cluster evidence. */
  mediaUrl?: string;
  /** "gemini" when the key classified it; "keyword" for the offline fallback. */
  mode: "gemini" | "keyword";
}
