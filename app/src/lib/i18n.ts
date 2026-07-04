import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import { DEFAULT_LANG, langMeta } from "./languages";

/**
 * i18n core (§10 — Hindi first-class). English is the source of truth and the
 * fallback; Hindi is hand-translated. Other scheduled languages resolve through
 * the picker but fall back to English (labelled) until their dictionaries land.
 * Keys are flat + dot-namespaced. `t()` interpolates {var} placeholders.
 */
export type Dictionary = Record<string, string>;
export type MessageKey = keyof typeof en;

const DICTIONARIES: Record<string, Dictionary> = {
  en,
  hi,
};

export { DEFAULT_LANG } from "./languages";

/** Resolve the dictionary for a language, falling back to English. */
export function getDictionary(lang: string): Dictionary {
  return DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANG]!;
}

/**
 * Translate a key. Resolution order: active dict → English → the key itself
 * (so a missing key is visible in dev, never a blank). Supports {name} vars.
 */
export function translate(
  lang: string,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = getDictionary(lang);
  let value = dict[key] ?? (en as Dictionary)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}

/** Text direction for a language (rtl for Urdu/Kashmiri/Sindhi). */
export function langDir(lang: string): "ltr" | "rtl" {
  return langMeta(lang).dir;
}

/* ---- locale-aware formatting (Indian conventions) ---- */

const localeFor = (lang: string) => (lang === "hi" ? "hi-IN" : "en-IN");

export function formatINR(amount: number, lang = DEFAULT_LANG): string {
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNum(n: number, lang = DEFAULT_LANG): string {
  return new Intl.NumberFormat(localeFor(lang)).format(n);
}

export function formatDate(d: Date, lang = DEFAULT_LANG): string {
  return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: "medium" }).format(d);
}
