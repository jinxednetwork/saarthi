"use client";

import type { DailyBriefingProps } from "@/components/pdf/DailyBriefing";
import type { MpladsLetterProps } from "@/components/pdf/MpladsLetter";

/**
 * PDF generation is dynamic-imported on demand — @react-pdf/renderer is large,
 * so it and the document components load only when the MP actually generates a
 * file, never in the main bundle. Runs entirely client-side (no key needed).
 */
/**
 * The 14 built-in PDF fonts use WinAnsi (~Latin-1) and lack ₹, µ, superscripts,
 * en-dashes, curly quotes, etc. Rather than bundle a Unicode TTF, map the few
 * symbols that appear in this data to safe equivalents and drop anything else
 * outside Latin-1 — keeps the PDFs crisp with zero font downloads.
 */
function pdfSafe(s: string): string {
  return s
    .replace(/₹/g, "Rs ")
    .replace(/[µμ]/g, "u")
    .replace(/³/g, "3")
    .replace(/²/g, "2")
    .replace(/¹/g, "1")
    .replace(/×/g, "x")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "")
    .replace(/ {2,}/g, " ");
}

const clean = <T,>(v: T): T =>
  (typeof v === "string"
    ? pdfSafe(v)
    : Array.isArray(v)
      ? v.map(clean)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.entries(v).map(([k, val]) => [k, clean(val)]))
        : v) as T;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function downloadMpladsLetter(props: MpladsLetterProps) {
  const [{ pdf }, { MpladsLetter }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/MpladsLetter"),
  ]);
  const blob = await pdf(<MpladsLetter {...clean(props)} />).toBlob();
  triggerDownload(blob, `MPLADS-${props.refNo}.pdf`);
}

export async function downloadDailyBriefing(props: DailyBriefingProps) {
  const [{ pdf }, { DailyBriefing }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/DailyBriefing"),
  ]);
  const blob = await pdf(<DailyBriefing {...clean(props)} />).toBlob();
  triggerDownload(blob, `Saarthi-Daily-Briefing.pdf`);
}
