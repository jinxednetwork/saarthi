"use client";

import { useEffect, useMemo, useState } from "react";
import { GitCompareArrows, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMAND_DIMENSIONS, type DemandDimension } from "@/lib/publicdata";
import { scoreProposal, type Proposal } from "@/lib/proposals";
import { useProposalsStore } from "@/lib/proposals-store";
import { cn } from "@/lib/utils";
import { CompareDialog } from "./CompareDialog";
import { NewProposalDialog } from "./NewProposalDialog";
import { ProposalCard } from "./ProposalCard";

type Filter = DemandDimension | "all";

export function ProposalsBoard() {
  const { proposals, compareIds, hydrate, toggleCompare, clearCompare } = useProposalsStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ranked = useMemo(() => {
    const scored = proposals.map((p) => ({ p, total: scoreProposal(p).total }));
    scored.sort((a, b) => b.total - a.total);
    return scored
      .map((s) => s.p)
      .filter((p) => filter === "all" || p.dimension === filter);
  }, [proposals, filter]);

  const comparePair = useMemo<[Proposal, Proposal] | null>(() => {
    if (compareIds.length !== 2) return null;
    const a = proposals.find((p) => p.id === compareIds[0]);
    const b = proposals.find((p) => p.id === compareIds[1]);
    return a && b ? [a, b] : null;
  }, [compareIds, proposals]);

  const selectedProposals = compareIds
    .map((id) => proposals.find((p) => p.id === id))
    .filter((p): p is Proposal => p != null);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by need">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {DEMAND_DIMENSIONS.map((d) => (
            <FilterChip key={d.key} active={filter === d.key} onClick={() => setFilter(d.key)}>
              {d.label}
            </FilterChip>
          ))}
        </div>
        <div className="ml-auto">
          <NewProposalDialog
            trigger={
              <Button className="rounded-full" size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                New proposal
              </Button>
            }
          />
        </div>
      </div>

      {/* Ranked list */}
      {ranked.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-[13px] text-muted-foreground">
          No proposals for this need yet. Add one to see it ranked.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {ranked.map((p, i) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              rank={i + 1}
              selected={compareIds.includes(p.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}

      {/* Compare tray */}
      {selectedProposals.length > 0 && (
        <div className="glass-strong sticky bottom-4 z-20 mx-auto flex w-full max-w-[720px] items-center gap-3 rounded-full border border-line/60 px-4 py-2.5 shadow-lg">
          <GitCompareArrows className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {selectedProposals.map((p) => (
              <span
                key={p.id}
                className="flex min-w-0 items-center gap-1 rounded-full bg-chip px-2.5 py-1 text-[11.5px] text-ink"
              >
                <span className="truncate">{p.title}</span>
                <button
                  onClick={() => toggleCompare(p.id)}
                  aria-label={`Remove ${p.title} from compare`}
                  className="shrink-0 text-faint hover:text-ink"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedProposals.length === 1 && (
              <span className="text-[11.5px] text-faint">Pick one more to compare</span>
            )}
          </div>
          <button
            onClick={clearCompare}
            className="shrink-0 text-[11.5px] text-muted-foreground hover:text-ink"
          >
            Clear
          </button>
          <Button
            size="sm"
            className="shrink-0 rounded-full"
            disabled={comparePair == null}
            onClick={() => setCompareOpen(true)}
          >
            Compare
          </Button>
        </div>
      )}

      <CompareDialog pair={comparePair} open={compareOpen} onOpenChange={setCompareOpen} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-line text-muted-foreground hover:border-line-dark hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
