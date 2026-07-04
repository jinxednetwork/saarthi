import type { Metadata } from "next";
import { BrandBars } from "@/components/icons";

export const metadata: Metadata = {
  title: "Report an issue — Saarthi",
  description: "File a civic grievance with your MP's office. The web fallback for WhatsApp.",
};

/**
 * Citizen portal shell — a self-contained mobile-first surface, deliberately
 * NOT the MP command deck. One narrow column, big tap targets, minimal chrome.
 */
export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[480px] items-center gap-2.5 px-4">
          <BrandBars />
          <span className="flex items-baseline gap-1.5 leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-ink">Saarthi</span>
            <span className="hi text-[11px] text-faint">सारथि</span>
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground">New Delhi · MP office</span>
        </div>
      </header>
      <main className="mx-auto max-w-[480px] px-4 pb-16 pt-5">{children}</main>
    </div>
  );
}
