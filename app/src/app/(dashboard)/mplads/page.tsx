import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/PageHeader";
import { BudgetHeroTiles } from "@/components/mplads/BudgetHeroTiles";
import { ComplianceGauges } from "@/components/mplads/ComplianceGauges";
import { EligibilityChecker } from "@/components/mplads/EligibilityChecker";
import { FundFlow } from "@/components/mplads/FundFlow";
import { SectorDonut } from "@/components/mplads/SectorDonut";
import { WorksLedger } from "@/components/mplads/WorksLedger";

export const metadata: Metadata = {
  title: "MPLADS — Saarthi",
};

/**
 * MPLADS / Budget — where the ₹5 Cr goes. Budget tiles → sector spend + SC/ST
 * compliance + eligibility check → fund flow → sanctioned-works ledger (session
 * dispatches ride in live). All figures reconcile to MOCK_CONSTITUENCY.mplads.
 */
export default function MpladsPage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-6">
        <PageHeader
          titleKey="pageHeader.mplads.title"
          subtitleKey="pageHeader.mplads.subtitle"
          right={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-[5px] w-[5px] animate-livePulse rounded-full bg-success" />
              Synced with MoSPI portal
            </span>
          }
        />

        <div className="flex flex-col gap-4">
          <BudgetHeroTiles />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectorDonut />
            <ComplianceGauges />
            <EligibilityChecker />
          </div>

          <FundFlow />
          <WorksLedger />
        </div>
      </div>
    </div>
  );
}
