"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { signalsByCategory } from "@/lib/insights";
import { useChartColors } from "@/lib/use-chart-colors";

/** Signals split across the three v1 category groups. */
export function CategoryDonut() {
  const colors = useChartColors();
  const slices = signalsByCategory();
  const total = slices.reduce((s, d) => s + d.signals, 0);

  const fillFor = (group: string) =>
    colors
      ? group === "water"
        ? colors.link
        : group === "health"
          ? colors["pathway-state"]
          : colors["urgency-low"]
      : "transparent";

  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Signals by category</div>
      <div className="mb-2 text-[11px] text-muted-foreground">This week · {total} signals</div>

      {!colors ? (
        <Skeleton className="mx-auto h-[140px] w-[140px] rounded-full" />
      ) : (
        <div className="relative h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="signals" nameKey="label" innerRadius="60%" outerRadius="100%" paddingAngle={2} stroke="none">
                {slices.map((s) => (
                  <Cell key={s.group} fill={fillFor(s.group)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-2xl font-semibold text-ink">{slices.length}</span>
            <span className="text-[10px] text-faint">categories</span>
          </div>
        </div>
      )}

      <ul className="mt-3 flex flex-col gap-1.5">
        {slices.map((s) => (
          <li key={s.group} className="flex items-center gap-2 text-[11.5px]">
            <span className="h-2 w-2 rounded-full" style={{ background: fillFor(s.group) }} />
            <span className="flex-1 truncate text-body">{s.label}</span>
            <span className="num text-faint">
              {s.signals} · {s.clusters} clusters
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
