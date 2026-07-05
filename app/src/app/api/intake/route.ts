import { NextResponse } from "next/server";
import { hasGeminiKey } from "@/lib/ai/gemini";
import { fetchX, hasApifyToken } from "@/lib/intake/apify";
import { enrich } from "@/lib/intake/classify";
import { fetchReddit, hasRedditCreds } from "@/lib/intake/reddit";
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
    sources: { gemini: hasGeminiKey(), apify: hasApifyToken(), reddit: hasRedditCreds() },
  });
}

export async function POST() {
  try {
    const [reddit, x] = await Promise.all([fetchReddit().catch(() => []), fetchX().catch(() => [])]);
    const real = [...reddit, ...x];
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
