import { BENCHMARK_ROWS } from "@/lib/intelligence-data";

/** Response-time benchmark vs peer constituencies (yours highlighted). */
export function ResponseBenchmark() {
  const max = Math.max(...BENCHMARK_ROWS.map((r) => r.count));
  const mine = BENCHMARK_ROWS.find((r) => r.highlight);

  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Peer benchmark</div>
      <div className="mb-3 text-[11px] text-muted-foreground">Signals per 10K citizens</div>

      {mine && (
        <div className="mb-3 flex items-baseline gap-2">
          <span className="num text-2xl font-semibold text-primary">{mine.response}</span>
          <span className="text-[11px] text-muted-foreground">avg response time</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {BENCHMARK_ROWS.map((r) => (
          <div key={r.name} className="flex items-center gap-2.5">
            <span
              className={`w-32 shrink-0 truncate text-[11.5px] ${r.highlight ? "font-medium text-primary" : "text-body"}`}
            >
              {r.name}
            </span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/40">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${(r.count / max) * 100}%`,
                  background: r.highlight ? "hsl(var(--primary-brand))" : "hsl(var(--line-dark))",
                }}
              />
            </span>
            <span className="num w-8 shrink-0 text-right text-[11px] text-faint">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
