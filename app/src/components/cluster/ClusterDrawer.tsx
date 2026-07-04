"use client";

import { MapPin, Send } from "lucide-react";
import { CategoryIcon } from "@/components/icons";
import { CrossRefs } from "@/components/cluster/CrossRefs";
import { DispatchProgress } from "@/components/cluster/DispatchProgress";
import { EvidenceChips } from "@/components/cluster/EvidenceChips";
import { UrgencyBadge } from "@/components/cluster/UrgencyBadge";
import { MediaImage } from "@/components/media/MediaImage";
import { flyToCluster } from "@/components/map/ConstituencyMap";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { groupColor, groupLabel } from "@/lib/categories";
import { useDashboardStore } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS } from "@/lib/mock-data";
import { PATHWAY_UI, trendLabel } from "@/lib/ui";

/**
 * Cluster detail drawer — the right-side Sheet opened from queue cards, map
 * markers, and feed items. Radix supplies focus trap, Esc, aria-modal. The
 * evidence lives here: media, source chips, cross-references, and the action.
 */
export function ClusterDrawer() {
  const { selectedClusterId, closeDetail, dispatched, openComposer } = useDashboardStore();
  const cluster = MOCK_CLUSTERS.find((c) => c.id === selectedClusterId);

  const record = cluster ? dispatched.find((d) => d.id === cluster.id) : undefined;
  const preDispatched = cluster?.ui.dispatched != null;
  const isDispatched = preDispatched || record != null;

  return (
    <Sheet open={cluster != null} onOpenChange={(open) => !open && closeDetail()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-line/60 bg-surface p-0 sm:w-[460px] sm:max-w-[460px]"
      >
        {cluster && (
          <>
            {/* Header */}
            <div className="border-b border-line/60 px-5 pb-4 pt-5">
              <div className="mb-2.5 flex items-center gap-2.5 pr-8">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `${groupColor(cluster.category)}1f`,
                    color: groupColor(cluster.category),
                  }}
                >
                  <CategoryIcon category={cluster.category} />
                </span>
                <span className="flex-1 text-[12px] text-muted-foreground">
                  {groupLabel(cluster.category)} ·{" "}
                  <span className="font-mono">#{cluster.id.replace("cl_", "")}</span>
                </span>
                <UrgencyBadge urgency={cluster.urgency} dispatched={isDispatched} />
                <span className="num text-[11px] text-faint">
                  {trendLabel(cluster.trend)} w/w
                </span>
              </div>
              <SheetTitle className="text-left text-lg font-semibold leading-snug tracking-tight text-ink">
                {cluster.title}
              </SheetTitle>
              {cluster.title_hi !== cluster.title && (
                <p className="hi mt-1 text-[14px] text-muted-foreground" lang="hi">
                  {cluster.title_hi}
                </p>
              )}
              <SheetDescription className="mt-1.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {cluster.ui.wardLabel}
              </SheetDescription>
            </div>

            {/* Body — native scroll; Radix ScrollArea's table-display viewport
                would let the 300px media tiles inflate the content width and
                break wrapping inside the fixed-width sheet. */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex w-full max-w-full flex-col gap-5 px-5 py-4">
                {/* Evidence media */}
                {cluster.ui.media && cluster.ui.media.length > 0 && (
                  <div>
                    <div className="mb-1.5 text-[11px] uppercase tracking-[0.06em] text-faint">
                      Citizen media · {cluster.ui.media.length}
                    </div>
                    <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                      {cluster.ui.media.map((m, i) => (
                        <MediaImage
                          key={i}
                          asset={m}
                          category={cluster.category}
                          className="w-[300px] shrink-0 snap-start"
                          sizes="300px"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <EvidenceChips
                  breakdown={cluster.source_breakdown}
                  total={cluster.submission_count}
                />

                <CrossRefs prose={cluster.ui.crossRefProse} refs={cluster.cross_reference} />

                {/* Action state */}
                {isDispatched ? (
                  <DispatchProgress
                    date={cluster.ui.dispatched?.date ?? "moments ago"}
                    detail={
                      cluster.ui.dispatched?.detail ??
                      "MPLADS recommendation letter dispatched to District Magistrate, New Delhi District. Awaiting acknowledgement."
                    }
                    progress={cluster.ui.dispatched?.progress ?? 8}
                    refNo={record?.ref}
                  />
                ) : (
                  <div>
                    <div className="mb-1.5 text-[11px] uppercase tracking-[0.06em] text-faint">
                      Suggested action
                    </div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className="inline-flex shrink-0 items-center rounded-full border px-2 py-px text-[11px] font-medium"
                        style={{
                          color: PATHWAY_UI[cluster.suggested_action.type].color,
                          borderColor: PATHWAY_UI[cluster.suggested_action.type].border,
                        }}
                      >
                        {PATHWAY_UI[cluster.suggested_action.type].label}
                      </span>
                      {cluster.ui.pathwayFlag && (
                        <span className="text-[12px] text-ink">{cluster.ui.pathwayFlag}</span>
                      )}
                    </div>
                    <p className="text-[13px] leading-relaxed text-ink">
                      {cluster.suggested_action.body || cluster.suggested_action.title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-2.5 border-t border-line/60 px-5 py-4">
              {!isDispatched && cluster.suggested_action.mplads_eligible ? (
                <Button
                  onClick={() => openComposer(cluster.id)}
                  className="h-10 flex-1 rounded-full text-[13px] font-medium"
                >
                  <Send className="h-3.5 w-3.5" />
                  Draft MPLADS letter
                </Button>
              ) : !isDispatched ? (
                <Button
                  onClick={() => openComposer(cluster.id)}
                  className="h-10 flex-1 rounded-full text-[13px] font-medium"
                >
                  <Send className="h-3.5 w-3.5" />
                  Draft {PATHWAY_UI[cluster.suggested_action.type].label} letter
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-10 flex-1 rounded-full border-success text-[13px] font-medium text-success hover:bg-success/10 hover:text-success"
                >
                  View action log
                </Button>
              )}
              <Button
                variant="outline"
                className="h-10 rounded-full text-[13px]"
                onClick={() => {
                  flyToCluster(cluster.geo.centroid.lat, cluster.geo.centroid.lng);
                  closeDetail();
                }}
              >
                <MapPin className="h-3.5 w-3.5" />
                View on map
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
