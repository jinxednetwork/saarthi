"use client";

import { useState } from "react";
import { ChevronDown, GitCompareArrows } from "lucide-react";
import { useDashboardStore } from "@/lib/dashboard-store";
import {
  ORIGIN_LABEL,
  PATHWAY_LABEL,
  costLabel,
  dimensionLabel,
  scoreProposal,
  type Proposal,
} from "@/lib/proposals";
import { cn } from "@/lib/utils";
import { ComponentBars, ScoreRing, scoreBand } from "./ScoreParts";

/**
 * One ranked proposal. Score ring + band verdict, the public-data evidence line
 * with its citation, and an expandable full §8.3 scoring breakdown. "Compare"
 * adds it to the head-to-head tray.
 */
export function ProposalCard({
  proposal,
  rank,
  selected,
  onToggleCompare,
}: {
  proposal: Proposal;
  rank: number;
  selected: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectCluster = useDashboardStore((s) => s.selectCluster);
  const score = scoreProposal(proposal);
  const band = scoreBand(score.total);

  return (
    <article
      className={cn(
        "rounded-xl border bg-surface transition-colors",
        selected ? "border-primary ring-1 ring-primary/40" : "border-line/60",
      )}
    >
      <div className="flex gap-4 p-4">
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <span className="num text-[11px] text-faint">{String(rank).padStart(2, "0")}</span>
          <ScoreRing total={score.total} />
          <span className={cn("text-[10px] font-medium", band.text)}>{band.label}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[14.5px] font-semibold leading-snug text-ink">{proposal.title}</h3>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                {score.wardName} · {dimensionLabel(proposal.dimension)}
              </p>
            </div>
            <button
              onClick={() => onToggleCompare(proposal.id)}
              aria-pressed={selected}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-line text-muted-foreground hover:border-line-dark hover:text-ink",
              )}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              {selected ? "Comparing" : "Compare"}
            </button>
          </div>

          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-body">{proposal.summary}</p>

          {score.demand && (
            <p className="mt-2 rounded-lg border border-line/50 bg-chip/50 px-3 py-2 text-[11.5px] leading-snug text-muted-foreground">
              <span className="font-medium text-ink">Evidence · </span>
              {score.demand.headline}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-px font-medium",
                proposal.pathway === "MPLADS"
                  ? "border-primary/40 text-primary"
                  : "border-line text-muted-foreground",
              )}
            >
              {PATHWAY_LABEL[proposal.pathway]}
            </span>
            <span className="num font-medium text-ink">{costLabel(proposal.cost_lakhs)}</span>
            <span className="text-faint">{ORIGIN_LABEL[proposal.origin]}</span>
            {proposal.benefits_sc && (
              <span className="rounded-full bg-saffron/15 px-2 py-px font-medium text-saffron">
                SC leverage
              </span>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              {open ? "Hide scoring" : "Show scoring"}
              <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-line/60 bg-panel/40 px-4 py-4">
          <p className="mb-3 text-[11px] text-faint">
            Composite of six weighted signals (§8.3) — total {score.total} / 100.
          </p>
          <ComponentBars score={score} detailed onSelectCluster={selectCluster} />
        </div>
      )}
    </article>
  );
}
