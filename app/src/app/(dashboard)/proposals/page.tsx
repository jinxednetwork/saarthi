import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/PageHeader";
import { ProposalsBoard } from "@/components/proposals/ProposalsBoard";

export const metadata: Metadata = {
  title: "Proposals — Saarthi",
};

/**
 * Proposals — the MP's own works, ranked and compared head-to-head against the
 * same evidence base (citizen demand + curated public data + MPLADS leverage).
 * Author a proposal directly or promote one from a citizen cluster; the ranking
 * is transparent (§8.3) and every number resolves to its source.
 */
export default function ProposalsPage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-6">
        <PageHeader
          titleKey="pageHeader.proposals.title"
          subtitleKey="pageHeader.proposals.subtitle"
          right={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-[5px] w-[5px] rounded-full bg-primary" />
              Ranked on live evidence
            </span>
          }
        />
        <ProposalsBoard />
      </div>
    </div>
  );
}
