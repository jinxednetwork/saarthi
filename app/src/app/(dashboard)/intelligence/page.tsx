import type { Metadata } from "next";
import { AppFooter } from "@/components/footer/AppFooter";
import { AppHeader } from "@/components/header/AppHeader";
import { HeroInsights } from "@/components/intelligence/HeroInsights";
import { InsightGrid } from "@/components/intelligence/InsightGrid";
import { OutlookChart } from "@/components/intelligence/OutlookChart";
import { ScrollShade } from "@/components/scroll-shade/ScrollShade";
import { INTELLIGENCE_META } from "@/lib/intelligence-data";

export const metadata: Metadata = {
  title: "Intelligence — Saarthi",
};

/**
 * Intelligence screen — implements `Awaaz Design Session Handoff/Intelligence.dc.html`.
 * Hero recommendations → 12-week forecast chart (staggered draw-in) →
 * cross-references / anomalies / benchmark.
 */
export default function IntelligencePage() {
  return (
    <>
      <ScrollShade />
      <AppHeader
        active="intelligence"
        title="Intelligence"
        context={INTELLIGENCE_META.subtitle}
        status={INTELLIGENCE_META.modelLine}
      />
      <HeroInsights />
      <OutlookChart />
      <InsightGrid />
      <AppFooter
        links={["Data sources (8)", "Model card", "Methodology"]}
        right={INTELLIGENCE_META.modelFooter}
      />
    </>
  );
}
