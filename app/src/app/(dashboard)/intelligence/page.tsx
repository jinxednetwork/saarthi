import type { Metadata } from "next";
import { HeroInsights } from "@/components/intelligence/HeroInsights";
import { InsightGrid } from "@/components/intelligence/InsightGrid";
import { OutlookChart } from "@/components/intelligence/OutlookChart";
import { INTELLIGENCE_META } from "@/lib/intelligence-data";

export const metadata: Metadata = {
  title: "Intelligence — Saarthi",
};

/**
 * Intelligence screen — hero recommendations → 12-week forecast chart
 * (staggered draw-in) → cross-references / anomalies / benchmark, under the
 * shared glass shell.
 */
export default function IntelligencePage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      {/* Page header */}
      <div className="mx-auto flex max-w-[1440px] items-baseline justify-between px-10 pt-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">Intelligence</h1>
          <span className="text-faint">·</span>
          <span className="text-xs text-muted-foreground">{INTELLIGENCE_META.subtitle}</span>
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <span className="h-[5px] w-[5px] animate-livePulse rounded-full bg-success" />
          {INTELLIGENCE_META.modelLine}
        </span>
      </div>

      <HeroInsights />
      <OutlookChart />
      <InsightGrid />

      {/* Footer */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 pb-16 pt-12 text-[12.5px] text-faint">
        <span>Saarthi v0.5 · Pilot programme, Government of India</span>
        <span>{INTELLIGENCE_META.modelFooter}</span>
      </div>
    </div>
  );
}
