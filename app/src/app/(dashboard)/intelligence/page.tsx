import type { Metadata } from "next";
import { HeroInsights } from "@/components/intelligence/HeroInsights";
import { OutlookChart } from "@/components/intelligence/OutlookChart";
import { AnomaliesTile } from "@/components/intelligence/tiles/AnomaliesTile";
import { CategoryDonut } from "@/components/intelligence/tiles/CategoryDonut";
import { CrossRefsTile } from "@/components/intelligence/tiles/CrossRefsTile";
import { ResponseBenchmark } from "@/components/intelligence/tiles/ResponseBenchmark";
import { WardHotspots } from "@/components/intelligence/tiles/WardHotspots";
import { WeeklyPulse } from "@/components/intelligence/tiles/WeeklyPulse";
import { LiveIntake } from "@/components/intelligence/LiveIntake";
import { BriefingButton } from "@/components/pdf/BriefingButton";
import { PageHeader } from "@/components/shell/PageHeader";
import { INTELLIGENCE_META } from "@/lib/intelligence-data";

export const metadata: Metadata = {
  title: "Intelligence — Saarthi",
};

/**
 * Intelligence — a bento of derived analytics. Hero recommendations → 12-week
 * forecast → category / ward / benchmark tiles → weekly pulse + anomalies +
 * cross-references. Every tile draws from lib/insights (the same source the
 * assistant speaks from), so the page and the assistant never disagree.
 */
export default function IntelligencePage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-6">
        <PageHeader
          titleKey="pageHeader.intelligence.title"
          subtitle={INTELLIGENCE_META.subtitle}
          right={
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
                <span className="h-[5px] w-[5px] animate-livePulse rounded-full bg-success" />
                {INTELLIGENCE_META.modelLine}
              </span>
              <BriefingButton />
            </div>
          }
        />

        <div className="flex flex-col gap-4">
          <HeroInsights />
          <OutlookChart />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CategoryDonut />
            <WardHotspots />
            <ResponseBenchmark />
          </div>

          <LiveIntake />

          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2 [&>*]:h-full">
              <WeeklyPulse />
            </div>
            <AnomaliesTile />
            <CrossRefsTile />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-[12px] text-faint">
          <span>Saarthi v0.5 · Pilot programme, Government of India</span>
          <span>{INTELLIGENCE_META.modelFooter}</span>
        </div>
      </div>
    </div>
  );
}
