"use client";

import { useState } from "react";
import { MPLADS_RULES } from "@saarthi/shared";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DASHBOARD_META, MOCK_CONSTITUENCY, topClusters } from "@/lib/mock-data";
import { downloadDailyBriefing } from "@/lib/pdf/generate";
import { formatCr } from "@/lib/ui";
import { cn } from "@/lib/utils";

/** Generate + download the Daily Briefing PDF from the live constituency data. */
export function BriefingButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const m = MOCK_CONSTITUENCY.mplads;
      const pct = Math.round((m.utilization_ytd / m.allocation_annual) * 100);
      const scPct = (m.sc_percent_ytd * 100).toFixed(1);
      const scBelow = m.sc_percent_ytd < MPLADS_RULES.scMinShare;

      await downloadDailyBriefing({
        dateStr: new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        weekLabel: DASHBOARD_META.weekLabel,
        constituency: "New Delhi",
        mpName: MOCK_CONSTITUENCY.mp.name,
        kpis: [
          {
            label: "MPLADS utilised",
            value: `₹${formatCr(m.utilization_ytd)} Cr`,
            sub: `${pct}% of ₹${formatCr(m.allocation_annual)} Cr`,
          },
          {
            label: "Open clusters",
            value: String(DASHBOARD_META.openClusters),
            sub: `${DASHBOARD_META.criticalClusters} critical`,
          },
          {
            label: "SC allocation",
            value: `${scPct}%`,
            sub: scBelow ? "below 15% floor" : "above floor",
          },
          {
            label: "Signals this week",
            value: DASHBOARD_META.signalsThisWeek.toLocaleString("en-IN"),
            sub: `${DASHBOARD_META.sourceCount} sources`,
          },
        ],
        items: topClusters(5).map((c, i) => ({
          rank: i + 1,
          title: c.title,
          ward: c.ui.wardLabel,
          urgency: c.urgency,
          signals: c.submission_count,
          evidence:
            c.ui.crossRefProse ||
            (c.cross_reference.length
              ? c.cross_reference.map((r) => `${r.dataset} · ${r.metric}`).join("; ")
              : `${c.submission_count} converging citizen signals; public-data cross-reference pending.`),
          action: c.suggested_action.title,
        })),
      });
      toast.success("Daily Briefing PDF downloaded.");
    } catch {
      toast.error("Could not generate the briefing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={generate}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[12px] font-medium text-body transition-colors hover:border-line-dark hover:text-ink disabled:opacity-60",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      Daily Briefing
      {!busy && <Download className="h-3 w-3 text-faint" />}
    </button>
  );
}
