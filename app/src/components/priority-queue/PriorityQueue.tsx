"use client";

import { ChevronRight } from "@/components/icons";
import { useDashboardStore } from "@/lib/dashboard-store";
import { DASHBOARD_META, topClusters } from "@/lib/mock-data";
import { PATHWAY_UI, URGENCY_UI, trendLabel } from "@/lib/ui";

/**
 * Left rail: Priority action queue — the top-5 compact cluster cards (design).
 * Dispatched clusters pick up a quiet green tint.
 */
export function PriorityQueue() {
  const dispatched = useDashboardStore((s) => s.dispatched);
  const cards = topClusters(5);

  return (
    <aside>
      <div className="mb-3.5 flex items-baseline justify-between">
        <div className="text-[15px] font-semibold text-ink">Priority action queue</div>
        <div className="text-xs text-faint">Top 5 · this week</div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {cards.map((c, i) => {
          const u = URGENCY_UI[c.urgency];
          const p = PATHWAY_UI[c.suggested_action.type];
          const isDispatched = dispatched.includes(c.id) || c.ui.dispatched != null;
          const trend = trendLabel(c.trend);
          const isCritical = c.urgency === "critical";

          return (
            <div
              key={c.id}
              className={`cursor-pointer px-5 py-[18px] ${
                i < cards.length - 1 ? "border-b border-line-faint" : ""
              } ${isDispatched ? "bg-[#F7F9F5]" : ""}`}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.dot }} />
                    <span className="text-[11.5px] font-medium" style={{ color: u.text }}>
                      {u.label}
                    </span>
                  </span>
                </div>
                <span
                  className={`num text-[11.5px] ${
                    trend === "new"
                      ? "font-medium text-primary"
                      : isCritical
                        ? "font-medium text-urgency-critical"
                        : "text-muted-foreground"
                  }`}
                >
                  {trend}
                </span>
              </div>
              <div className="mb-[3px] text-[14.5px] font-medium leading-snug text-ink">
                {c.title}
              </div>
              <div className="mb-3 text-[12.5px] text-muted-foreground">{c.ui.wardLabel}</div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium"
                  style={{ color: p.color, borderColor: p.border }}
                >
                  {p.label}
                </span>
                <span className="text-xs leading-tight text-muted-foreground">
                  {c.ui.queueSuggestion ?? c.suggested_action.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <a
        href="#"
        className="flex items-center justify-between pt-3 text-[12.5px] text-primary no-underline"
      >
        <span>View all {DASHBOARD_META.openClusters} open clusters</span>
        <ChevronRight />
      </a>
    </aside>
  );
}
