import type { Metadata } from "next";
import { ActionsLedger } from "@/components/actions/ActionsLedger";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata: Metadata = {
  title: "Actions — Saarthi",
};

/**
 * Actions — the MP's dispatch tracker. Every letter, question, meeting and
 * brief with its status timeline, reference number, response countdown and
 * outcome. Letters dispatched this session appear at the top instantly.
 */
export default function ActionsPage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-6">
        <PageHeader
          titleKey="pageHeader.actions.title"
          subtitleKey="pageHeader.actions.subtitle"
          right={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-[5px] w-[5px] animate-livePulse rounded-full bg-success" />
              Live · dispatches appear instantly
            </span>
          }
        />
        <ActionsLedger />
      </div>
    </div>
  );
}
