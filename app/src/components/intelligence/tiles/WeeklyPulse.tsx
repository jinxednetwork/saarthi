import { PULSE_MAX, WEEKLY_PULSE } from "@/lib/insights";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** 4-week × 7-day signal heat strip — intensity by saffron opacity. */
export function WeeklyPulse() {
  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Weekly pulse</div>
      <div className="mb-3 text-[11px] text-muted-foreground">Signal volume · last 4 weeks</div>

      <div className="flex flex-1 flex-col justify-center gap-1.5">
        <div className="flex gap-1.5 pl-12">
          {DAYS.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[9px] text-faint">
              {d}
            </span>
          ))}
        </div>
        {WEEKLY_PULSE.map((row) => (
          <div key={row.week} className="flex items-center gap-1.5">
            <span className="w-11 shrink-0 text-[10px] text-faint">{row.week}</span>
            {row.counts.map((c, i) => (
              <span
                key={i}
                title={`${row.week} · ${c} signals`}
                className="aspect-square flex-1 rounded"
                style={{
                  background: `hsl(var(--saffron) / ${(0.12 + (c / PULSE_MAX) * 0.85).toFixed(2)})`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-faint">
        <span>Low</span>
        {[0.15, 0.4, 0.65, 0.95].map((o) => (
          <span key={o} className="h-2.5 w-2.5 rounded" style={{ background: `hsl(var(--saffron) / ${o})` }} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}
