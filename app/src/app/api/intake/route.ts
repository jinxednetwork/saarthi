import { NextResponse } from "next/server";
import { hasGeminiKey } from "@/lib/ai/gemini";
import { enrich } from "@/lib/intake/classify";
import { fetchNews } from "@/lib/intake/news";
import { fetchReddit, hasRedditSource } from "@/lib/intake/reddit";
import { fetchX, hasXOfficial, hasXSource } from "@/lib/intake/x";
import { samplePosts } from "@/lib/intake/sample";
import { lastRefresh, listSignals, mergeSignals } from "@/lib/intake/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET  /api/intake — the enriched real-world signals + source status.
 * POST /api/intake — refresh: fetch Reddit (keyless) + X (Apify, if token) →
 *   Gemini classify + embed → merge into the store. The dashboard live feed
 *   reads GET; a refresh control triggers POST.
 */
export async function GET() {
  return NextResponse.json({
    signals: await listSignals(),
    lastRefresh: lastRefresh(),
    // news has no cred to gate on — public RSS, always available. `x` notes whether
    // the trusted official API (vs the Apify fallback) is the active X path.
    sources: {
      gemini: hasGeminiKey(),
      twitter: hasXSource(),
      xOfficial: hasXOfficial(),
      reddit: hasRedditSource(),
      news: true,
    },
  });
}

export async function POST(req: Request) {
  try {
    // Optional { sources: ["twitter","reddit","news"] } — the enabled sources to pull.
    // Absent → pull all. Lets the UI's source toggles skip a source (and skip the
    // slow Reddit scrape) on refresh.
    const body = (await req.json().catch(() => ({}))) as { sources?: string[] };
    const on = (s: string) => !Array.isArray(body.sources) || body.sources.includes(s);
    const [reddit, x, news] = await Promise.all([
      on("reddit") ? fetchReddit().catch(() => []) : Promise.resolve([]),
      on("twitter") ? fetchX().catch(() => []) : Promise.resolve([]),
      on("news") ? fetchNews().catch(() => []) : Promise.resolve([]),
    ]);
    const real = [...reddit, ...x, ...news];
    // Fall back to labelled samples so the enrichment pipeline is demoable
    // before Reddit/Apify credentials are configured.
    const live = real.length > 0;
    const raw = live ? real : samplePosts();

    const enriched = await enrich(raw);
    const relevant = enriched.filter((s) => s.relevant);
    const added = await mergeSignals(relevant);
    return NextResponse.json({
      added,
      total: (await listSignals()).length,
      fetched: raw.length,
      live,
      mode: enriched[0]?.mode ?? "keyword",
    });
  } catch (err) {
    console.error("[/api/intake] refresh failed:", err);
    return NextResponse.json({ error: "Intake refresh failed." }, { status: 500 });
  }
}
