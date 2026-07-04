"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { SourceIcon } from "@/components/icons";
import { useI18n } from "@/components/i18n/I18nProvider";
import { CollapsiblePanel } from "@/components/panels/CollapsiblePanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardStore } from "@/lib/dashboard-store";
import { FEED_ITEMS, RADIAL_CHANNELS } from "@/lib/mock-data";
import { minutesAgo } from "@/lib/ui";

/**
 * Live signal feed — collapsible glass panel. Rotates every 22s; the radial
 * hub's channel filter narrows it; items with clusters open the drawer;
 * dispatched letters prepend an action entry.
 */
export function LiveFeed() {
  const { t } = useI18n();
  const { dispatched, sourceFilter, setSourceFilter, selectCluster } = useDashboardStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 22_000);
    return () => clearInterval(t);
  }, []);

  const filtered =
    sourceFilter === "all" ? FEED_ITEMS : FEED_ITEMS.filter((f) => f.source === sourceFilter);
  const rotatedIndex = filtered.length > 0 ? tick % filtered.length : 0;
  const rotated = [...filtered.slice(rotatedIndex), ...filtered.slice(0, rotatedIndex)];

  const actionItems =
    sourceFilter === "all"
      ? dispatched.map((d) => ({
          source: "action" as const,
          sourceName: "Action",
          timeMin: 0,
          snippet: `Letter dispatched · Ref ${d.ref} to District Magistrate, New Delhi District.`,
          link: `action tracked · cluster #${d.id.replace("cl_", "")}`,
          clusterId: d.id,
          hi: false,
        }))
      : [];

  const list = [...actionItems, ...rotated].slice(0, 8);
  const filterName = RADIAL_CHANNELS.find((c) => c.key === sourceFilter)?.name;

  return (
    <CollapsiblePanel
      id="feed"
      title={t("panel.liveSignals")}
      fill
      headerRight={
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="h-[5px] w-[5px] animate-livePulseFast rounded-full bg-success" />
            <span className="text-[10.5px] font-medium text-success">Live</span>
          </span>
          {filterName ? (
            <button
              onClick={() => setSourceFilter("all")}
              className="flex items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-[10.5px] font-medium text-ink hover:bg-line/60"
              aria-label={`Clear ${filterName} filter`}
            >
              {filterName}
              <X className="h-2.5 w-2.5" />
            </button>
          ) : (
            <span className="text-[11px] text-faint">{RADIAL_CHANNELS.length} channels</span>
          )}
        </span>
      }
    >
      <ScrollArea className="min-h-0 flex-1">
        <div>
          {list.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-faint">
              No {filterName} signals in the current window.
            </p>
          )}
          {list.map((item, i) => {
            const isAction = item.source === "action";
            const clickable = item.clusterId != null;
            const Wrapper = clickable ? "button" : "div";
            return (
              <Wrapper
                key={`${tick}-${i}-${item.snippet.slice(0, 16)}`}
                onClick={clickable ? () => selectCluster(item.clusterId!) : undefined}
                className={`block w-full border-b border-line/50 px-4 py-3 text-left last:border-b-0 ${
                  i === 0 ? "animate-feedIn" : ""
                } ${isAction ? "bg-success/[0.07]" : ""} ${clickable ? "cursor-pointer transition-colors hover:bg-chip/60" : ""}`}
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isAction ? "bg-success text-white" : "bg-chip text-body"
                    }`}
                  >
                    <SourceIcon source={item.source} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex items-center gap-1.5">
                      <span className="text-[11.5px] font-medium text-ink">{item.sourceName}</span>
                      <span className="text-line-dark">·</span>
                      <span className="text-[11px] text-faint">{minutesAgo(item.timeMin)}</span>
                    </span>
                    <span
                      className={`mb-1.5 block text-xs leading-relaxed text-ink ${item.hi ? "hi" : ""}`}
                      {...(item.hi ? { lang: "hi" } : {})}
                    >
                      {item.snippet}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        isAction ? "text-success" : "text-primary"
                      }`}
                    >
                      {item.link}
                      {clickable && <ChevronRight className="h-2.5 w-2.5" />}
                    </span>
                  </span>
                </span>
              </Wrapper>
            );
          })}
        </div>
      </ScrollArea>

      <Link
        href="/live"
        className="flex shrink-0 items-center justify-between border-t border-line/60 px-4 py-2.5 text-[12px] font-medium text-primary no-underline hover:bg-chip/60"
      >
        <span>Open full feed</span>
        <ChevronRight className="h-3 w-3" />
      </Link>
    </CollapsiblePanel>
  );
}
