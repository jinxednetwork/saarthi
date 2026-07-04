"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** next-themes wrapper: class-based dual theme, dark default (demo hero). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
