import { NextResponse } from "next/server";
import { buildPromotedCluster, synthesizeIssue } from "@/lib/intake/promote";
import { listSignals } from "@/lib/intake/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/intake/promote — promote selected intake signals into one live issue
 * (cluster). Gemini synthesizes title/summary/action; the cluster is returned to
 * the client, which adds it to its session store and surfaces it on the map/queue.
 */
export async function POST(req: Request) {
  try {
    const { signalIds } = (await req.json()) as { signalIds?: string[] };
    if (!Array.isArray(signalIds) || signalIds.length === 0) {
      return NextResponse.json({ error: "No signals selected." }, { status: 400 });
    }
    const idSet = new Set(signalIds);
    const signals = (await listSignals()).filter((s) => idSet.has(s.id));
    if (signals.length === 0) {
      // Store was cleared (e.g. server restart) between fetch and promote.
      return NextResponse.json({ error: "Signals expired — refresh and try again." }, { status: 409 });
    }
    const synth = await synthesizeIssue(signals);
    const cluster = buildPromotedCluster(signals, synth);
    return NextResponse.json({ cluster, promotedIds: signals.map((s) => s.id) });
  } catch (err) {
    console.error("[/api/intake/promote] failed:", err);
    return NextResponse.json({ error: "Promote failed." }, { status: 500 });
  }
}
