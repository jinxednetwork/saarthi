import { ActionComposer } from "@/components/action-composer/ActionComposer";
import { AppHeader } from "@/components/header/AppHeader";
import { LiveFeed } from "@/components/live-feed/LiveFeed";
import { MapSection } from "@/components/map/MapSection";
import { ThisWeekSection } from "@/components/priority-card/ThisWeekSection";
import { PriorityQueue } from "@/components/priority-queue/PriorityQueue";
import { ScrollShade } from "@/components/scroll-shade/ScrollShade";
import { CompactKpis } from "@/components/signal-hub/CompactKpis";
import { RadialHub } from "@/components/signal-hub/RadialHub";
import { WelcomeSplash } from "@/components/splash/WelcomeSplash";
import { DATA_SOURCES } from "@/lib/mock-data";

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
      <AppHeader />

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

      {/* Footer */}
      <section className="mx-auto max-w-[1440px] px-10 pb-16 pt-10">
        <div className="flex items-center justify-between text-[12.5px] text-faint">
          <div className="flex items-center gap-5">
            <span>Saarthi v0.4 · Pilot programme, Government of India</span>
            <span className="text-[#DCD3BF]">·</span>
            <a href="#" className="text-muted no-underline hover:text-primary">
              Data sources ({DATA_SOURCES.length})
            </a>
            <a href="#" className="text-muted no-underline hover:text-primary">
              Methodology
            </a>
            <a href="#" className="text-muted no-underline hover:text-primary">
              Privacy
            </a>
            <a href="#" className="text-muted no-underline hover:text-primary">
              Accessibility
            </a>
          </div>
          <div>Built on UX4G Design System 2.0</div>
        </div>
      </section>

      <ActionComposer />
    </>
  );
}
