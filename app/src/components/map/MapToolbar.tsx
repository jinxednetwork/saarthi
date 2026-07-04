"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORY_GROUPS, type CategoryGroup, groupOf } from "@/lib/categories";
import { type MapFilter, type TimeRange, useDashboardStore } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS } from "@/lib/mock-data";

const LEGEND = [
  { label: "Critical", varName: "--urgency-critical" },
  { label: "High", varName: "--urgency-high" },
  { label: "Medium", varName: "--urgency-medium" },
  { label: "Low", varName: "--urgency-low" },
];

const RANGES: TimeRange[] = ["7d", "30d", "90d"];

function filterLabel(filter: MapFilter): string {
  return filter === "all" ? "All categories" : CATEGORY_GROUPS[filter].label;
}

/**
 * Floating glass bar at the map's bottom edge: category filter (Radix Popover —
 * Esc/focus handled), time range, urgency legend, visible-cluster count.
 */
export function MapToolbar() {
  const { activeFilter, timeRange, setFilter, setTimeRange } = useDashboardStore();

  const visibleCount =
    activeFilter === "all"
      ? MOCK_CLUSTERS.length
      : MOCK_CLUSTERS.filter((c) => groupOf(c.category) === activeFilter).length;

  const chips: { key: MapFilter; label: string; count: number; color?: string }[] = [
    { key: "all", label: "All categories", count: MOCK_CLUSTERS.length },
    ...(Object.entries(CATEGORY_GROUPS) as [CategoryGroup, (typeof CATEGORY_GROUPS)[CategoryGroup]][]).map(
      ([key, g]) => ({
        key: key as MapFilter,
        label: g.label,
        count: MOCK_CLUSTERS.filter((c) => groupOf(c.category) === key).length,
        color: g.color,
      }),
    ),
  ];

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      {/* Category filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="glass h-8 gap-1.5 rounded-full border-0 px-3 text-xs font-medium text-ink">
            {filterLabel(activeFilter)}
            <span className="text-faint">·</span>
            <span className="font-normal text-muted-foreground">Past {timeRange.replace("d", " days")}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" side="top" className="w-60 p-2">
          <p className="px-2 pb-1 pt-1 text-[10.5px] uppercase tracking-wide text-faint">
            Category
          </p>
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink ${
                activeFilter === chip.key ? "bg-chip font-medium" : "hover:bg-chip/60"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: chip.color ?? "hsl(var(--muted-fg))" }}
                />
                {chip.label}
              </span>
              <span className="num text-[11px] text-faint">{chip.count}</span>
            </button>
          ))}
          <div className="my-1.5 h-px bg-line" />
          <p className="px-2 pb-1 text-[10.5px] uppercase tracking-wide text-faint">Time range</p>
          <div className="flex gap-1 px-1 pb-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`flex-1 rounded-full border px-2 py-1 text-[11.5px] font-medium ${
                  timeRange === r
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-line text-body hover:border-line-dark"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Legend */}
      <div className="glass flex h-8 items-center gap-3 rounded-full px-3">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10.5px] text-ink">
            <span className="h-2 w-2 rounded-full" style={{ background: `hsl(var(${l.varName}))` }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Visible count */}
      <div className="glass flex h-8 items-baseline gap-1.5 rounded-full px-3">
        <span className="num text-[13px] font-semibold text-ink">{visibleCount}</span>
        <span className="text-[10.5px] text-muted-foreground">visible clusters</span>
      </div>
    </div>
  );
}
