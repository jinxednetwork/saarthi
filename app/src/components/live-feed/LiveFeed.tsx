"use client";

import { useEffect, useState } from "react";
import { ChevronRight, SourceIcon } from "@/components/icons";
import { useDashboardStore } from "@/lib/dashboard-store";
import { FEED_ITEMS, RADIAL_CHANNELS } from "@/lib/mock-data";

/**
 * Right rail: live signal feed (design). Rotates the base items every 22s to
 * simulate live cadence; letters dispatched via the composer prepend an action
 * entry with a quiet green accent.
 */
export function LiveFeed() {
  const dispatched = useDashboardStore((s) => s.dispatched);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 22_000);
    return () => clearInterval(t);
  }, []);

  const rotatedIndex = tick % FEED_ITEMS.length;
  const rotated = [...FEED_ITEMS.slice(rotatedIndex), ...FEED_ITEMS.slice(0, rotatedIndex)];

  const actionItems = dispatched.map((id) => ({
    source: "action" as const,
    sourceName: "Action",
    timeMin: 0,
    snippet: `Letter dispatched · Ref MP-NDL-MPLADS-2026-W44-0${id.replace("cl_", "")} to District Magistrate, New Delhi District.`,
    link: `action tracked · cluster #${id.replace("cl_", "")}`,
    hi: false,
  }));

  const list = [...actionItems, ...rotated].slice(0, 8);

  return (
    <aside>
      <div className="mb-3.5 flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <div className="text-[15px] font-semibold text-ink">Live signal feed</div>
          <div className="flex items-center gap-[5px]">
            <span className="h-[5px] w-[5px] animate-livePulseFast rounded-full bg-urgency-critical" />
            <span className="text-[11px] font-medium text-urgency-critical">Live</span>
          </div>
        </div>
        <div className="text-xs text-faint">{RADIAL_CHANNELS.length} channels</div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="max-h-[560px] overflow-y-auto">
          {list.map((item, i) => {
            const isAction = item.source === "action";
            return (
              <div
                key={`${tick}-${i}-${item.snippet.slice(0, 16)}`}
                className={`border-b border-line-faint px-5 py-4 ${i === 0 ? "animate-feedIn" : ""}`}
                style={isAction ? { boxShadow: "inset 2px 0 0 hsl(var(--success))" } : undefined}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isAction ? "bg-success text-white" : "bg-canvas text-body"
                    }`}
                  >
                    <SourceIcon source={item.source} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-[5px] flex items-center gap-1.5">
                      <span className="text-xs font-medium text-ink">{item.sourceName}</span>
                      <span className="text-line-dark">·</span>
                      <span className="text-xs text-faint">
                        {item.timeMin === 0 ? "just now" : `${item.timeMin} min ago`}
                      </span>
                    </div>
                    <div
                      className={`mb-2 text-[13px] leading-relaxed text-ink ${item.hi ? "hi" : ""}`}
                    >
                      {item.snippet}
                    </div>
                    <span
                      className={`inline-flex cursor-pointer items-center gap-1 text-xs font-medium ${
                        isAction ? "text-success" : "text-primary"
                      }`}
                    >
                      <span>{item.link}</span>
                      <ChevronRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <a
        href="#"
        className="flex items-center justify-between pt-3 text-[12.5px] text-primary no-underline"
      >
        <span>Open full feed</span>
        <ChevronRight />
      </a>
    </aside>
  );
}
