"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { MediaCard } from "@/components/live/MediaCard";
import { SourceIcon } from "@/components/icons";
import { useDashboardStore } from "@/lib/dashboard-store";
import { LIVE_FEED_ITEMS, RADIAL_CHANNELS } from "@/lib/mock-data";

/**
 * The full signal feed as a scrollable collage — CSS columns give the masonry
 * for free; media aspect variance gives it the social-feed texture. The
 * channel chips filter (shared sourceFilter, same as the dashboard hub).
 */
export function LiveMasonry() {
  const { sourceFilter, setSourceFilter } = useDashboardStore();

  const items = useMemo(() => {
    const filtered =
      sourceFilter === "all"
        ? LIVE_FEED_ITEMS
        : LIVE_FEED_ITEMS.filter((f) => f.source === sourceFilter);
    return [...filtered].sort((a, b) => a.timeMin - b.timeMin);
  }, [sourceFilter]);

  return (
    <div>
      {/* Channel filter chips */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSourceFilter("all")}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
            sourceFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "glass text-body hover:text-ink"
          }`}
        >
          All channels
        </button>
        {RADIAL_CHANNELS.map((ch) => {
          const active = sourceFilter === ch.key;
          return (
            <button
              key={ch.key}
              onClick={() => setSourceFilter(active ? "all" : ch.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "glass text-body hover:text-ink"
              }`}
            >
              <SourceIcon source={ch.key} />
              {ch.name}
              {active && <X className="h-2.5 w-2.5" />}
            </button>
          );
        })}
        <span className="ml-auto text-[11.5px] text-faint">
          <span className="num">{items.length}</span> signals · past 2 hours
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-faint">
          No signals from this channel in the current window.
        </p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-4">
          {items.map((item, i) => (
            <MediaCard key={`${item.source}-${item.timeMin}-${i}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
