import { MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { SANCTIONED_WORKS } from "@/lib/mplads-data";
import { formatCr } from "@/lib/ui";

/** Top-of-page budget bento: allocated / utilised / committed / remaining. */
export function BudgetHeroTiles() {
  const m = MOCK_CONSTITUENCY.mplads;
  const committed = SANCTIONED_WORKS.filter((w) => w.status === "sanctioned").reduce(
    (s, w) => s + w.costRupees,
    0,
  );
  const remaining = m.allocation_annual - m.utilization_ytd;
  const utilPct = Math.round((m.utilization_ytd / m.allocation_annual) * 100);

  const tiles = [
    { label: "Annual allocation", value: formatCr(m.allocation_annual), unit: "Cr", sub: `Non-lapsable · FY ${m.fiscal_year}`, accent: "text-ink" },
    { label: "Utilised to date", value: formatCr(m.utilization_ytd), unit: "Cr", sub: `${utilPct}% of allocation`, accent: "text-ink", bar: utilPct },
    { label: "Committed", value: formatCr(committed), unit: "Cr", sub: "Sanctioned, not yet spent", accent: "text-ink" },
    { label: "Remaining headroom", value: formatCr(remaining), unit: "Cr", sub: "Available to recommend", accent: "text-success" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="glass-strong rounded-xl px-5 py-4">
          <div className="mb-2 text-[12px] text-muted-foreground">{t.label}</div>
          <div className="flex items-baseline gap-1">
            <span className={`num text-[26px] font-semibold leading-none tracking-tight ${t.accent}`}>
              {t.value}
            </span>
            <span className="text-[13px] text-muted-foreground">{t.unit}</span>
          </div>
          {t.bar != null && (
            <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-line/60">
              <div className="h-full rounded-full bg-primary" style={{ width: `${t.bar}%` }} />
            </div>
          )}
          <div className="mt-2 text-[11px] text-faint">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
