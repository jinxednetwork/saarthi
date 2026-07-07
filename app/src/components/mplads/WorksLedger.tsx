"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useDashboardStore } from "@/lib/dashboard-store";
import {
  SANCTIONED_WORKS,
  SECTOR_LABELS,
  type WorkStatus,
  dispatchedToWorks,
} from "@/lib/mplads-data";
import { formatCr } from "@/lib/ui";

const STATUS_STYLE: Record<WorkStatus, string> = {
  recommended: "text-primary",
  sanctioned: "text-pathway-state",
  in_progress: "text-urgency-high",
  completed: "text-success",
};
const STATUS_LABEL: Record<WorkStatus, string> = {
  recommended: "Recommended",
  sanctioned: "Sanctioned",
  in_progress: "In progress",
  completed: "Completed",
};
const FILTERS: (WorkStatus | "all")[] = ["all", "recommended", "sanctioned", "in_progress", "completed"];

function rupeesL(n: number) {
  return n >= 1e7 ? `${formatCr(n)} Cr` : `₹${Math.round(n / 1e5)} L`;
}

/** Sanctioned-works ledger — searchable, filterable; session dispatches ride in live. */
export function WorksLedger() {
  const dispatched = useDashboardStore((s) => s.dispatched);
  const selectCluster = useDashboardStore((s) => s.selectCluster);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<WorkStatus | "all">("all");
  // Session-local status edits, keyed by work id; the ledger data is otherwise static.
  const [overrides, setOverrides] = useState<Record<string, WorkStatus>>({});

  const works = useMemo(
    () => [...dispatchedToWorks(dispatched), ...SANCTIONED_WORKS],
    [dispatched],
  );

  const statusOf = (w: (typeof works)[number]) => overrides[w.id] ?? w.status;

  const rows = works.filter((w) => {
    if (status !== "all" && statusOf(w) !== status) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      w.wardLabel.toLowerCase().includes(q) ||
      (SECTOR_LABELS[w.sector] ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="glass-strong rounded-xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-ink">Sanctioned works ledger</div>
          <div className="text-[11px] text-muted-foreground">{rows.length} works</div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-input bg-surface/70 px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search works, wards, sectors"
            aria-label="Search works ledger"
            className="w-44 bg-transparent text-[12px] text-ink placeholder:text-faint focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              status === f ? "bg-primary text-primary-foreground" : "glass text-body hover:text-ink"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-line/60 text-[10.5px] uppercase tracking-wide text-faint">
              <th className="px-2 py-2 font-medium">Work</th>
              <th className="px-2 py-2 font-medium">Sector</th>
              <th className="px-2 py-2 font-medium">Ward</th>
              <th className="px-2 py-2 text-right font-medium">Cost</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Sanctioned</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr
                key={w.id}
                onClick={w.clusterId ? () => selectCluster(w.clusterId!) : undefined}
                className={`border-b border-line/40 text-[12px] last:border-b-0 ${
                  w.session ? "bg-success/[0.07]" : ""
                } ${w.clusterId ? "cursor-pointer hover:bg-chip/60" : ""}`}
              >
                <td className="px-2 py-2.5">
                  <div className="font-medium text-ink">{w.title}</div>
                  <div className="font-mono text-[10px] text-faint">{w.id}</div>
                </td>
                <td className="px-2 py-2.5 text-body">{SECTOR_LABELS[w.sector]}</td>
                <td className="px-2 py-2.5 text-body">{w.wardLabel}</td>
                <td className="num px-2 py-2.5 text-right text-ink">{rupeesL(w.costRupees)}</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-1">
                    <select
                      value={statusOf(w)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setOverrides((o) => ({ ...o, [w.id]: e.target.value as WorkStatus }))
                      }
                      aria-label={`Status for ${w.title}`}
                      className={`cursor-pointer rounded border border-input bg-surface/70 py-1 pl-1.5 pr-1 text-[11.5px] font-medium focus:outline-none focus:ring-1 focus:ring-ring ${STATUS_STYLE[statusOf(w)]}`}
                    >
                      {(Object.keys(STATUS_LABEL) as WorkStatus[]).map((s) => (
                        <option key={s} value={s} className="text-ink">
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    {(w.scComponent || w.stComponent) && (
                      <span className="rounded bg-chip px-1 py-px text-[9px] text-muted-foreground">
                        {w.scComponent ? "SC" : "ST"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-faint">{w.sanctionedOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-8 text-center text-[12px] text-faint">No works match your filters.</p>
        )}
      </div>
    </div>
  );
}
