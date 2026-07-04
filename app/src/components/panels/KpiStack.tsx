import { MPLADS_RULES } from "@saarthi/shared";
import { AlertTriangle } from "lucide-react";
import { DASHBOARD_META, MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { formatCr } from "@/lib/ui";

/**
 * Left-rail KPI bento: MPLADS utilisation, open clusters, SC/ST allocation.
 * Compact glass tiles — the numbers stay the heroes (tabular, Indian format).
 */
export function KpiStack() {
  const m = MOCK_CONSTITUENCY.mplads;
  const utilizationPct = Math.round((m.utilization_ytd / m.allocation_annual) * 1000) / 10;
  const scBelow = m.sc_percent_ytd < MPLADS_RULES.scMinShare;
  const stBelow = m.st_percent_ytd < MPLADS_RULES.stMinShare;

  return (
    <div className="grid shrink-0 grid-cols-2 gap-2.5">
      {/* MPLADS utilised */}
      <div className="glass rounded-xl px-4 py-3">
        <div className="mb-1.5 text-[11.5px] text-muted-foreground">MPLADS utilised</div>
        <div className="flex items-baseline gap-1">
          <span className="num text-[22px] font-semibold leading-none tracking-tight text-ink">
            {formatCr(m.utilization_ytd)}
          </span>
          <span className="text-xs text-muted-foreground">Cr</span>
        </div>
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line/60">
          <div className="h-full rounded-full bg-primary" style={{ width: `${utilizationPct}%` }} />
        </div>
        <div className="mt-1 text-[10.5px] text-faint">
          {Math.round(utilizationPct)}% of {formatCr(m.allocation_annual)} Cr
        </div>
      </div>

      {/* Open clusters */}
      <div className="glass rounded-xl px-4 py-3">
        <div className="mb-1.5 text-[11.5px] text-muted-foreground">Open clusters</div>
        <div className="flex items-baseline gap-2">
          <span className="num text-[22px] font-semibold leading-none tracking-tight text-ink">
            {DASHBOARD_META.openClusters}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-urgency-critical">
            <span className="h-[5px] w-[5px] rounded-full bg-urgency-critical" />
            <span className="num">{DASHBOARD_META.criticalClusters} critical</span>
          </span>
        </div>
        <div className="mt-3 text-[10.5px] text-faint">{DASHBOARD_META.openClustersSub}</div>
      </div>

      {/* SC / ST allocation — one wide tile */}
      <div className="glass col-span-2 flex items-center gap-4 rounded-xl px-4 py-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            SC allocation
            {scBelow && <AlertTriangle className="h-3 w-3 text-urgency-high" strokeWidth={2} />}
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="num text-lg font-semibold leading-none text-ink">
              {(m.sc_percent_ytd * 100).toFixed(1)}
            </span>
            <span className="text-[11px] text-muted-foreground">%</span>
          </div>
          <div className="mt-0.5 text-[10.5px] text-faint">
            {scBelow ? DASHBOARD_META.scGapCopy : "above required"}
          </div>
        </div>
        <div className="h-10 w-px bg-line/60" />
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            ST allocation
            {stBelow ? (
              <AlertTriangle className="h-3 w-3 text-urgency-high" strokeWidth={2} />
            ) : (
              <span className="h-[5px] w-[5px] rounded-full bg-success" />
            )}
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="num text-lg font-semibold leading-none text-ink">
              {(m.st_percent_ytd * 100).toFixed(1)}
            </span>
            <span className="text-[11px] text-muted-foreground">%</span>
          </div>
          <div className="mt-0.5 text-[10.5px] text-faint">
            {stBelow ? "below required" : DASHBOARD_META.stBufferCopy}
          </div>
        </div>
      </div>
    </div>
  );
}
