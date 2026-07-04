"use client";

import { ChevronRight, ExternalLink } from "lucide-react";
import type { ProposalScore, ScoreComponent } from "@/lib/proposals";

/** Score band → semantic colour + verdict word. */
export function scoreBand(total: number): { label: string; stroke: string; text: string } {
  if (total >= 68) return { label: "Strong case", stroke: "hsl(var(--success))", text: "text-success" };
  if (total >= 50) return { label: "Fundable", stroke: "hsl(var(--primary-brand))", text: "text-primary" };
  if (total >= 36) return { label: "Marginal", stroke: "hsl(var(--urgency-high))", text: "text-urgency-high" };
  return { label: "Weak case", stroke: "hsl(var(--faint))", text: "text-faint" };
}

export function ScoreRing({ total, size = 56 }: { total: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, total)) / 100);
  const band = scoreBand(total);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      role="img"
      aria-label={`Score ${Math.round(total)} of 100 — ${band.label}`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--line))" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={band.stroke}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="num"
        style={{ fontSize: size * 0.3, fontWeight: 600, fill: "hsl(var(--ink))" }}
      >
        {Math.round(total)}
      </text>
    </svg>
  );
}

function CitationChip({
  citation,
  onSelectCluster,
}: {
  citation: NonNullable<ScoreComponent["citation"]>;
  onSelectCluster?: (id: string) => void;
}) {
  if (citation.clusterId && onSelectCluster) {
    return (
      <button
        onClick={() => onSelectCluster(citation.clusterId!)}
        className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-primary hover:underline"
      >
        {citation.label}
        <ChevronRight className="h-2.5 w-2.5" />
      </button>
    );
  }
  if (citation.href) {
    return (
      <a
        href={citation.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-link hover:underline"
      >
        {citation.label}
        <ExternalLink className="h-2.5 w-2.5" />
      </a>
    );
  }
  return <span className="text-[10.5px] text-faint">{citation.label}</span>;
}

/**
 * The six weighted components as bars. `value` fills the bar (0–100%); the
 * points it contributes and its weight are annotated. `detailed` reveals the
 * evidence sentence + citation behind each number.
 */
export function ComponentBars({
  score,
  detailed = false,
  onSelectCluster,
}: {
  score: ProposalScore;
  detailed?: boolean;
  onSelectCluster?: (id: string) => void;
}) {
  const rows = [...score.components].sort((a, b) => b.contribution - a.contribution);
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((c) => (
        <li key={c.key}>
          <div className="flex items-center gap-2">
            <span className="w-[104px] shrink-0 text-[11px] text-muted-foreground">{c.label}</span>
            <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line/60">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${Math.round(c.value * 100)}%` }}
              />
            </span>
            <span className="num w-12 shrink-0 text-right text-[11px] font-medium text-ink">
              +{c.contribution.toFixed(1)}
            </span>
            <span className="num w-8 shrink-0 text-right text-[10px] text-faint">×{c.weight}</span>
          </div>
          {detailed && (
            <div className="ml-[112px] mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[11px] leading-snug text-muted-foreground">{c.evidence}</span>
              {c.citation && <CitationChip citation={c.citation} onSelectCluster={onSelectCluster} />}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
