"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Category } from "@saarthi/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { DEMAND_DIMENSIONS, type DemandDimension } from "@/lib/publicdata";
import { PATHWAY_LABEL, scoreProposal, type Proposal, type ProposalPathway } from "@/lib/proposals";
import { useProposalsStore } from "@/lib/proposals-store";

// Public-data dimension → citizen-signal category (for cluster demand matching).
const DIMENSION_CATEGORY: Record<DemandDimension, Category> = {
  water: "water",
  sanitation: "water",
  education: "infrastructure",
  health: "health",
  air: "air_quality",
  infrastructure: "infrastructure",
};

const FIELD =
  "w-full rounded-lg border border-input bg-panel px-3 py-2 text-[12.5px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring";
const LABEL = "mb-1 block text-[11px] font-medium text-muted-foreground";

export function NewProposalDialog({ trigger }: { trigger: React.ReactNode }) {
  const addProposal = useProposalsStore((s) => s.addProposal);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [dimension, setDimension] = useState<DemandDimension>("education");
  const [wardId, setWardId] = useState(MOCK_CONSTITUENCY.wards[0]!.id);
  const [pathway, setPathway] = useState<ProposalPathway>("MPLADS");
  const [cost, setCost] = useState("30");
  const [mpladsEligible, setMpladsEligible] = useState(true);

  const ward = MOCK_CONSTITUENCY.wards.find((w) => w.id === wardId)!;
  const benefitsSc = ward.sc_majority;

  // Live preview of the score the proposal will earn, so the form teaches the model.
  const preview = useMemo<Proposal | null>(() => {
    if (!title.trim()) return null;
    return {
      id: "preview",
      title: title.trim(),
      summary: summary.trim(),
      dimension,
      category: DIMENSION_CATEGORY[dimension],
      ward_id: wardId,
      origin: "manual",
      pathway,
      cost_lakhs: Number(cost) || 0,
      mplads_eligible: mpladsEligible,
      benefits_sc: benefitsSc,
    };
  }, [title, summary, dimension, wardId, pathway, cost, mpladsEligible, benefitsSc]);

  const previewScore = preview ? scoreProposal(preview).total : null;

  function reset() {
    setTitle("");
    setSummary("");
    setDimension("education");
    setWardId(MOCK_CONSTITUENCY.wards[0]!.id);
    setPathway("MPLADS");
    setCost("30");
    setMpladsEligible(true);
  }

  function submit() {
    if (!title.trim()) {
      toast.error("Give the proposal a title.");
      return;
    }
    const costNum = Number(cost);
    if (!Number.isFinite(costNum) || costNum <= 0) {
      toast.error("Enter an estimated cost in lakhs.");
      return;
    }
    addProposal({
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      dimension,
      category: DIMENSION_CATEGORY[dimension],
      ward_id: wardId,
      pathway,
      cost_lakhs: costNum,
      mplads_eligible: mpladsEligible,
      benefits_sc: benefitsSc,
    });
    toast.success("Proposal added and ranked.");
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[560px] flex-col gap-0 overflow-hidden border-line/60 bg-surface p-0">
        <DialogHeader className="border-b border-line/60 px-6 pb-4 pt-5 text-left">
          <DialogTitle className="text-[16px] font-semibold text-ink">New proposal</DialogTitle>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Author a work directly — it&apos;s ranked against citizen demand and public data.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 overflow-y-auto px-6 py-5">
          <div>
            <label className={LABEL} htmlFor="np-title">
              Title
            </label>
            <input
              id="np-title"
              className={FIELD}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Upgrade the Kalkaji Ext. mohalla clinic"
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="np-summary">
              Summary
            </label>
            <textarea
              id="np-summary"
              className={`${FIELD} resize-y`}
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One or two lines on what the work delivers."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} htmlFor="np-dimension">
                Need addressed
              </label>
              <select
                id="np-dimension"
                className={FIELD}
                value={dimension}
                onChange={(e) => setDimension(e.target.value as DemandDimension)}
              >
                {DEMAND_DIMENSIONS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="np-ward">
                Ward
              </label>
              <select
                id="np-ward"
                className={FIELD}
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
              >
                {MOCK_CONSTITUENCY.wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                    {w.sc_majority ? " (SC-majority)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} htmlFor="np-pathway">
                Funding pathway
              </label>
              <select
                id="np-pathway"
                className={FIELD}
                value={pathway}
                onChange={(e) => setPathway(e.target.value as ProposalPathway)}
              >
                {(Object.keys(PATHWAY_LABEL) as ProposalPathway[]).map((p) => (
                  <option key={p} value={p}>
                    {PATHWAY_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="np-cost">
                Est. cost (₹ lakh)
              </label>
              <input
                id="np-cost"
                type="number"
                min={1}
                className={FIELD}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-line/60 bg-panel px-3 py-2.5">
            <input
              type="checkbox"
              checked={mpladsEligible}
              onChange={(e) => setMpladsEligible(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-[12px] text-ink">MPLADS-eligible work</span>
          </label>

          {benefitsSc && (
            <p className="rounded-lg border border-saffron/30 bg-saffron/10 px-3 py-2 text-[11.5px] text-saffron">
              {ward.name} is SC-majority — this proposal counts toward the 15% SC allocation floor.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line/60 bg-panel/60 px-6 py-4">
          <span className="text-[12px] text-muted-foreground">
            {previewScore != null ? (
              <>
                Projected score <span className="num font-semibold text-ink">{previewScore}</span> / 100
              </>
            ) : (
              "Fill in a title to preview the score"
            )}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={submit}>
              Add proposal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
