"use client";

import { CitationsIcon, CloseIcon, LockIcon, SendIcon } from "@/components/icons";
import { useDashboardStore } from "@/lib/dashboard-store";
import { MOCK_CLUSTERS } from "@/lib/mock-data";

/**
 * Action Composer modal (design): AI-drafted MPLADS recommendation letter with
 * cited evidence highlights, auto-attached annexures, approve & send flow.
 * Letter copy is the design's demo draft; Phase 5 swaps in Gemini-drafted
 * bodies via /api/briefs (§8.7) with real citations (§14).
 */
export function ActionComposer() {
  const { composerClusterId, closeComposer, sendLetter } = useDashboardStore();
  if (!composerClusterId) return null;

  const cluster = MOCK_CLUSTERS.find((c) => c.id === composerClusterId);
  if (!cluster) return null;

  const num = cluster.id.replace("cl_", "");

  return (
    <div
      onClick={closeComposer}
      className="fixed inset-0 z-[9999] flex animate-fadeIn items-center justify-center bg-[rgba(11,36,71,0.55)] px-5 py-10"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-lg bg-surface shadow-[0_24px_64px_rgba(11,36,71,0.35)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line-warm px-7 pb-[18px] pt-5">
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Action composer · MPLADS recommendation
            </div>
            <div className="text-xl font-bold tracking-tight text-ink">
              Draft MPLADS Recommendation Letter
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-body">
              <span>
                Cluster #{num} · {cluster.title}
              </span>
              <span className="text-line-dark">·</span>
              <span>{cluster.ui.wardLabel}</span>
              <span className="text-line-dark">·</span>
              <span className="inline-flex items-center rounded-[3px] bg-[#FCE8E1] px-1.5 py-px text-[10px] font-bold tracking-wide text-urgency-critical">
                {cluster.urgency.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={closeComposer}
            className="cursor-pointer border-0 bg-transparent p-1 text-muted-foreground hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-[22px]">
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Recipient
              </label>
              <div className="rounded border border-line-warm bg-panel px-3 py-2.5 text-[13px] text-ink">
                The District Magistrate, New Delhi District
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Delhi Secretariat, IP Estate, New Delhi – 110002
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Reference no.
              </label>
              <div className="rounded border border-line-warm bg-panel px-3 py-2.5 font-mono text-[13px] text-ink">
                MP-NDL-MPLADS-2026-W44-0{num}
              </div>
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Subject
              </label>
              <div className="rounded border border-line-warm bg-panel px-3 py-2.5 text-[13px] text-ink">
                Recommendation for emergency drain de-silting works — Karol Bagh &amp; Rajinder
                Nagar arterial road stretches (MPLADS eligible)
              </div>
            </div>
          </div>

          {/* Letter body */}
          <div>
            <label className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Letter body · AI-drafted, editable</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium normal-case tracking-normal text-primary-link">
                <CitationsIcon />
                12 sources cited
              </span>
            </label>
            <div className="max-h-[260px] overflow-y-auto rounded border border-line-warm bg-panel px-5 py-[18px] text-[13px] leading-[1.7] text-ink">
              <p className="mb-3">Respected Sir/Madam,</p>
              <p className="mb-3">
                I am writing to bring to your attention a matter requiring urgent intervention in
                the Karol Bagh and Rajinder Nagar assembly segments of the New Delhi Lok Sabha
                Constituency. Over the past week, my office has received{" "}
                <mark className="bg-highlight px-[3px]">71 verified citizen signals</mark>{" "}
                concerning severe waterlogging on the arterial road network, representing a{" "}
                <mark className="bg-highlight px-[3px]">340% week-on-week increase</mark> in
                complaint volume.
              </p>
              <p className="mb-3">
                Cross-referencing with DUSIB&rsquo;s public drain-maintenance register indicates
                that <mark className="bg-highlight px-[3px]">Drain #4 (Karol Bagh main)</mark> was
                last de-silted in September 2025, and the IMD forecast projects an additional 24mm
                of rainfall in the next 48 hours. This confluence of factors poses a significant
                public safety risk.
              </p>
              <p className="mb-3">
                Under the MPLADS guidelines (as revised 2023), works pertaining to drainage and
                de-silting of public arterial roads are permissible under the &ldquo;Urban
                Development&rdquo; category. I hereby{" "}
                <strong>recommend the sanction of ₹28.5 Lakh</strong> from my constituency
                development fund for emergency de-silting of the affected drain network, to be
                executed via the designated District Authority within a stipulated period of 14
                days.
              </p>
              <p className="mb-3">
                Detailed geo-tagged evidence, citizen signal metadata, and cross-referenced public
                dataset extracts are enclosed with this recommendation as Annexure A.
              </p>
              <p>
                I request your kind offices to expedite the sanction and issuance of the work order
                at the earliest.
              </p>
              <p className="mt-3 text-body">
                With regards,
                <br />
                Bansuri Swaraj
                <br />
                Member of Parliament, New Delhi Lok Sabha
              </p>
            </div>
          </div>

          {/* Annexures */}
          <div className="mt-5 rounded border border-line-warm bg-chip px-4 py-3.5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Annexures · auto-attached
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: "Evidence bundle (71 signals)", checked: true },
                { label: "Public data extracts (DUSIB, IMD, CPWD)", checked: true },
                { label: "Geo-tagged photo evidence (12)", checked: true },
                { label: "MPLADS compliance memo", checked: false },
              ].map((a) => (
                <label
                  key={a.label}
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-ink"
                >
                  <input type="checkbox" defaultChecked={a.checked} className="accent-primary" />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line-warm bg-panel px-7 py-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <LockIcon />
            Digitally signed with your MP DSC · dispatched via NIC secure channel
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={closeComposer}
              className="cursor-pointer rounded border border-line-warm bg-transparent px-3.5 py-2 text-[13px] font-medium text-body hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button className="cursor-pointer rounded border border-primary bg-transparent px-3.5 py-2 text-[13px] font-medium text-primary hover:bg-chip">
              Preview on letterhead
            </button>
            <button className="cursor-pointer rounded border border-primary bg-transparent px-3.5 py-2 text-[13px] font-medium text-primary hover:bg-chip">
              Save draft
            </button>
            <button
              onClick={sendLetter}
              className="flex cursor-pointer items-center gap-1.5 rounded border-0 bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-hover"
            >
              <SendIcon />
              Approve &amp; send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
