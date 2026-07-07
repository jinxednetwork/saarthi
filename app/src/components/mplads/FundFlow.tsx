"use client";

import { useState } from "react";
import { useChartColors } from "@/lib/use-chart-colors";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { sectorSpend } from "@/lib/mplads-data";
import { formatCr } from "@/lib/ui";

/**
 * Fund flow — allocation → sectors → wards, top to bottom. A single 100%-
 * stacked allocation bar (each sector + an unspent tail); click a sector to
 * expand its per-ward split below. No sankey dependency; the ribbon colours
 * would only fight the token system.
 */
export function FundFlow() {
  const colors = useChartColors();
  const spend = sectorSpend();
  const allocation = MOCK_CONSTITUENCY.mplads.allocation_annual;
  const utilised = spend.reduce((s, d) => s + d.total, 0);
  const unspent = allocation - utilised;
  const [open, setOpen] = useState<string | null>(spend[0]?.sector ?? null);

  // Ordered so adjacent segments never share a hue family (blue → orange →
  // green, cycled) — otherwise saffron/urgency-high/pathway-state read as one brown.
  const palette = colors
    ? [colors.link, colors.saffron, colors.success, colors["urgency-low"], colors["urgency-high"], colors["primary-brand"], colors["pathway-state"]]
    : [];
  const colorFor = (i: number) => palette[i % palette.length] ?? "hsl(var(--muted-fg))";

  const active = spend.find((s) => s.sector === open);

  return (
    <div className="glass-strong rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Fund flow</div>
      <div className="mb-4 text-[11px] text-muted-foreground">
        {formatCr(allocation)} Cr allocation → sectors → wards · click a sector to expand
      </div>

      {/* Stage 1 — allocation → sectors */}
      <div className="flex h-9 w-full overflow-hidden rounded-lg">
        {spend.map((d, i) => (
          <button
            key={d.sector}
            onClick={() => setOpen(open === d.sector ? null : d.sector)}
            title={`${d.label} · ₹${Math.round(d.total / 1e5)} L`}
            className="group relative h-full transition-opacity hover:opacity-90"
            style={{ width: `${(d.total / allocation) * 100}%`, background: colorFor(i) }}
            aria-label={`${d.label}, ₹${Math.round(d.total / 1e5)} lakh`}
          />
        ))}
        <div
          className="h-full bg-line"
          style={{ width: `${(unspent / allocation) * 100}%` }}
          title={`Unspent · ${formatCr(unspent)} Cr`}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {spend.map((d, i) => (
          <button
            key={d.sector}
            onClick={() => setOpen(open === d.sector ? null : d.sector)}
            className={`flex items-center gap-1.5 text-[11px] transition-opacity ${
              open && open !== d.sector ? "opacity-50" : ""
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: colorFor(i) }} />
            <span className="text-body">{d.label}</span>
            <span className="num text-faint">₹{Math.round(d.total / 1e5)}L</span>
          </button>
        ))}
        <span className="flex items-center gap-1.5 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="text-body">Unspent</span>
          <span className="num text-faint">{formatCr(unspent)}Cr</span>
        </span>
      </div>

      {/* Stage 2 — sector → wards */}
      {active && (
        <div className="mt-5 border-t border-line/50 pt-4">
          <div className="mb-2 text-[12px] font-medium text-ink">
            {active.label} · {active.works.length} works
          </div>
          <div className="flex flex-col gap-2">
            {active.works
              .slice()
              .sort((a, b) => b.costRupees - a.costRupees)
              .map((w) => (
                <div key={w.id} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-[11.5px] text-body">{w.wardLabel}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/40">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(w.costRupees / active.total) * 100}%`,
                        background: colorFor(spend.findIndex((s) => s.sector === active.sector)),
                      }}
                    />
                  </span>
                  <span className="num w-12 shrink-0 text-right text-[11px] text-faint">
                    ₹{Math.round(w.costRupees / 1e5)}L
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
