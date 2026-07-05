"use client";

import { useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { useDocumentsStore } from "@/lib/documents-store";
import { DocumentCard } from "./DocumentCard";
import { DocumentUploader } from "./DocumentUploader";

/**
 * Documents library — upload/scan at the top, parsed records below (newest
 * first). Every record's chunks feed the Assistant's RAG, so the MP can ask
 * questions over their own correspondence.
 */
export function DocumentsView() {
  const { documents, hydrate } = useDocumentsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const newestFirst = [...documents].reverse();

  return (
    <div className="flex flex-col gap-5">
      <DocumentUploader />

      {newestFirst.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
          <FolderOpen className="mb-3 h-7 w-7 text-faint" />
          <p className="text-[13px] font-medium text-ink">No documents yet</p>
          <p className="mt-1 max-w-[360px] text-[12px] text-muted-foreground">
            Scan a letter or upload a report to keep a searchable copy and let the Assistant answer
            questions about it.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-ink">
              Library
              <span className="ml-1.5 text-[12px] font-normal text-faint">
                {documents.length} {documents.length === 1 ? "document" : "documents"}
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {newestFirst.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
