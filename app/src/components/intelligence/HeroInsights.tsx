import { BUDGET_HERO, FORECAST_HERO } from "@/lib/intelligence-data";

function TrendUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function RupeeIcon() {
  // Indian rupee, not the stock dollar-sign glyph the design file reused.
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13l8.5 8" />
      <path d="M6 13h3a5 5 0 0 0 0-10" />
    </svg>
  );
}

/**
 * "Attention this week" — the two high-leverage hero recommendations (design):
 * a saffron Forecast card and a navy Budget-optimizer card, each with a quiet
 * radial wash in its accent colour.
 */
export function HeroInsights() {
  return (
    <section className="mx-auto max-w-[1440px] px-10 pt-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <div className="text-[22px] font-semibold tracking-tight text-ink">
            Attention this week
          </div>
          <div className="mt-1.5 text-[13.5px] text-muted-foreground">
            Two recommendations the model flagged as high-leverage. Each links to its full
            reasoning trail.
          </div>
        </div>
        <button className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-transparent px-3 py-[7px] text-[12.5px] text-ink hover:border-line-dark">
          <span>Past 30 days</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-fg))" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Forecast hero */}
        <article className="relative overflow-hidden rounded-xl border border-line bg-surface px-8 py-7">
          <div
            className="pointer-events-none absolute right-0 top-0 h-[220px] w-[220px]"
            style={{ background: "radial-gradient(circle at top right, hsl(var(--saffron))12, transparent 70%)" }}
          />
          <div className="mb-[18px] flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "hsl(var(--saffron))18", color: "hsl(var(--saffron))" }}
            >
              <TrendUpIcon />
            </span>
            <span>
              <span className="block text-xs font-medium uppercase tracking-[0.06em] text-saffron">
                {FORECAST_HERO.eyebrow}
              </span>
              <span className="block text-[11.5px] text-faint">{FORECAST_HERO.meta}</span>
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-ink">
            {FORECAST_HERO.headline}
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-body">{FORECAST_HERO.body}</p>
          <div className="mb-[18px] rounded-lg border border-line bg-panel px-4 py-3.5">
            <div className="mb-1.5 text-[11.5px] text-muted-foreground">{FORECAST_HERO.actionsLabel}</div>
            <ul className="m-0 list-disc pl-[18px] text-[13.5px] leading-relaxed text-ink">
              {FORECAST_HERO.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <button className="cursor-pointer rounded-full border-0 bg-primary px-4 py-[9px] text-[12.5px] font-medium text-white hover:bg-primary-hover">
              {FORECAST_HERO.cta}
            </button>
            <a href="#" className="text-[12.5px] text-primary no-underline">
              Full reasoning trail →
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 border-t border-line-faint pt-4 text-[11.5px]">
            <span className="text-faint">Cited:</span>
            {FORECAST_HERO.citations.map((c) => (
              <a key={c} href="#" className="text-primary no-underline">
                {c}
              </a>
            ))}
          </div>
        </article>

        {/* Budget optimizer hero */}
        <article className="relative overflow-hidden rounded-xl border border-line bg-surface px-8 py-7">
          <div
            className="pointer-events-none absolute right-0 top-0 h-[220px] w-[220px]"
            style={{ background: "radial-gradient(circle at top right, hsl(var(--primary-brand))12, transparent 70%)" }}
          />
          <div className="mb-[18px] flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "hsl(var(--primary-brand))18", color: "hsl(var(--primary-brand))" }}
            >
              <RupeeIcon />
            </span>
            <span>
              <span className="block text-xs font-medium uppercase tracking-[0.06em] text-primary">
                {BUDGET_HERO.eyebrow}
              </span>
              <span className="block text-[11.5px] text-faint">{BUDGET_HERO.meta}</span>
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-ink">
            Close the SC allocation gap of <span className="num">₹11 L</span> in 3 moves this
            month.
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-body">{BUDGET_HERO.body}</p>

          <div className="mb-[18px] flex flex-col gap-1.5">
            {BUDGET_HERO.moves.map((m, i) => (
              <div
                key={m.title}
                className="flex items-center rounded-lg border border-line bg-panel px-3.5 py-3"
              >
                <span className="w-6 font-mono text-[11px] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-[13.5px] font-medium text-ink">{m.title}</span>
                  <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{m.note}</span>
                </span>
                <span className="num text-[13.5px] font-medium text-ink">{m.cost}</span>
              </div>
            ))}
          </div>

          <div className="mb-[18px] flex items-center justify-between rounded-lg bg-canvas px-3.5 py-3">
            <div className="text-[12.5px] text-ink">
              <span className="text-muted-foreground">{BUDGET_HERO.outcome.label} </span>
              <span className="font-medium">
                SC allocation → <span className="num">15.4%</span>
              </span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="font-medium text-success">{BUDGET_HERO.outcome.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="cursor-pointer rounded-full border-0 bg-primary px-4 py-[9px] text-[12.5px] font-medium text-white hover:bg-primary-hover">
              {BUDGET_HERO.cta}
            </button>
            <a href="#" className="text-[12.5px] text-primary no-underline">
              See other options →
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
