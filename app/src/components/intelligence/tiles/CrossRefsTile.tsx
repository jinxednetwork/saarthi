import { datasetUrl } from "@/lib/datasets";
import { CROSS_REFS, INSIGHT_TYPES } from "@/lib/intelligence-data";

/** Compact cross-references list for the bento (data collisions). */
export function CrossRefsTile() {
  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Cross-references</div>
      <div className="mb-3 text-[11px] text-muted-foreground">Where signals meet public data</div>
      <div className="flex flex-col gap-3">
        {CROSS_REFS.map((x) => {
          const t = INSIGHT_TYPES[x.type];
          return (
            <div key={x.title}>
              <div className="mb-0.5 flex items-center gap-1.5">
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.06em]"
                  style={{ color: t.color }}
                >
                  {t.label}
                </span>
                <span className="text-faint">·</span>
                <span className="text-[10px] text-faint">{x.confidence}</span>
              </div>
              <p className="text-[12px] font-medium leading-snug text-ink">{x.title}</p>
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                {x.sources.map((s) => {
                  const url = datasetUrl(s);
                  return url ? (
                    <a
                      key={s}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10.5px] text-primary-link no-underline hover:underline"
                    >
                      {s}
                    </a>
                  ) : (
                    <span key={s} className="text-[10.5px] text-faint">
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
