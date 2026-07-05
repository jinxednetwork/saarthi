import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "sonner";
import { A11yProvider } from "@/components/a11y/A11yProvider";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { PortalHeader } from "@/components/PortalHeader";
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

/**
 * Pre-hydration: apply the persisted language (dir) and accessibility settings
 * before first paint, so there's no flash. Mirrors the dashboard's boot script;
 * the saarthi-lang / saarthi-a11y keys are shared conventions.
 */
const bootScript = `(function(){try{var d=document.documentElement;
var RTL={ur:1,ks:1,sd:1};var l=localStorage.getItem('saarthi-lang')||'en';
d.lang=l;d.dir=RTL[l]?'rtl':'ltr';
var Z=[1,1.1,1.25,1.4];var a=JSON.parse(localStorage.getItem('saarthi-a11y')||'{}');
d.setAttribute('data-a11y-contrast',a.contrast||'normal');
d.setAttribute('data-a11y-spacing',a.spacing||'normal');
d.setAttribute('data-a11y-line',a.lineHeight||'normal');
d.style.setProperty('--a11y-zoom',String(Z[a.textScale||0]||1));
if(a.bigCursor)d.setAttribute('data-a11y-cursor','big');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${notoSans.variable} ${notoDevanagari.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="font-sans">
        <I18nProvider>
          <A11yProvider>
            <div className="min-h-screen bg-canvas">
              <PortalHeader />
              <main className="mx-auto max-w-[480px] px-4 pb-16 pt-5">{children}</main>
            </div>
          </A11yProvider>
        </I18nProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
