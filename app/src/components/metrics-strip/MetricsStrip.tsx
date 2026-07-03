import type { Constituency, UiLanguage } from "@saarthi/shared";
import { MPLADS_RULES } from "@saarthi/shared";
import { t } from "@/lib/i18n";

/**
 * <MetricsStrip /> — top-of-dashboard KPI row (§10). Flags SC/ST allocation gaps
 * against the MPLADS floors from @saarthi/shared (§8.4).
 */
function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function Metric({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${alert ? "text-danger" : "text-ink"}`}>
        {value}
        {alert && <span className="ml-1 align-middle text-xs font-semibold">⚠</span>}
      </div>
    </div>
  );
}

export function MetricsStrip({
  constituency,
  openClusters,
  lang = "en",
}: {
  constituency: Constituency;
  openClusters: number;
  lang?: UiLanguage;
}) {
  const m = constituency.mplads;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Metric
        label={t(lang, "dashboard.metrics.mplads_utilization")}
        value={pct(m.utilization_ytd / m.allocation_annual)}
      />
      <Metric
        label={t(lang, "dashboard.metrics.sc_allocation")}
        value={pct(m.sc_percent_ytd)}
        alert={m.sc_percent_ytd < MPLADS_RULES.scMinShare}
      />
      <Metric
        label={t(lang, "dashboard.metrics.st_allocation")}
        value={pct(m.st_percent_ytd)}
        alert={m.st_percent_ytd < MPLADS_RULES.stMinShare}
      />
      <Metric label={t(lang, "dashboard.metrics.open_clusters")} value={String(openClusters)} />
    </div>
  );
}
