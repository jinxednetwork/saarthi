import { OUTLOOK_CHART as C } from "@/lib/intelligence-data";

/**
 * 12-week outlook — projected signal volume by category (design SVG).
 *
 * Load choreography (the design declared a drawIn keyframe but never used it):
 * the three lines draw left→right, staggered; the confidence band, now-dots and
 * annotations fade in once the lines have landed. Static under reduced motion.
 */
export function OutlookChart() {
  return (
    <section className="mx-auto max-w-[1440px] px-10 pt-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <div className="text-[22px] font-semibold tracking-tight text-ink">12-week outlook</div>
          <div className="mt-1.5 text-[13.5px] text-muted-foreground">
            Projected signal volume by category. Bands show 80% confidence interval.
          </div>
        </div>
        <div className="flex items-center gap-2">
          {C.legend.map((l) => (
            <span key={l.key} className="flex items-center gap-1.5 px-2.5 py-1">
              <span className="h-[3px] w-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-ink">{l.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface px-8 py-7">
        <svg viewBox="0 0 1280 300" className="block h-[300px] w-full" role="img" aria-label="Line chart projecting weekly signal volume for public health, water, and infrastructure over the next 12 weeks. Public health peaks near 220 signals around Diwali in week 45.">
          {/* Axes */}
          <line x1={60} y1={30} x2={60} y2={260} stroke="hsl(var(--line))" strokeWidth={1} />
          <line x1={60} y1={260} x2={1240} y2={260} stroke="hsl(var(--line))" strokeWidth={1} />

          {/* Y labels + horizontal grid */}
          {C.yLabels.map((l) => (
            <text key={l.y} x={52} y={l.y} textAnchor="end" fontSize={10} fill="hsl(var(--faint))">
              {l.label}
            </text>
          ))}
          {[30, 90, 150, 210].map((y) => (
            <line key={y} x1={60} y1={y} x2={1240} y2={y} stroke="hsl(var(--chip))" strokeWidth={1} strokeDasharray="2,3" />
          ))}

          {/* Actual/forecast split */}
          <line x1={C.nowX} y1={30} x2={C.nowX} y2={260} stroke="hsl(var(--line-dark))" strokeWidth={1} strokeDasharray="4,4" />
          <rect x={C.nowX} y={30} width={1240 - C.nowX} height={230} fill="hsl(var(--panel))" opacity={0.4} />
          <text x={C.nowX + 4} y={45} fontSize={10} fill="hsl(var(--faint))">
            Forecast →
          </text>
          <text x={C.nowX - 4} y={45} textAnchor="end" fontSize={10} fill="hsl(var(--faint))">
            ← Actual
          </text>

          {/* Event annotations (fade in after the lines land) */}
          {C.annotations.map((a) => (
            <g key={a.label} className="chart-fade" style={{ animationDelay: "1.5s" }}>
              <line x1={a.x} y1={30} x2={a.x} y2={260} stroke={a.color} strokeWidth={1} strokeOpacity={0.4} />
              <text x={a.x + 4} y={60} fontSize={10} fill={a.color}>
                {a.label}
              </text>
            </g>
          ))}

          {/* Health confidence band */}
          <path
            d={C.healthBand}
            fill="hsl(var(--saffron))"
            fillOpacity={0.1}
            stroke="none"
            className="chart-fade"
            style={{ animationDelay: "1.3s" }}
          />

          {/* Category lines — staggered draw */}
          <polyline
            points={C.healthLine}
            fill="none"
            stroke="hsl(var(--saffron))"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            className="chart-draw"
            style={{ animationDelay: "0.15s" }}
          />
          <polyline
            points={C.infraLine}
            fill="none"
            stroke="hsl(var(--primary-brand))"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            className="chart-draw"
            style={{ animationDelay: "0.35s" }}
          />
          <polyline
            points={C.waterLine}
            fill="none"
            stroke="hsl(var(--link))"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            className="chart-draw"
            style={{ animationDelay: "0.55s" }}
          />

          {/* Now markers + peak (fade with annotations) */}
          <g className="chart-fade" style={{ animationDelay: "1.5s" }}>
            {C.nowDots.map((d) => (
              <circle key={d.color} cx={C.nowX} cy={d.y} r={4} fill={d.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
            <circle cx={C.peak.x} cy={C.peak.y} r={4} fill="hsl(var(--saffron))" stroke="#FFFFFF" strokeWidth={2} />
            <text x={C.peak.x + 10} y={C.peak.y - 8} fontSize={11} fill="hsl(var(--ink))" fontWeight={500}>
              {C.peak.label}
            </text>
          </g>

          {/* X labels */}
          {C.xLabels.map((l) => (
            <text
              key={l.x}
              x={l.x}
              y={280}
              textAnchor="middle"
              fontSize={10}
              fill={l.now ? "hsl(var(--ink))" : "hsl(var(--faint))"}
              fontWeight={l.now ? 500 : 400}
            >
              {l.label}
            </text>
          ))}
        </svg>

        {/* Chart footer */}
        <div className="mt-[18px] flex items-center justify-between border-t border-line-faint pt-4 text-xs text-muted-foreground">
          <div>
            {C.footer.trainedOn} ·{" "}
            <a href="#" className="text-primary no-underline">
              Methodology
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Confidence {C.footer.confidence}% overall</span>
            <span className="h-[3px] w-[60px] overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-success"
                style={{ width: `${C.footer.confidence}%` }}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
