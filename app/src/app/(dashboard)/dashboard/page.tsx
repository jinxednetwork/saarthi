import { ActionComposer } from "@/components/action-composer/ActionComposer";
import { AppFooter } from "@/components/footer/AppFooter";
import { AppHeader } from "@/components/header/AppHeader";
import { LiveFeed } from "@/components/live-feed/LiveFeed";
import { MapSection } from "@/components/map/MapSection";
import { ThisWeekSection } from "@/components/priority-card/ThisWeekSection";
import { PriorityQueue } from "@/components/priority-queue/PriorityQueue";
import { ScrollShade } from "@/components/scroll-shade/ScrollShade";
import { CompactKpis } from "@/components/signal-hub/CompactKpis";
import { RadialHub } from "@/components/signal-hub/RadialHub";
import { WelcomeSplash } from "@/components/splash/WelcomeSplash";
import { DASHBOARD_META, DATA_SOURCES, MOCK_CONSTITUENCY } from "@/lib/mock-data";

/**
 * Dashboard home — implements `Awaaz Design Session Handoff/Dashboard.dc.html`.
 * Splash → header → signal hub + KPIs → queue/map/feed grid → full priority
 * cards → footer, with the Action Composer modal overlay.
 */
export default function DashboardPage() {
  return (
    <>
      <WelcomeSplash />
      <ScrollShade />
      <AppHeader
        active="dashboard"
        title={`Hon’ble ${MOCK_CONSTITUENCY.mp.name}`}
        context={DASHBOARD_META.constituencyCopy}
        status={DASHBOARD_META.syncedCopy}
      />

      {/* Signal hub + compact KPIs */}
      <section id="main" className="relative border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[500px_1fr] items-center gap-14 px-10 py-8">
          <RadialHub />
          <CompactKpis />
        </div>
      </section>

      {/* Main grid: queue / map / feed */}
      <main className="mx-auto grid max-w-[1440px] grid-cols-[340px_1fr_340px] items-start gap-6 px-10 py-7">
        <PriorityQueue />
        <MapSection />
        <LiveFeed />
      </main>

      {/* This week's priorities */}
      <ThisWeekSection />

      <AppFooter
        links={[`Data sources (${DATA_SOURCES.length})`, "Methodology", "Privacy", "Accessibility"]}
        right="Built on UX4G Design System 2.0"
      />

      <ActionComposer />
    </>
  );
}
