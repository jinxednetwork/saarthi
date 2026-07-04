/**
 * In-memory vector search (§3.3 — no vector DB in the demo). Cosine similarity
 * over normalised embeddings + top-K. Small corpus (dozens of chunks), so a
 * linear scan is well within budget and keeps the dependency surface at zero.
 */
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface Ranked<T> {
  score: number;
  item: T;
}

/** Rank items by cosine to the query embedding, best first, capped at k. */
export function topK<T extends { embedding: number[] }>(
  items: T[],
  query: number[],
  k: number,
): Ranked<T>[] {
  return items
    .map((item) => ({ score: cosine(query, item.embedding), item }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
