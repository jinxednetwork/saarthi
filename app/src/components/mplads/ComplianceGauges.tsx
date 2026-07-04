import { MPLADS_RULES } from "@saarthi/shared";
import { AlertTriangle, Check } from "lucide-react";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";

/**
 * SC/ST allocation gauges — a 180° arc with a floor tick at the mandated
 * minimum. Custom SVG (recharts RadialBar can't place the floor marker
 * cleanly). Colours ride CSS vars.
 */
function Gauge({
  label,
  pct,
  floor,
}: {
  label: string;
  pct: number;
  floor: number;
}) {
  const below = pct < floor;
  // Map 0–25% onto the 180° arc (floor lines sit comfortably inside).
  const SCALE = 0.25;
  const R = 52;
  const CX = 60;
  const CY = 60;
  const arc = (frac: number): [number, number] => {
    const a = Math.PI * (1 - Math.min(frac / SCALE, 1));
    return [CX + R * Math.cos(a), CY - R * Math.sin(a)];
  };
  const [vx, vy] = arc(pct);
  const [fx, fy] = arc(floor);
  const valColor = below ? "hsl(var(--urgency-high))" : "hsl(var(--success))";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 74" className="w-full max-w-[168px]">
        {/* track */}
        <path d="M8 60 A52 52 0 0 1 112 60" fill="none" stroke="hsl(var(--line))" strokeWidth={8} strokeLinecap="round" />
        {/* value arc */}
        <path
          d={`M8 60 A52 52 0 0 1 ${vx.toFixed(1)} ${vy.toFixed(1)}`}
          fill="none"
          stroke={valColor}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* floor tick */}
        <line
          x1={CX + (R - 7) * ((fx - CX) / R)}
          y1={CY + (R - 7) * ((fy - CY) / R)}
          x2={CX + (R + 7) * ((fx - CX) / R)}
          y2={CY + (R + 7) * ((fy - CY) / R)}
          stroke="hsl(var(--ink))"
          strokeWidth={2}
        />
      </svg>
      <div className="-mt-3 flex items-baseline gap-0.5">
        <span className="num text-2xl font-semibold text-ink">{(pct * 100).toFixed(1)}</span>
        <span className="text-[12px] text-muted-foreground">%</span>
      </div>
      <div className="mt-0.5 text-[12px] font-medium text-ink">{label}</div>
      <div
        className={`mt-0.5 flex items-center gap-1 text-[11px] ${below ? "text-urgency-high" : "text-success"}`}
      >
        {below ? <AlertTriangle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
        floor {Math.round(floor * 100 * 10) / 10}%
      </div>
    </div>
  );
}

export function ComplianceGauges() {
  const m = MOCK_CONSTITUENCY.mplads;
  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Reservation compliance</div>
      <div className="mb-4 text-[11px] text-muted-foreground">
        Mandated floors: SC ≥15% · ST ≥7.5% of allocation
      </div>
      <div className="grid flex-1 grid-cols-2 items-center gap-3">
        <Gauge label="SC allocation" pct={m.sc_percent_ytd} floor={MPLADS_RULES.scMinShare} />
        <Gauge label="ST allocation" pct={m.st_percent_ytd} floor={MPLADS_RULES.stMinShare} />
      </div>
    </div>
  );
}
