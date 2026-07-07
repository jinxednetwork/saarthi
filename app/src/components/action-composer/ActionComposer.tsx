"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Globe, Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { downloadMpladsLetter } from "@/lib/pdf/generate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { letterRef, useDashboardStore } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS } from "@/lib/mock-data";

function draftLetter(title: string, ward: string, count: number, trend: number): string {
  return `Respected Sir/Madam,

I am writing to bring to your attention a matter requiring urgent intervention in the ${ward} area of the New Delhi Lok Sabha Constituency. Over the past week, my office has received ${count} verified citizen signals concerning "${title}", representing a ${Math.round(trend)}% week-on-week increase in complaint volume.

Cross-referencing with public department records indicates conditions warranting immediate remedial work. Under the MPLADS guidelines (as revised 2023), the recommended works are permissible under the applicable sector.

I hereby recommend the sanction of the proposed works from my constituency development fund, to be executed via the designated District Authority within a stipulated period of 14 days.

Detailed geo-tagged evidence, citizen signal metadata, and cross-referenced public dataset extracts are enclosed with this recommendation as Annexure A.

I request your kind offices to expedite the sanction and issuance of the work order at the earliest.

With regards,
Bansuri Swaraj
Member of Parliament, New Delhi Lok Sabha`;
}

/**
 * Action composer — Dialog (Radix: Esc/trap/aria) with a genuinely editable
 * letter body, resolvable citations, an AlertDialog dispatch confirmation, and
 * a success ceremony with the reference number. Approve & send is the highest-
 * stakes act in the product; it earns a two-step.
 */
