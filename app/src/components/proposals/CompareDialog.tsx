"use client";

import { Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDashboardStore } from "@/lib/dashboard-store";
import {
  compareProposals,
  costLabel,
  dimensionLabel,
  type Proposal,
} from "@/lib/proposals";
import { cn } from "@/lib/utils";
import { ComponentBars, ScoreRing, scoreBand } from "./ScoreParts";

/**
 * Head-to-head. Two competing proposals, each with its full §8.3 breakdown, and
 * a verdict banner naming the winner and the components that decided it — so the
 * MP sees WHY, not just which. The classic case: school-upgrade vs vocational
 * centre in the same ward, decided on public-data severity + SC leverage.
 */
function ProposalColumn({
  proposal,
  score,
  isWinner,
}: {
  proposal: Proposal;
  score: ReturnType<typeof compareProposals>["a"];
  isWinner: boolean;
}) {
  const band = scoreBand(score.total);
  const selectCluster = useDashboardStore((s) => s.selectCluster);
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4",
        isWinner ? "border-success/50 bg-success/[0.04]" : "border-line/60 bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <ScoreRing total={score.total} size={52} />
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-semibold leading-snug text-ink">{proposal.title}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {score.wardName} · {dimensionLabel(proposal.dimension)} · {costLabel(proposal.cost_lakhs)}
          </p>
          <span className={cn("text-[10.5px] font-medium", band.text)}>{band.label}</span>
        </div>
      </div>
      <div className="border-t border-line/50 pt-3">
        <ComponentBars score={score} detailed onSelectCluster={selectCluster} />
      </div>
    </div>
  );
}

export function CompareDialog({
  pair,
  open,
  onOpenChange,
}: {
  pair: [Proposal, Proposal] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!pair) return null;
  const result = compareProposals(pair[0], pair[1]);
  const winner = result.a.proposalId === result.winnerId ? pair[0] : pair[1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[860px] flex-col gap-0 overflow-hidden border-line/60 bg-canvas p-0">
        <DialogHeader className="border-b border-line/60 px-6 pb-4 pt-5 text-left">
          <DialogTitle className="text-[16px] font-semibold text-ink">Head-to-head</DialogTitle>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Two competing works, scored on the same evidence base.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-success/40 bg-success/[0.06] px-4 py-3">
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-success" strokeWidth={1.75} />
            <div>
              <p className="text-[13px] font-semibold text-ink">
                Recommended: {winner.title}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                Leads by {result.margin} points
                {result.decidingComponents.length > 0 && (
                  <>
                    , mainly on{" "}
                    <span className="font-medium text-ink">
                      {result.decidingComponents.map((d) => d.label.toLowerCase()).join(", ")}
                    </span>
                  </>
                )}
                .
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProposalColumn proposal={pair[0]} score={result.a} isWinner={result.winnerId === result.a.proposalId} />
            <ProposalColumn proposal={pair[1]} score={result.b} isWinner={result.winnerId === result.b.proposalId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
