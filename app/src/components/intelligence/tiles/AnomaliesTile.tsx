import { ANOMALIES } from "@/lib/intelligence-data";

/** Compact anomalies list for the bento. */
export function AnomaliesTile() {
  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Anomalies</div>
      <div className="mb-3 text-[11px] text-muted-foreground">Unusual signals worth a look</div>
      <div className="flex flex-col gap-3">
        {ANOMALIES.map((a) => (
          <div key={a.title}>
            <div className="mb-0.5 flex items-start justify-between gap-2">
              <span className="text-[12.5px] font-medium leading-snug text-ink">{a.title}</span>
              <span className="num shrink-0 text-[12px] font-medium" style={{ color: a.color }}>
                {a.magnitude}
              </span>
            </div>
            <p className="text-[11px] text-faint">{a.baseline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
