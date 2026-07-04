"use client";

import dynamic from "next/dynamic";
import { ChevronDown } from "@/components/icons";
import { CATEGORY_GROUPS, type CategoryGroup, groupOf } from "@/lib/categories";
import { type MapFilter, type TimeRange, useDashboardStore } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS } from "@/lib/mock-data";

const ConstituencyMap = dynamic(
  () => import("./ConstituencyMap").then((m) => m.ConstituencyMap),
  { ssr: false, loading: () => <div className="h-[500px] w-full bg-[#E8E2D0]" /> },
);

const LEGEND = [
  { label: "Critical", color: "hsl(var(--urgency-critical))" },
  { label: "High", color: "hsl(var(--urgency-high))" },
  { label: "Medium", color: "hsl(var(--urgency-medium))" },
  { label: "Low", color: "hsl(var(--urgency-low))" },
];

const RANGES: TimeRange[] = ["7d", "30d", "90d"];

function filterLabel(filter: MapFilter): string {
  return filter === "all" ? "All categories" : CATEGORY_GROUPS[filter].label;
}

/** Centre column: constituency map with filter popover, legend, visible count. */
export function MapSection() {
  const { activeFilter, timeRange, mapFilterOpen, toggleMapFilter, closeMapFilter, setFilter, setTimeRange } =
    useDashboardStore();

  const visibleCount =
    activeFilter === "all"
      ? MOCK_CLUSTERS.length
      : MOCK_CLUSTERS.filter((c) => groupOf(c.category) === activeFilter).length;

  const chips: { key: MapFilter; label: string; count: number; color: string }[] = [
    { key: "all", label: "All categories", count: MOCK_CLUSTERS.length, color: "hsl(var(--muted-fg))" },
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
    <section>
      <div className="mb-3.5 flex items-baseline justify-between">
        <div className="text-[15px] font-semibold text-ink">Constituency map</div>
        <button
          onClick={toggleMapFilter}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-transparent px-3 py-1.5 text-[12.5px] text-ink hover:border-line-dark"
        >
          <span>{filterLabel(activeFilter)}</span>
          <span className="text-faint">·</span>
          <span className="text-muted-foreground">Past {timeRange.replace("d", " days")}</span>
          <span className="text-muted-foreground">
            <ChevronDown />
          </span>
        </button>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-line bg-surface">
        <ConstituencyMap filter={activeFilter} />

        {/* Filter popover */}
        {mapFilterOpen && (
          <>
            <div className="absolute inset-0 z-[900]" onClick={closeMapFilter} />
            <div className="absolute right-3.5 top-3.5 z-[950] min-w-[240px] rounded-lg border border-line bg-surface p-2 shadow-[0_8px_24px_rgba(20,25,42,0.08)]">
              <div className="px-2.5 pb-1.5 pt-2 text-[11px] text-faint">Filter by category</div>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setFilter(chip.key)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded px-2.5 py-2 text-left text-[13px] text-ink ${
                    activeFilter === chip.key ? "bg-canvas" : "bg-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: chip.color }} />
                    <span>{chip.label}</span>
                  </span>
                  <span className="num text-xs text-faint">{chip.count}</span>
                </button>
              ))}
              <div className="my-1.5 h-px bg-line" />
              <div className="px-2.5 pb-1.5 pt-2 text-[11px] text-faint">Time range</div>
              <div className="flex gap-1 px-2.5 pb-2">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`flex-1 cursor-pointer rounded-full border px-2 py-1.5 text-xs font-medium ${
                      timeRange === r
                        ? "border-primary bg-primary text-white"
                        : "border-line bg-transparent text-body"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Legend */}
        <div className="absolute bottom-3.5 left-3.5 z-[500] flex items-center gap-3.5 rounded-md border border-line bg-white/95 px-3 py-2 backdrop-blur-md">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11.5px] text-ink">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Visible count */}
        <div className="absolute bottom-3.5 right-3.5 z-[500] flex items-baseline gap-1.5 rounded-md border border-line bg-white/95 px-3 py-2 backdrop-blur-md">
          <span className="num text-lg font-medium text-ink">{visibleCount}</span>
          <span className="text-[11.5px] text-muted-foreground">visible clusters</span>
        </div>
      </div>
    </section>
  );
}
