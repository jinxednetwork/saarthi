"use client";

import { MPLADS_RULES } from "@saarthi/shared";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { CollapsiblePanel } from "@/components/panels/CollapsiblePanel";
import { DASHBOARD_META, MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { formatCr } from "@/lib/ui";

/**
 * Constituency snapshot — KPI bento inside one collapsible glass panel. Inner
 * tiles are solid surface tints (NOT glass): one blur for the whole panel
 * keeps the Five-Blur budget intact for the assistant dock.
 */
export function KpiStack() {
  const { t } = useI18n();
  const m = MOCK_CONSTITUENCY.mplads;
  const utilizationPct = Math.round((m.utilization_ytd / m.allocation_annual) * 1000) / 10;
  const scBelow = m.sc_percent_ytd < MPLADS_RULES.scMinShare;
  const stBelow = m.st_percent_ytd < MPLADS_RULES.stMinShare;

  const tile = "rounded-lg border border-line/60 bg-surface/70 px-3.5 py-2.5";

  return (
    <CollapsiblePanel
      id="kpis"
      title={t("panel.snapshot")}
      headerRight={<span className="text-[11px] text-faint">{m.fiscal_year}</span>}
    >
      <div className="grid grid-cols-2 gap-2 p-3">
        {/* MPLADS utilised */}
        <div className={tile}>
          <div className="mb-1 text-[11px] text-muted-foreground">{t("metrics.mpladsUtilised")}</div>
          <div className="flex items-baseline gap-1">
            <span className="num text-[20px] font-semibold leading-none tracking-tight text-ink">
              {formatCr(m.utilization_ytd)}
            </span>
            <span className="text-[11px] text-muted-foreground">Cr</span>
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line/60">
            <div className="h-full rounded-full bg-primary" style={{ width: `${utilizationPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-faint">
            {Math.round(utilizationPct)}% of {formatCr(m.allocation_annual)} Cr
          </div>
        </div>

        {/* Open clusters */}
        <div className={tile}>
          <div className="mb-1 text-[11px] text-muted-foreground">{t("metrics.openClusters")}</div>
          <div className="flex items-baseline gap-2">
            <span className="num text-[20px] font-semibold leading-none tracking-tight text-ink">
              {DASHBOARD_META.openClusters}
            </span>
            <span className="flex items-center gap-1 text-[10.5px] text-urgency-critical">
              <span className="h-[5px] w-[5px] rounded-full bg-urgency-critical" />
              <span className="num">{DASHBOARD_META.criticalClusters} critical</span>
            </span>
          </div>
          <div className="mt-2.5 text-[10px] text-faint">{DASHBOARD_META.openClustersSub}</div>
        </div>

        {/* SC / ST allocation */}
        <div className={`${tile} col-span-2 flex items-center gap-4`}>
          <div className="flex-1">
            <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {t("metrics.scAllocation")}
              {scBelow && <AlertTriangle className="h-3 w-3 text-urgency-high" strokeWidth={2} />}
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="num text-[17px] font-semibold leading-none text-ink">
                {(m.sc_percent_ytd * 100).toFixed(1)}
              </span>
              <span className="text-[10.5px] text-muted-foreground">%</span>
            </div>
            <div className="mt-0.5 text-[10px] text-faint">
              {scBelow ? DASHBOARD_META.scGapCopy : "above required"}
            </div>
          </div>
          <div className="h-9 w-px bg-line/60" />
          <div className="flex-1">
            <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {t("metrics.stAllocation")}
              {stBelow ? (
                <AlertTriangle className="h-3 w-3 text-urgency-high" strokeWidth={2} />
              ) : (
                <span className="h-[5px] w-[5px] rounded-full bg-success" />
              )}
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="num text-[17px] font-semibold leading-none text-ink">
                {(m.st_percent_ytd * 100).toFixed(1)}
              </span>
              <span className="text-[10.5px] text-muted-foreground">%</span>
            </div>
            <div className="mt-0.5 text-[10px] text-faint">
              {stBelow ? "below required" : DASHBOARD_META.stBufferCopy}
            </div>
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
