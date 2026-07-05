"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { type DocFileType, type DocumentRecord, useDocumentsStore } from "@/lib/documents-store";
import { putOriginal } from "@/lib/idb-docs";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,image/*,.txt";

function fileTypeOf(mime: string): DocFileType {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "txt";
}

/**
 * Upload or scan a letter → POST to /api/documents/parse → store the parsed
 * record (+ chunks) and stash the original bytes in IndexedDB. The freshest
 * document lands at the top of the library.
 */
export function DocumentUploader() {
  const addDocument = useDocumentsStore((s) => s.addDocument);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (busy) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/documents/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error ?? "Could not parse the document.");
        return;
      }
      const id = `doc_${Date.now().toString(36)}`;
      await putOriginal(id, file);
      const rec: DocumentRecord = {
        id,
        filename: file.name || "document",
        fileType: fileTypeOf(file.type),
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        docType: data.parsed.docType,
        summary: data.parsed.summary,
        sender: data.parsed.sender,
        recipient: data.parsed.recipient,
        subject: data.parsed.subject,
        dates: data.parsed.dates ?? [],
        amounts: data.parsed.amounts ?? [],
        entities: data.parsed.entities ?? [],
        chunks: data.chunks ?? [],
        mode: data.mode,
      };
      addDocument(rec);
      toast.success(data.mode === "gemini" ? "Parsed with Gemini." : "Parsed (demo mode).");
    } catch {
      toast.error("Could not reach the parser. Please try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-line-dark bg-surface",
      )}
    >
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ScanLine className="h-6 w-6" />}
      </span>
      <p className="text-[14px] font-medium text-ink">
        {busy ? "Reading the document…" : "Scan or upload a letter"}
      </p>
      <p className="mt-1 max-w-[380px] text-[12px] leading-relaxed text-muted-foreground">
        PDF, photo, or text. The AI extracts the summary, key entities, dates and ₹ figures, and makes
        it queryable by the Assistant.
      </p>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        <FileUp className="h-4 w-4" />
        Choose a file
      </button>
    </div>
  );
}
