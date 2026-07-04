"use client";

import { useMemo, useState } from "react";
import { FileText, Landmark, Send, Users } from "lucide-react";
import type { ActionOutcome, ActionStatus, ActionType } from "@saarthi/shared";
import { ActionTimeline } from "@/components/actions/ActionTimeline";
import { useDashboardStore } from "@/lib/dashboard-store";
import { type DemoAction, mergeSessionDispatches } from "@/lib/actions-data";
import { PATHWAY_UI } from "@/lib/ui";

const TYPE_ICON: Record<ActionType, typeof FileText> = {
  MPLADS_LETTER: FileText,
  STATE_LETTER: FileText,
  PARLIAMENT_QUESTION: Landmark,
  MEETING: Users,
  BRIEF_SHARED: Send,
};
const TYPE_LABEL: Record<ActionType, string> = {
  MPLADS_LETTER: "MPLADS letter",
  STATE_LETTER: "Official letter",
  PARLIAMENT_QUESTION: "Parliament question",
  MEETING: "Meeting",
  BRIEF_SHARED: "Brief shared",
};
const STATUS_STYLE: Record<ActionStatus, string> = {
  draft: "text-muted-foreground",
  sent: "text-urgency-high",
  responded: "text-primary",
  completed: "text-success",
};
const OUTCOME_STYLE: Record<ActionOutcome, string> = {
  sanctioned: "bg-success/15 text-success",
  completed: "bg-success/15 text-success",
  underway: "bg-primary/15 text-primary",
  denied: "bg-urgency-critical/15 text-urgency-critical",
  no_response: "bg-chip text-muted-foreground",
};

const STATUS_FILTERS: (ActionStatus | "all")[] = ["all", "draft", "sent", "responded", "completed"];

export function ActionsLedger() {
  const dispatched = useDashboardStore((s) => s.dispatched);
  const selectCluster = useDashboardStore((s) => s.selectCluster);
  const [status, setStatus] = useState<ActionStatus | "all">("all");

  const actions = useMemo(() => mergeSessionDispatches(dispatched), [dispatched]);
  const rows: DemoAction[] = status === "all" ? actions : actions.filter((a) => a.status === status);

  const counts = actions.reduce(
    (acc, a) => ((acc[a.status] = (acc[a.status] ?? 0) + 1), acc),
    {} as Record<string, number>,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
              status === f ? "bg-primary text-primary-foreground" : "glass text-body hover:text-ink"
            }`}
          >
            {f === "all" ? `All (${actions.length})` : `${f} (${counts[f] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {rows.map((a) => {
          const Icon = TYPE_ICON[a.type];
          const p = PATHWAY_UI[a.ui.pathway];
          return (
            <article
              key={a.id}
              onClick={a.cluster_id ? () => selectCluster(a.cluster_id) : undefined}
              className={`glass-strong rounded-xl p-4 ${a.cluster_id ? "cursor-pointer transition-colors hover:bg-chip/40" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chip text-muted-foreground">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-medium text-ink">{a.ui.clusterTitle}</span>
                      <span
                        className="inline-flex shrink-0 items-center rounded-full border px-2 py-px text-[10.5px] font-medium"
                        style={{ color: p.color, borderColor: p.border }}
                      >
                        {p.label}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {TYPE_LABEL[a.type]} → {a.sent_to}
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-faint">{a.ui.refNo}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[12px] font-medium capitalize ${STATUS_STYLE[a.status]}`}>
                    {a.status}
                  </span>
                  {a.outcome && (
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize ${OUTCOME_STYLE[a.outcome]}`}>
                      {a.outcome.replace(/_/g, " ")}
                    </span>
                  )}
                  {a.status === "sent" && a.ui.responseDueDays != null && (
                    <span className="text-[11px] text-faint">Response due in {a.ui.responseDueDays}d</span>
                  )}
                </div>
              </div>

              {a.response && (
                <p className="mt-2.5 rounded-lg bg-chip/60 px-3 py-2 text-[12px] leading-relaxed text-body">
                  {a.response}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2.5">
                <ActionTimeline status={a.status} />
                {a.ui.progress != null && a.status !== "completed" && (
                  <span className="num text-[11px] text-faint">{a.ui.progress}% complete</span>
                )}
              </div>
            </article>
          );
        })}
        {rows.length === 0 && (
          <p className="glass-strong rounded-xl py-10 text-center text-[13px] text-faint">
            No actions in this status.
          </p>
        )}
      </div>
    </div>
  );
}
