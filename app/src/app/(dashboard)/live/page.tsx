import type { Metadata } from "next";
import { LiveMasonry } from "@/components/live/LiveMasonry";

export const metadata: Metadata = {
  title: "Live feed — Saarthi",
};

/**
 * /live — the full signal feed as a social-style collage. Every card carries
 * its source badge; clustered signals click through to the dashboard drawer.
 */
export default function LiveFeedPage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      <div className="mx-auto max-w-[1600px] px-6 pb-16 pt-6">
        <div className="mb-5 flex items-baseline gap-2">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">Live feed</h1>
          <span className="text-faint">·</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-[5px] w-[5px] animate-livePulseFast rounded-full bg-success" />
            every citizen signal, as it arrives
          </span>
        </div>
        <LiveMasonry />
      </div>
    </div>
  );
}
