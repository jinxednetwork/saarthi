"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translate } from "@/lib/i18n";
import { DEFAULT_LANG, LANG_CODES, langDir, langMeta } from "@/lib/languages";

const STORAGE_KEY = "saarthi-lang";

interface I18nContextValue {
  lang: string;
  dir: "ltr" | "rtl";
  translated: boolean;
  setLang: (lang: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nContextValue | null>(null);

/** Language context — shared saarthi-lang key with the dashboard. */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LANG_CODES.includes(stored)) setLangState(stored);
    } catch {}
  }, []);

  const setLang = useCallback((next: string) => {
    if (!LANG_CODES.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    document.documentElement.lang = next;
    document.documentElement.dir = langDir(next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  return (
    <Ctx.Provider value={{ lang, dir: langDir(lang), translated: langMeta(lang).translated, setLang, t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
