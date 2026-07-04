"use client";

import { useState } from "react";
import { MPLADS_PERMITTED_SECTORS, MPLADS_PROHIBITED } from "@saarthi/shared";
import { Ban, CheckCircle2 } from "lucide-react";
import { checkEligibility } from "@/lib/compliance";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { SECTOR_LABELS } from "@/lib/mplads-data";

const humanise = (s: string) =>
  s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Interactive permitted-works checker — mirrors the worker compliance engine. */
export function EligibilityChecker() {
  const [pick, setPick] = useState<string | null>(null);
  const result = pick ? checkEligibility(pick, MOCK_CONSTITUENCY.mplads) : null;

  return (
    <div className="glass-strong flex flex-col rounded-xl p-5">
      <div className="mb-1 text-[13px] font-semibold text-ink">Eligibility quick-check</div>
      <div className="mb-3 text-[11px] text-muted-foreground">
        Pick a work type to test it against MPLADS rules
      </div>

      <div className="mb-2 text-[10.5px] uppercase tracking-wide text-faint">Permitted sectors</div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MPLADS_PERMITTED_SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => setPick(s)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              pick === s ? "border-primary bg-primary/10 text-primary" : "border-line text-body hover:border-line-dark"
            }`}
          >
            {SECTOR_LABELS[s] ?? humanise(s)}
          </button>
        ))}
      </div>

      <div className="mb-2 text-[10.5px] uppercase tracking-wide text-faint">Prohibited items</div>
      <div className="flex flex-wrap gap-1.5">
        {MPLADS_PROHIBITED.map((s) => (
          <button
            key={s}
            onClick={() => setPick(s)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              pick === s ? "border-urgency-critical bg-urgency-critical/10 text-urgency-critical" : "border-line text-body hover:border-line-dark"
            }`}
          >
            {humanise(s)}
          </button>
        ))}
      </div>

      {result && (
        <div
          className={`mt-4 rounded-lg border p-3.5 ${
            result.eligible
              ? "border-success/25 bg-success/[0.06]"
              : "border-urgency-critical/25 bg-urgency-critical/[0.06]"
          }`}
        >
          <div
            className={`mb-1.5 flex items-center gap-1.5 text-[13px] font-medium ${
              result.eligible ? "text-success" : "text-urgency-critical"
            }`}
          >
            {result.eligible ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            {result.eligible ? "Eligible for MPLADS funding" : "Not eligible"}
          </div>
          <ul className="flex flex-col gap-1 text-[12px] text-ink">
            {result.compliance_notes.map((n, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-faint">•</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
