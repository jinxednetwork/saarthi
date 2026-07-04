"use client";

import { wardHotspots } from "@/lib/insights";
import { URGENCY_UI } from "@/lib/ui";

/** Top wards by signal volume — horizontal bars tinted by worst urgency. */
export function WardHotspots() {
  const wards = wardHotspots(6);
  const max = Math.max(...wards.map((w) => w.signals));

  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Ward hotspots</div>
      <div className="mb-3 text-[11px] text-muted-foreground">By signal volume this week</div>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {wards.map((w) => (
          <div key={w.wardId} className="flex items-center gap-2.5">
            <span className="flex w-24 shrink-0 items-center gap-1 truncate text-[11.5px] text-body">
              {w.name}
              {w.scMajority && (
                <span className="rounded bg-chip px-1 text-[8.5px] text-muted-foreground">SC</span>
              )}
            </span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-line/40">
              <span
                className="block h-full rounded-full"
                style={{ width: `${(w.signals / max) * 100}%`, background: URGENCY_UI[w.worstUrgency].dot }}
              />
            </span>
            <span className="num w-6 shrink-0 text-right text-[11px] text-faint">{w.signals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
