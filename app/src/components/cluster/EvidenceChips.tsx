import { SUBMISSION_SOURCES } from "@saarthi/shared";
import type { SourceBreakdown, SubmissionSource } from "@saarthi/shared";
import { SourceIcon } from "@/components/icons";

const SOURCE_LABEL: Record<SubmissionSource, string> = {
  whatsapp: "WhatsApp",
  twitter: "X posts",
  reddit: "Reddit",
  widget: "Portal",
  portal: "Portal",
  news: "News",
  document: "Documents",
};

/** Per-source signal counts — the evidence layer, rendered as quiet chips. */
export function EvidenceChips({
  breakdown,
  total,
}: {
  breakdown: SourceBreakdown;
  total: number;
}) {
  const evidence = SUBMISSION_SOURCES.filter((s) => breakdown[s] > 0).map((s) => ({
    source: s,
    count: breakdown[s],
    label: SOURCE_LABEL[s],
  }));

  return (
    <div>
      <div className="mb-2 text-[12px] text-muted-foreground">
        <span className="num font-medium text-ink">{total}</span> signals · {evidence.length}{" "}
        sources
      </div>
      <div className="flex flex-wrap gap-1.5">
        {evidence.map((e) => (
          <span
            key={e.source}
            className="inline-flex items-center gap-1.5 rounded-md bg-chip py-1 pl-2 pr-2.5 text-[11.5px] text-ink"
          >
            <span className="flex h-3 w-3 items-center justify-center text-muted-foreground">
              <SourceIcon source={e.source} />
            </span>
            <span className="num font-medium">{e.count}</span>
            <span className="text-muted-foreground">{e.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
