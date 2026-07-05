import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Report an issue — Saarthi",
  description: "File a civic grievance with your MP's office.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoDevanagari.variable}`}>
      <body className="font-sans">
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
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

function BrandBars() {
  return (
    <span className="flex h-7 w-7 items-end gap-[2px]" aria-hidden>
      {[10, 16, 12, 20].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px]"
          style={{
            height: h,
            background: i === 3 ? "hsl(var(--saffron))" : "hsl(var(--primary-brand))",
          }}
        />
      ))}
    </span>
  );
}
