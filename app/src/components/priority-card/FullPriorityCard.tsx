"use client";

import { ArrowRight, CategoryIcon, CheckIcon, MoreIcon, SourceIcon } from "@/components/icons";
import { groupColor, groupLabel } from "@/lib/categories";
import { useDashboardStore } from "@/lib/dashboard-store";
import type { DemoCluster } from "@/lib/mock-data";
import { PATHWAY_UI, URGENCY_UI, trendLabel } from "@/lib/ui";
import { SUBMISSION_SOURCES } from "@saarthi/shared";
import type { SubmissionSource } from "@saarthi/shared";

const SOURCE_LABEL: Record<SubmissionSource, string> = {
  whatsapp: "WhatsApp",
  twitter: "X posts",
  reddit: "Reddit",
  widget: "Portal",
  portal: "Portal",
  news: "News",
  document: "Documents",
};

/**
 * Full priority card ("This week's priorities", design): evidence chips,
 * cross-reference narrative with cited sources, suggested action or dispatched
 * progress state, single primary action.
 */
export function FullPriorityCard({ cluster }: { cluster: DemoCluster }) {
  const { dispatched, openComposer } = useDashboardStore();

  const u = URGENCY_UI[cluster.urgency];
  const p = PATHWAY_UI[cluster.suggested_action.type];
  const catColor = groupColor(cluster.category);
  const preDispatched = cluster.ui.dispatched != null;
  const isDispatched = preDispatched || dispatched.includes(cluster.id);
  const progress = cluster.ui.dispatched?.progress ?? (isDispatched ? 8 : 0);
  const actionDate = cluster.ui.dispatched?.date ?? "moments ago · just now";
  const actionDetail =
    cluster.ui.dispatched?.detail ??
    "MPLADS recommendation letter dispatched to District Magistrate, New Delhi District. Awaiting acknowledgement.";

  const evidence = SUBMISSION_SOURCES.filter((s) => cluster.source_breakdown[s] > 0).map((s) => ({
    source: s,
    count: cluster.source_breakdown[s],
    label: SOURCE_LABEL[s],
  }));

  return (
    <article
      className={`flex min-h-[480px] flex-col overflow-hidden rounded-xl border bg-surface ${
        isDispatched ? "border-[#DBE9DE]" : "border-line"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-[22px] pt-[22px]">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${catColor}12`, color: catColor }}
          >
            <CategoryIcon category={cluster.category} />
          </span>
          <span className="text-[12.5px] text-muted-foreground">
            {groupLabel(cluster.category)} · #{cluster.id.replace("cl_", "")}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center gap-[5px] rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium"
            style={
              isDispatched
                ? { color: "hsl(var(--success))", borderColor: "hsl(var(--success) / 0.35)" }
                : { color: u.text, borderColor: u.border }
            }
          >
            {isDispatched ? "In progress" : u.label}
          </span>
          <span className="num text-xs text-faint">{trendLabel(cluster.trend)} w/w</span>
        </div>
      </div>

      {/* Title + ward */}
      <div className="px-[22px] pt-3.5">
        <div className="text-[19px] font-semibold leading-snug tracking-tight text-ink">
          {cluster.title}
        </div>
        {cluster.title_hi !== cluster.title && (
          <div className="hi mt-1.5 text-[15px] leading-snug text-muted-foreground">{cluster.title_hi}</div>
        )}
        <div className="mt-2 text-[13px] text-muted-foreground">{cluster.ui.wardLabel}</div>
      </div>

      {/* Evidence chips */}
      <div className="px-[22px] pt-[18px]">
        <div className="mb-2 text-[12.5px] text-muted-foreground">
          <span className="num font-medium text-ink">{cluster.submission_count}</span> signals ·{" "}
          {evidence.length} sources
        </div>
        <div className="flex flex-wrap gap-1.5">
          {evidence.map((e) => (
            <span
              key={e.source}
              className="inline-flex items-center gap-1.5 rounded bg-chip py-1 pl-[7px] pr-[9px] text-xs text-ink"
            >
              <span className="flex h-3 w-3 items-center justify-center text-muted-foreground">
                <SourceIcon source={e.source} />
              </span>
              <span className="num font-medium">{e.count}</span>
              <span className="text-muted-foreground">{e.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Cross-reference */}
      {cluster.ui.crossRefProse && (
        <div className="px-[22px] pt-[18px]">
          <div className="mb-1.5 text-[12.5px] text-faint">Cross-reference · public data</div>
          <div className="text-[13px] leading-relaxed text-ink">{cluster.ui.crossRefProse}</div>
          <div className="mt-2.5 flex flex-wrap gap-1">
            {cluster.cross_reference.map((s, i) => (
              <a key={i} href={s.citation_url} className="text-[11.5px] text-primary no-underline">
                {s.dataset} · {s.metric}
                {i < cluster.cross_reference.length - 1 && (
                  <span className="text-line-dark"> · </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Suggested action OR dispatched progress */}
      {isDispatched ? (
        <div className="px-[22px] pt-5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckIcon />
            Dispatched · {actionDate}
          </div>
          <div className="text-[13.5px] leading-relaxed text-ink">{actionDetail}</div>
          <div className="mt-3">
            <div className="mb-[5px] flex justify-between text-[11.5px] text-faint">
              <span>Awaiting response</span>
              <span className="num">{progress}%</span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-success transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-[22px] pt-5">
          <div className="mb-1.5 text-[12.5px] text-faint">Suggested action</div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium"
              style={{ color: p.color, borderColor: p.border }}
            >
              {p.label}
            </span>
            {cluster.ui.pathwayFlag && (
              <span className="text-[12.5px] text-ink">{cluster.ui.pathwayFlag}</span>
            )}
          </div>
          <div className="text-[13.5px] leading-relaxed text-ink">
            {cluster.suggested_action.body || cluster.suggested_action.title}
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="mt-auto flex items-center gap-2.5 p-[22px]">
        {isDispatched ? (
          <>
            <button className="flex-1 cursor-pointer rounded-full border border-success bg-transparent px-4 py-2.5 text-[13px] font-medium text-success hover:bg-[#F0F4EE]">
              View action
            </button>
            <button className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-line bg-transparent text-muted-foreground hover:border-line-dark hover:text-ink">
              <MoreIcon />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => openComposer(cluster.id)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-hover"
            >
              Draft letter
              <ArrowRight />
            </button>
            <button
              title="More actions"
              className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-line bg-transparent text-muted-foreground hover:border-line-dark hover:text-ink"
            >
              <MoreIcon />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
