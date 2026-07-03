import {
  ANOMALIES,
  BENCHMARK_ROWS,
  CROSS_REFS,
  INSIGHT_TYPES,
  type InsightType,
} from "@/lib/intelligence-data";

function TypeIcon({ type }: { type: InsightType }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "predictive":
      return (
        <svg {...common}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "causal":
      return (
        <svg {...common}>
          <circle cx={12} cy={12} r={10} />
          <line x1={12} y1={6} x2={12} y2={12} />
          <line x1={12} y1={12} x2={16} y2={14} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

/** Cross-references, anomalies and the comparative benchmark (design grid). */
export function InsightGrid() {
  return (
    <section className="mx-auto max-w-[1440px] px-10 pt-10">
      <div className="grid grid-cols-2 gap-5">
        {/* Cross-references */}
        <div>
          <div className="mb-[18px]">
            <div className="text-[17px] font-semibold tracking-tight text-ink">
              Cross-references
            </div>
            <div className="mt-1 text-[12.5px] text-muted">
              Where citizen signals and public data collide
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {CROSS_REFS.map((x) => {
              const t = INSIGHT_TYPES[x.type];
              return (
                <article key={x.title} className="rounded-[10px] border border-line bg-surface px-5 py-[18px]">
                  <div className="mb-2.5 flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ background: t.bg, color: t.color }}
                    >
                      <TypeIcon type={x.type} />
                    </span>
                    <span
                      className="text-xs font-medium uppercase tracking-[0.06em]"
                      style={{ color: t.color }}
                    >
                      {t.label}
                    </span>
                    <span className="flex-1" />
                    <span className="text-[11.5px] text-faint">{x.confidence}</span>
                  </div>
                  <div className="mb-2 text-[15px] font-medium leading-snug text-ink">
                    {x.title}
                  </div>
                  <div className="mb-2.5 text-[12.5px] leading-relaxed text-body">{x.detail}</div>
                  <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[11.5px]">
                    <span className="text-faint">Data:</span>
                    {x.sources.map((s) => (
                      <a key={s} href="#" className="text-primary no-underline">
                        {s}
                      </a>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 border-t border-line-faint pt-2.5">
                    <button className="cursor-pointer rounded-full border border-primary bg-transparent px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-canvas">
                      {x.actionLabel}
                    </button>
                    <a href="#" className="text-xs text-muted no-underline hover:text-ink">
                      Reasoning trail
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Anomalies + benchmark */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-[18px]">
              <div className="text-[17px] font-semibold tracking-tight text-ink">Anomalies</div>
              <div className="mt-1 text-[12.5px] text-muted">
                Unusual signals worth your attention
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {ANOMALIES.map((a) => (
                <article key={a.title} className="rounded-[10px] border border-line bg-surface px-5 py-4">
                  <div className="flex items-start gap-3.5">
                    <span
                      className="w-1 self-stretch rounded-[2px]"
                      style={{ background: a.color }}
                    />
                    <span className="flex-1">
                      <span className="mb-1.5 flex items-center justify-between">
                        <span className="text-[14.5px] font-medium text-ink">{a.title}</span>
                        <span className="num text-[13px] font-medium" style={{ color: a.color }}>
                          {a.magnitude}
                        </span>
                      </span>
                      <span className="mb-2 block text-[12.5px] leading-relaxed text-body">
                        {a.detail}
                      </span>
                      <span className="block text-[11.5px] text-faint">{a.baseline}</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-[18px]">
              <div className="text-[17px] font-semibold tracking-tight text-ink">
                Comparative benchmark
              </div>
              <div className="mt-1 text-[12.5px] text-muted">
                How your constituency compares to peers
              </div>
            </div>
            <div className="rounded-[10px] border border-line bg-surface px-5 py-[18px]">
              <div className="mb-3 grid grid-cols-[1.2fr_1fr_100px] gap-3 border-b border-line-faint pb-3 text-[11.5px] text-faint">
                <div>Constituency</div>
                <div>Signals per 10K citizens</div>
                <div className="text-right">Response time</div>
              </div>
              <div className="flex flex-col gap-2.5">
                {BENCHMARK_ROWS.map((r) => {
                  const max = Math.max(...BENCHMARK_ROWS.map((b) => b.count));
                  return (
                    <div key={r.name} className="grid grid-cols-[1.2fr_1fr_100px] items-center gap-3">
                      <div
                        className={`text-[13px] ${
                          r.highlight ? "font-medium text-primary" : "font-normal text-ink"
                        }`}
                      >
                        {r.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-canvas">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${(r.count / max) * 100}%`,
                              background: r.highlight ? "#12325B" : "#CDC5B4",
                            }}
                          />
                        </span>
                        <span className="num min-w-[32px] text-right text-xs text-ink">
                          {r.count}
                        </span>
                      </div>
                      <div className="num text-right text-xs text-body">{r.response}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
