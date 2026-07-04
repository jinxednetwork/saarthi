"use client";

import { ArrowRight, MessagesSquare } from "lucide-react";
import { citizenThemes } from "@/lib/insights";
import { dimensionLabel } from "@/lib/proposals";
import { URGENCY_UI } from "@/lib/ui";
import { NewProposalDialog } from "./NewProposalDialog";

/**
 * Consolidated citizen feedback → a proposal in one click. Each theme rolls up
 * the raw signals (which the MP would otherwise sift by hand) into a ward-scoped
 * headline; "Draft proposal" opens the composer pre-scoped to that ward + need.
 */
export function FeedbackThemes() {
  const themes = citizenThemes();

  return (
    <section className="rounded-xl border border-line/60 bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <MessagesSquare className="h-4 w-4 text-primary" strokeWidth={1.75} />
        <h2 className="text-[13px] font-semibold text-ink">Consolidated from citizen feedback</h2>
        <span className="text-[11px] text-faint">— draft a proposal straight from a theme</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {themes.map((theme) => {
          const u = URGENCY_UI[theme.worstUrgency];
          return (
            <div
              key={theme.group}
              className="flex flex-col gap-2 rounded-lg border border-line/60 bg-panel/50 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: theme.color }} />
                <span className="text-[12.5px] font-medium text-ink">{theme.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="num text-[19px] font-semibold leading-none text-ink">
                  {theme.signals.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  signals · {theme.clusters} clusters
                </span>
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Loudest in{" "}
                <span className="font-medium text-ink">{theme.topWardName}</span>
                {theme.topWardScMajority && <span className="text-saffron"> · SC-majority</span>} ·{" "}
                <span style={{ color: u.text }}>{u.label.toLowerCase()}</span>
              </p>
              <NewProposalDialog
                initial={{
                  dimension: theme.dimension,
                  wardId: theme.topWardId,
                  title: "",
                }}
                trigger={
                  <button className="mt-auto inline-flex w-fit items-center gap-1 text-[11.5px] font-medium text-primary hover:underline">
                    Draft proposal
                    <ArrowRight className="h-3 w-3" />
                  </button>
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
