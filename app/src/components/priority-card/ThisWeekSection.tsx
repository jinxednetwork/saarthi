"use client";

import { ChevronRight } from "@/components/icons";
import { DASHBOARD_META, fullCardClusters } from "@/lib/mock-data";
import { FullPriorityCard } from "./FullPriorityCard";

/**
 * "This week's priorities" — the three full cluster cards. Client component so
 * cluster objects (whose Timestamps carry functions) never cross the RSC
 * serialization boundary; Phase 4's Firestore listeners live client-side anyway.
 */
export function ThisWeekSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-10 pb-8 pt-4">
      <div className="mb-5 flex items-baseline justify-between pt-4">
        <div>
          <div className="text-[22px] font-semibold tracking-tight text-ink">
            This week&rsquo;s priorities
          </div>
          <div className="mt-1.5 max-w-[620px] text-[13.5px] leading-normal text-muted">
            Ranked by AI on cross-referenced evidence. Each ranking cites its sources.
          </div>
        </div>
        <a href="#" className="flex items-center gap-1 text-[13px] text-primary no-underline">
          <span>View all {DASHBOARD_META.openClusters}</span>
          <ChevronRight />
        </a>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {fullCardClusters().map((cluster) => (
          <FullPriorityCard key={cluster.id} cluster={cluster} />
        ))}
      </div>
    </section>
  );
}
