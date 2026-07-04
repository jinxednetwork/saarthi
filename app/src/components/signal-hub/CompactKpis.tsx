import { MPLADS_RULES } from "@saarthi/shared";
import { DASHBOARD_META, MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { formatCr } from "@/lib/ui";

/**
 * Compact 2×2 KPI grid beside the radial hub (design): MPLADS utilised,
 * open clusters, SC allocation (soft alert when below the 15% floor), ST.
 */
export function CompactKpis() {
  const m = MOCK_CONSTITUENCY.mplads;
  const utilizationPct = Math.round((m.utilization_ytd / m.allocation_annual) * 1000) / 10;
  const scBelow = m.sc_percent_ytd < MPLADS_RULES.scMinShare;
  const stBelow = m.st_percent_ytd < MPLADS_RULES.stMinShare;

  return (
    <div className="grid grid-cols-2 gap-x-11 gap-y-5">
      {/* MPLADS utilised */}
      <div>
        <div className="mb-2.5 text-[12.5px] text-muted-foreground">MPLADS utilised</div>
        <div className="flex items-baseline gap-[5px]">
          <div className="num text-[30px] font-medium leading-none tracking-tight text-ink">
            {formatCr(m.utilization_ytd)}
          </div>
          <div className="text-[15px] text-muted-foreground">Cr</div>
        </div>
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full bg-primary" style={{ width: `${utilizationPct}%` }} />
        </div>
        <div className="mt-1.5 text-[11.5px] text-faint">
          {Math.round(utilizationPct)}% of {formatCr(m.allocation_annual)} Cr
        </div>
      </div>

      {/* Open clusters */}
      <div>
        <div className="mb-2.5 text-[12.5px] text-muted-foreground">Open clusters</div>
        <div className="flex items-baseline gap-2.5">
          <div className="num text-[30px] font-medium leading-none tracking-tight text-ink">
            {DASHBOARD_META.openClusters}
          </div>
          <div className="flex items-center gap-[5px] text-xs text-urgency-critical">
            <span className="h-[5px] w-[5px] rounded-full bg-urgency-critical" />
            <span className="num">{DASHBOARD_META.criticalClusters} critical</span>
          </div>
        </div>
        <div className="mt-2 text-[11.5px] text-faint">{DASHBOARD_META.openClustersSub}</div>
      </div>

      {/* SC allocation */}
      <div>
        <div className="mb-2.5 flex items-center gap-1.5">
          <div className="text-[12.5px] text-muted-foreground">SC allocation</div>
          <span className={`h-[5px] w-[5px] rounded-full ${scBelow ? "bg-urgency-high" : "bg-success"}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <div className="num text-[30px] font-medium leading-none tracking-tight text-ink">
            {(m.sc_percent_ytd * 100).toFixed(1)}
          </div>
          <div className="text-[15px] text-muted-foreground">%</div>
        </div>
        <div className="mt-2 text-[11.5px] text-faint">
          {scBelow ? (
            <>
              <span className="num text-urgency-high">{DASHBOARD_META.scGapCopy.split(" below")[0]}</span> below
              required
            </>
          ) : (
            "above required"
          )}
        </div>
      </div>

      {/* ST allocation */}
      <div>
        <div className="mb-2.5 flex items-center gap-1.5">
          <div className="text-[12.5px] text-muted-foreground">ST allocation</div>
          <span className={`h-[5px] w-[5px] rounded-full ${stBelow ? "bg-urgency-high" : "bg-success"}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <div className="num text-[30px] font-medium leading-none tracking-tight text-ink">
            {(m.st_percent_ytd * 100).toFixed(1)}
          </div>
          <div className="text-[15px] text-muted-foreground">%</div>
        </div>
        <div className="mt-2 text-[11.5px] text-faint">
          {stBelow ? "below required" : DASHBOARD_META.stBufferCopy}
        </div>
      </div>
    </div>
  );
}
