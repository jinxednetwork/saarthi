"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_LANG, langDir, translate } from "@/lib/i18n";
import { LANG_CODES, langMeta } from "@/lib/languages";

const STORAGE_KEY = "saarthi-lang";

interface I18nContextValue {
  lang: string;
  dir: "ltr" | "rtl";
  /** True when the active language has a dictionary (hand-verified or machine). */
  translated: boolean;
  /** True when the active dictionary is machine-translated (not hand-verified). */
  machine: boolean;
  setLang: (lang: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Language context. The initial `<html lang dir>` is set pre-hydration by an
 * inline script in the root layout (no flash); this provider keeps React in
 * sync and re-applies on change. Choice persists to localStorage.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  // Adopt the pre-hydration choice once mounted.
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
    <I18nContext.Provider
      value={{
        lang,
        dir: langDir(lang),
        translated: langMeta(lang).translated,
        machine: langMeta(lang).machine ?? false,
        setLang,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
