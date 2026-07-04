"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SourceIcon } from "@/components/icons";
import { MediaImage } from "@/components/media/MediaImage";
import { useDashboardStore } from "@/lib/dashboard-store";
import type { FeedItem } from "@/lib/mock-data";
import { minutesAgo } from "@/lib/ui";

const SOURCE_COLOR: Record<string, string> = {
  whatsapp: "#25D366",
  twitter: "hsl(var(--ink))",
  reddit: "#FF4500",
  portal: "hsl(var(--link))",
  widget: "hsl(var(--link))",
  news: "hsl(var(--pathway-state))",
  document: "hsl(var(--muted-fg))",
};

/**
 * One collage card: media (natural aspect) → source badge + time → snippet →
 * cluster link. Clicking a clustered signal jumps to the dashboard and opens
 * its drawer (the store is global, so the drawer survives the navigation).
 */
export function MediaCard({ item }: { item: FeedItem }) {
  const router = useRouter();
  const selectCluster = useDashboardStore((s) => s.selectCluster);

  const openCluster = item.clusterId
    ? () => {
        selectCluster(item.clusterId!);
        router.push("/dashboard");
      }
    : undefined;

  return (
    <article className="glass-strong mb-4 break-inside-avoid overflow-hidden rounded-xl">
      {item.media && (
        <MediaImage
          asset={item.media}
          category={item.category}
          className="rounded-b-none rounded-t-xl"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      )}
      <div className="px-4 py-3.5">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-chip"
            style={{ color: SOURCE_COLOR[item.source] }}
          >
            <SourceIcon source={item.source} />
          </span>
          <span className="text-[12px] font-medium text-ink">{item.sourceName}</span>
          <span className="text-line-dark">·</span>
          <span className="text-[11px] text-faint">{minutesAgo(item.timeMin)}</span>
        </div>
        <p
          className={`text-[13px] leading-relaxed text-ink ${item.hi ? "hi" : ""}`}
          {...(item.hi ? { lang: "hi" } : {})}
        >
          {item.snippet}
        </p>
        {openCluster ? (
          <button
            onClick={openCluster}
            className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
          >
            {item.link}
            <ChevronRight className="h-2.5 w-2.5" />
          </button>
        ) : (
          <p className="mt-2.5 text-[11.5px] text-faint">{item.link}</p>
        )}
      </div>
    </article>
  );
}