export function ActionComposer() {
  const { composerClusterId, closeComposer, sendLetter, dispatched, promotedClusters } = useDashboardStore();
  const cluster =
    MOCK_CLUSTERS.find((c) => c.id === composerClusterId) ??
    promotedClusters.find((c) => c.id === composerClusterId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [body, setBody] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  const isSent = cluster != null && dispatched.some((d) => d.id === cluster.id);
  const refNo = cluster ? letterRef(cluster.id) : "";

  const seeded = useMemo(
    () =>
      cluster
        ? draftLetter(
            cluster.title,
            cluster.ui.wardLabel,
            cluster.submission_count,
            cluster.trend.percent_change,
          )
        : "",
    [cluster],
  );

  useEffect(() => setBody(seeded), [seeded]);

  if (!cluster) return null;

  const citations = [
    ...cluster.cross_reference.map((r) => `${r.dataset} · ${r.metric}`),
    `Saarthi signal archive · ${cluster.submission_count} citizen signals`,
  ];

  const onApprove = () => {
    setConfirmOpen(false);
    sendLetter();
    toast.success("Letter dispatched via NIC secure channel", {
      description: `Ref ${refNo} · District Magistrate, New Delhi District`,
    });
  };

  const onDownloadPdf = async () => {
    if (!cluster) return;
    setPdfBusy(true);
    try {
      // Everything below the closing goes to the signature block on letterhead.
      const idx = body.indexOf("With regards");
      const main = (idx >= 0 ? body.slice(0, idx) : body).trim();
      const bodyParas = main
        .split(/\n{2,}/)
        .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
        .filter(Boolean);
      await downloadMpladsLetter({
        refNo,
        dateStr: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        recipientName: "The District Magistrate, New Delhi District",
        recipientLines: ["Delhi Secretariat, IP Estate", "New Delhi – 110002"],
        subject: `MPLADS Recommendation — ${cluster.title}`,
        bodyParas,
        mpName: "Bansuri Swaraj",
        constituency: "New Delhi Lok Sabha",
        annexures: [
          `Evidence bundle (${cluster.submission_count} citizen signals)`,
          "Public-data cross-reference extracts",
          `Geo-tagged media (${cluster.ui.media?.length ?? 0})`,
        ],
      });
      toast.success("Letter PDF downloaded", { description: refNo });
    } catch {
      toast.error("Could not generate the PDF.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && closeComposer()}>
        <DialogContent className="flex max-h-[92vh] w-full max-w-[720px] flex-col gap-0 overflow-hidden border-line/60 bg-surface p-0">
          {isSent ? (
            /* ---- Success ceremony ---- */
            <div className="flex flex-col items-center px-8 py-12 text-center">
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <DialogTitle className="text-xl font-semibold tracking-tight text-ink">
                Letter dispatched
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-[400px] text-[13px] leading-relaxed text-muted-foreground">
                Digitally signed with your MP DSC and dispatched via the NIC secure channel to
                the District Magistrate, New Delhi District.
              </DialogDescription>
              <p className="mt-4 rounded-lg bg-chip px-4 py-2 font-mono text-[13px] text-ink">
                {refNo}
              </p>
              <div className="mt-7 flex items-center gap-2.5">
                <Button onClick={closeComposer} className="rounded-full px-6">
                  Done
                </Button>
                <Button variant="outline" className="rounded-full px-5" onClick={closeComposer}>
                  Track in queue
                </Button>
              </div>
            </div>
          ) : (
            /* ---- Draft state ---- */
            <>
              <DialogHeader className="border-b border-line/60 px-6 pb-4 pt-5 text-left">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Action composer · MPLADS recommendation
                </p>
                <DialogTitle className="text-lg font-semibold tracking-tight text-ink">
                  Draft MPLADS Recommendation Letter
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-body">
                  <span>
                    Cluster #{cluster.id.replace("cl_", "")} · {cluster.title}
                  </span>
                  <span className="text-line-dark">·</span>
                  <span>{cluster.ui.wardLabel}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                {/* Fields */}
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Recipient
                    </label>
                    <div className="rounded-lg border border-input bg-panel px-3 py-2 text-[12.5px] text-ink">
                      The District Magistrate, New Delhi District
                      <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
                        Delhi Secretariat, IP Estate, New Delhi – 110002
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Reference no.
                    </label>
                    <div className="rounded-lg border border-input bg-panel px-3 py-2 font-mono text-[12.5px] text-ink">
                      {refNo}
                    </div>
                  </div>
                </div>

                {/* Letter body — genuinely editable */}
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="letter-body"
                    className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    Letter body · AI-drafted, editable
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-link hover:underline">
                        <Globe className="h-3 w-3" />
                        {citations.length} sources cited
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72 p-3">
                      <p className="mb-2 text-[10.5px] uppercase tracking-wide text-faint">
                        Evidence cited in this draft
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {citations.map((c) => (
                          <li key={c} className="text-[12px] text-ink">
                            <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-primary align-middle" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>
                </div>
                <textarea
                  id="letter-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full resize-y rounded-lg border border-input bg-panel px-4 py-3 font-sans text-[12.5px] leading-relaxed text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                />

                {/* Annexures */}
                <div className="mt-4 rounded-lg border border-line/60 bg-chip/60 px-4 py-3">
                  <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Annexures · auto-attached
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {[
                      `Evidence bundle (${cluster.submission_count} signals)`,
                      "Public data extracts",
                      `Geo-tagged media (${cluster.ui.media?.length ?? 0})`,
                    ].map((a) => (
                      <label
                        key={a}
                        className="flex cursor-pointer items-center gap-1.5 text-[11.5px] text-ink"
                      >
                        <input type="checkbox" defaultChecked className="accent-[hsl(var(--primary-brand))]" />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 border-t border-line/60 bg-panel/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Signed with your MP DSC · dispatched via NIC secure channel
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="rounded-full" onClick={closeComposer}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={onDownloadPdf}
                    disabled={pdfBusy}
                  >
                    {pdfBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Download PDF
                  </Button>
                  <Button className="rounded-full" onClick={() => setConfirmOpen(true)}>
                    <Send className="h-3.5 w-3.5" />
                    Approve &amp; send
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispatch confirmation — the deliberate second step */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-line/60 bg-surface">
          <AlertDialogHeader>
            <AlertDialogTitle>Dispatch this letter?</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              <span className="block">
                <strong className="font-medium text-ink">To:</strong> The District Magistrate,
                New Delhi District
              </span>
              <span className="mt-1 block">
                <strong className="font-medium text-ink">Ref:</strong>{" "}
                <span className="font-mono text-[12px]">{refNo}</span>
              </span>
              <span className="mt-3 block">
                It will be digitally signed with your MP DSC and dispatched via the NIC secure
                channel. This is an official communication and cannot be recalled from Saarthi.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep editing</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={onApprove}>
              Approve &amp; dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
