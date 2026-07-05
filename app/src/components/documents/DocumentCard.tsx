"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  IndianRupee,
  ImageIcon,
  ExternalLink,
  Sparkles,
  Trash2,
} from "lucide-react";
import { type DocumentRecord, useDocumentsStore } from "@/lib/documents-store";
import { getOriginalUrl } from "@/lib/idb-docs";
import { cn } from "@/lib/utils";

/** One parsed document: extracted fields up top, passages + original on expand. */
export function DocumentCard({ doc }: { doc: DocumentRecord }) {
  const remove = useDocumentsStore((s) => s.removeDocument);
  const [open, setOpen] = useState(false);

  async function openOriginal() {
    const url = await getOriginalUrl(doc.id);
    if (url) window.open(url, "_blank", "noreferrer");
  }

  const Icon = doc.fileType === "image" ? ImageIcon : FileText;

  return (
    <article className="rounded-xl border border-line/60 bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chip text-muted-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-semibold text-ink">{doc.filename}</h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                <span>{doc.docType}</span>
                <span className="text-line-dark">·</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-px font-medium",
                    doc.mode === "gemini"
                      ? "bg-primary/10 text-primary"
                      : "bg-chip text-muted-foreground",
                  )}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  {doc.mode === "gemini" ? "Gemini" : "Demo parse"}
                </span>
              </p>
            </div>
            <button
              onClick={() => remove(doc.id)}
              aria-label={`Delete ${doc.filename}`}
              className="shrink-0 rounded-md p-1 text-faint hover:bg-chip hover:text-urgency-critical"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {doc.subject && (
            <p className="mt-2 text-[12px] font-medium text-body">Re: {doc.subject}</p>
          )}
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">{doc.summary}</p>

          {(doc.sender || doc.recipient) && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              {doc.sender}
              {doc.sender && doc.recipient ? " → " : ""}
              {doc.recipient}
            </p>
          )}

          {/* Amounts + dates */}
          {(doc.amounts.length > 0 || doc.dates.length > 0) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {doc.amounts.map((a, i) => (
                <span
                  key={`a${i}`}
                  className="inline-flex items-center gap-1 rounded-full border border-line/60 bg-chip/50 px-2 py-0.5 text-[11px] text-ink"
                >
                  <IndianRupee className="h-3 w-3 text-success" />
                  {a.value}
                  <span className="text-faint">· {a.label}</span>
                </span>
              ))}
              {doc.dates.map((d, i) => (
                <span
                  key={`d${i}`}
                  className="inline-flex items-center gap-1 rounded-full border border-line/60 bg-chip/50 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  <CalendarDays className="h-3 w-3" />
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* Entities */}
          {doc.entities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {doc.entities.map((e, i) => (
                <span
                  key={`e${i}`}
                  className="rounded-full bg-chip px-2 py-0.5 text-[10.5px] text-muted-foreground"
                  title={e.type}
                >
                  {e.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {open ? "Hide passages" : `${doc.chunks.length} passages`}
              <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            </button>
            <button
              onClick={openOriginal}
              className="inline-flex items-center gap-1 font-medium text-primary-link hover:underline"
            >
              Open original
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          {open && (
            <ol className="mt-3 flex flex-col gap-2 border-t border-line/60 pt-3">
              {doc.chunks.map((c, i) => (
                <li key={c.chunkId} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="num shrink-0 text-faint">{i + 1}.</span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </article>
  );
}
