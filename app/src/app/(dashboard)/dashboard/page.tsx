import { ActionComposer } from "@/components/action-composer/ActionComposer";
import { LiveFeed } from "@/components/live-feed/LiveFeed";
import { MapSection } from "@/components/map/MapSection";
import { ThisWeekSection } from "@/components/priority-card/ThisWeekSection";
import { PriorityQueue } from "@/components/priority-queue/PriorityQueue";
import { CompactKpis } from "@/components/signal-hub/CompactKpis";
import { RadialHub } from "@/components/signal-hub/RadialHub";

/**
 * Dashboard home — TRANSITIONAL layout under the new shell (C2). The map-stage
 * rewrite (C3) replaces this page body with the full-bleed map + glass panels.
 */
export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      {/* Signal hub + compact KPIs */}
      <section className="relative border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[500px_1fr] items-center gap-14 px-10 py-8">
          <RadialHub />
          <CompactKpis />
        </div>
      </section>

      {/* Main grid: queue / map / feed */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-[340px_1fr_340px] items-start gap-6 px-10 py-7">
        <PriorityQueue />
        <MapSection />
        <LiveFeed />
      </div>

      {/* This week's priorities */}
      <ThisWeekSection />

      <ActionComposer />
    </div>
  );
}
