import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

/**
 * Pre-hydration script: apply the persisted language (dir) before first paint,
 * mirroring next-themes so there's no flash of the wrong direction/lang.
 */
const langScript = `(function(){try{var RTL={ur:1,ks:1,sd:1};var l=localStorage.getItem('saarthi-lang')||'en';document.documentElement.lang=l;document.documentElement.dir=RTL[l]?'rtl':'ltr';}catch(e){}})();`;

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
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster position="top-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
