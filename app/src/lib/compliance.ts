import {
  MPLADS_PERMITTED_SECTORS,
  MPLADS_PROHIBITED,
  MPLADS_RULES,
} from "@saarthi/shared";
import type {
  MpladsEligibilityResult,
  MpladsLedger,
  MpladsProhibited,
  MpladsSector,
} from "@saarthi/shared";

/**
 * MPLADS compliance engine (§8.4) — app-side MIRROR of
 * `worker/src/compliance/index.ts`. Keep the two in sync until Phase 4 wires
 * the worker behind an API; the shared constants guarantee the rulebook
 * matches, this file only mirrors the verdict logic.
 */
export function checkEligibility(
  sector: string,
  ledger?: MpladsLedger,
): MpladsEligibilityResult {
  const notes: string[] = [];

  const prohibited = MPLADS_PROHIBITED.find((p) => p === sector) as
    | MpladsProhibited
    | undefined;
  if (prohibited) {
    return {
      eligible: false,
      prohibited_reason: prohibited,
      compliance_notes: [`Blocked: '${prohibited}' is a prohibited MPLADS item.`],
    };
  }

  const permitted = MPLADS_PERMITTED_SECTORS.find((s) => s === sector) as
    | MpladsSector
    | undefined;
  if (!permitted) {
    return {
      eligible: false,
      compliance_notes: [`'${sector}' is not in the permitted-works list.`],
    };
  }
  notes.push(`Permitted sector: ${permitted}`);

  if (ledger) {
    if (ledger.sc_percent_ytd < MPLADS_RULES.scMinShare) {
      notes.push(
        `Helps close SC gap: current ${Math.round(ledger.sc_percent_ytd * 100)}%, ` +
          `target ${Math.round(MPLADS_RULES.scMinShare * 100)}%.`,
      );
    }
    if (ledger.st_percent_ytd < MPLADS_RULES.stMinShare) {
      notes.push(
        `Helps close ST gap: current ${Math.round(ledger.st_percent_ytd * 100)}%, ` +
          `target ${(MPLADS_RULES.stMinShare * 100).toFixed(1)}%.`,
      );
    }
    const headroom = ledger.allocation_annual - ledger.utilization_ytd;
    notes.push(`Remaining headroom: ₹${(headroom / 100_000).toFixed(1)}L.`);
  }

  return { eligible: true, sector: permitted, compliance_notes: notes };
}
