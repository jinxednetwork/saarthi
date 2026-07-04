"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useChartColors } from "@/lib/use-chart-colors";
import { sectorSpend } from "@/lib/mplads-data";
import { formatCr } from "@/lib/ui";

/** Spend-by-sector donut with a centre total (recharts + theme bridge). */
export function SectorDonut() {
  const colors = useChartColors();
  const spend = sectorSpend();
  const total = spend.reduce((s, d) => s + d.total, 0);

  const palette = colors
    ? [
        colors.link,
        colors.saffron,
        colors["primary-brand"],
        colors.success,
        colors["urgency-high"],
        colors["pathway-state"],
        colors["urgency-low"],
      ]
    : [];

  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Spend by sector</div>
      <div className="mb-2 text-[11px] text-muted-foreground">Utilised ₹{(total / 1e7).toFixed(2)} Cr</div>

      {!colors ? (
        <Skeleton className="mx-auto h-[160px] w-[160px] rounded-full" />
      ) : (
        <div className="relative h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spend}
                dataKey="total"
                nameKey="label"
                innerRadius="62%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {spend.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-xl font-semibold text-ink">{formatCr(total)}</span>
            <span className="text-[10px] text-faint">Cr utilised</span>
          </div>
        </div>
      )}

      <ul className="mt-3 flex flex-col gap-1.5">
        {spend.map((d, i) => (
          <li key={d.sector} className="flex items-center gap-2 text-[11.5px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: palette[i % palette.length] ?? "hsl(var(--muted-fg))" }}
            />
            <span className="flex-1 truncate text-body">{d.label}</span>
            <span className="num text-faint">₹{Math.round(d.total / 1e5)} L</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
