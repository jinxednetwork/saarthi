import { Check } from "lucide-react";

/** Dispatched-action state: date, detail, ref, awaiting-response progress. */
export function DispatchProgress({
  date,
  detail,
  progress,
  refNo,
}: {
  date: string;
  detail: string;
  progress: number;
  refNo?: string;
}) {
  return (
    <div className="rounded-lg border border-success/25 bg-success/[0.06] p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-success">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        Dispatched · {date}
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink">{detail}</p>
      {refNo && <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">{refNo}</p>}
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] text-faint">
          <span>Awaiting response</span>
          <span className="num">{progress}%</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-line/60">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
