import type { Cluster, UiLanguage, Urgency } from "@saarthi/shared";
import { formatINR, t } from "@/lib/i18n";

/**
 * <PriorityCard /> — the most-used component (§10, contributed UX4G pattern).
 * Renders one ranked cluster: title, urgency, demand, cross-reference, action tag.
 * Visual spec is design's (Dashboard.pdf); this is the functional-first version.
 */

const urgencyClass: Record<Urgency, string> = {
  low: "bg-urgency-low",
  medium: "bg-urgency-medium",
  high: "bg-urgency-high",
  critical: "bg-urgency-critical",
};

export function PriorityCard({
  cluster,
  rank,
  lang = "en",
}: {
  cluster: Cluster;
  rank: number;
  lang?: UiLanguage;
}) {
  const title = lang === "hi" ? cluster.title_hi : cluster.title;
  const action = cluster.suggested_action;
  const xref = cluster.cross_reference[0];

  return (
    <article className="rounded-lg border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted">#{rank}</span>
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${urgencyClass[cluster.urgency]}`}
            aria-label={t(lang, `urgency.${cluster.urgency}`)}
          />
          <h3 className="text-base font-semibold text-ink">{title}</h3>
        </div>
        <span className="shrink-0 rounded bg-primary-50 px-2 py-0.5 text-sm font-bold text-primary-700">
          {cluster.rank_score}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <span>
          {cluster.submission_count} {t(lang, "cluster.submissions")}
        </span>
        {cluster.trend.percent_change > 0 && (
          <span className="text-danger">▲ {Math.round(cluster.trend.percent_change)}%</span>
        )}
        <span className="capitalize">{cluster.geo.ward.replace(/-/g, " ")}</span>
      </div>

      {xref && (
        <p className="mt-2 text-sm text-ink">
          <span className="font-medium">{xref.dataset}:</span> {xref.metric} — {xref.value}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="rounded bg-canvas px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
          {action.type}
        </span>
        {action.mplads_eligible && action.estimated_cost_lakhs != null && (
          <span className="text-sm text-muted">
            ~{formatINR(action.estimated_cost_lakhs * 100_000)}
          </span>
        )}
      </div>
    </article>
  );
}
