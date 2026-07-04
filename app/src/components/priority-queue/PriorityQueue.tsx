"use client";

import { ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardStore } from "@/lib/dashboard-store";
import { DASHBOARD_META, topClusters } from "@/lib/mock-data";
import { PATHWAY_UI, URGENCY_UI, trendLabel } from "@/lib/ui";

/**
 * Priority action queue — floating glass panel over the map. Each card is a
 * real button opening the cluster detail drawer (keyboard included).
 */
export function PriorityQueue() {
  const { dispatched, selectCluster } = useDashboardStore();
  const cards = topClusters(5);

  return (
    <section className="glass-strong flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
      <header className="flex items-baseline justify-between border-b border-line/60 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ink">Priority action queue</h2>
        <span className="text-[11px] text-faint">
          Top 5 of {DASHBOARD_META.openClusters} open
        </span>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div>
          {cards.map((c, i) => {
            const u = URGENCY_UI[c.urgency];
            const p = PATHWAY_UI[c.suggested_action.type];
            const isDispatched = dispatched.includes(c.id) || c.ui.dispatched != null;
            const trend = trendLabel(c.trend);

            return (
              <button
                key={c.id}
                onClick={() => selectCluster(c.id)}
                className={`block w-full border-b border-line/50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-chip/60 ${
                  isDispatched ? "bg-success/[0.06]" : ""
                }`}
              >
                <span className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10.5px] text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.dot }} />
                      <span className="text-[11px] font-medium" style={{ color: u.text }}>
                        {u.label}
                      </span>
                    </span>
                  </span>
                  <span
                    className={`num text-[11px] ${
                      trend === "new"
                        ? "font-medium text-primary"
                        : c.urgency === "critical"
                          ? "font-medium text-urgency-critical"
                          : "text-muted-foreground"
                    }`}
                  >
                    {trend}
                  </span>
                </span>
                <span className="mb-0.5 block text-[13.5px] font-medium leading-snug text-ink">
                  {c.title}
                </span>
                <span className="mb-2 block text-[11.5px] text-muted-foreground">
                  {c.ui.wardLabel}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-flex shrink-0 items-center rounded-full border px-2 py-px text-[10.5px] font-medium"
                    style={{ color: p.color, borderColor: p.border }}
                  >
                    {p.label}
                  </span>
                  <span className="flex-1 truncate text-[11px] text-muted-foreground">
                    {c.ui.queueSuggestion ?? c.suggested_action.title}
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-faint" />
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
}
