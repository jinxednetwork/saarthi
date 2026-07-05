import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { A11yRoot } from "@/components/a11y/A11yRoot";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

/**
 * Pre-hydration script: apply the persisted language (dir) and accessibility
 * settings before first paint, mirroring next-themes so there's no flash of the
 * wrong direction/lang or unstyled a11y state.
 */
const bootScript = `(function(){try{var d=document.documentElement;
var RTL={ur:1,ks:1,sd:1};var l=localStorage.getItem('saarthi-lang')||'en';
d.lang=l;d.dir=RTL[l]?'rtl':'ltr';
var Z=[1,1.1,1.25,1.4];var a=JSON.parse(localStorage.getItem('saarthi-a11y')||'{}');
d.setAttribute('data-a11y-contrast',a.contrast||'normal');
d.setAttribute('data-a11y-spacing',a.spacing||'normal');
d.setAttribute('data-a11y-line',a.lineHeight||'normal');
d.style.setProperty('--a11y-zoom',String(Z[a.textScale||0]||1));
if(a.hideImages)d.setAttribute('data-a11y-hide-images','true');
if(a.bigCursor)d.setAttribute('data-a11y-cursor','big');
}catch(e){}})();`;

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

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saarthi — Executive intelligence for MPs",
  description:
    "AI-powered executive intelligence platform for India's Members of Parliament.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${notoSans.variable} ${notoDevanagari.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <A11yRoot />
            {children}
            <Toaster position="top-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
