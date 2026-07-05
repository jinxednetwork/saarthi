import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/PageHeader";
import { DocumentsView } from "@/components/documents/DocumentsView";

export const metadata: Metadata = {
  title: "Documents — Saarthi",
};

/**
 * Documents — scan/upload letters and reports; AI parses them into a searchable
 * library whose chunks feed the Saarthi Assistant (§7.6).
 */
export default function DocumentsPage() {
  return (
    <div className="h-full overflow-y-auto pt-16">
      <div className="mx-auto max-w-[900px] px-6 pb-16 pt-6">
        <PageHeader
          titleKey="pageHeader.documents.title"
          subtitleKey="pageHeader.documents.subtitle"
          right={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-[5px] w-[5px] rounded-full bg-primary" />
              Feeds the Assistant
            </span>
          }
        />
        <DocumentsView />
      </div>
    </div>
  );
}
