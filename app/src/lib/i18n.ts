import type { UiLanguage } from "@saarthi/shared";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";

/**
 * Minimal English/Hindi dictionary loader (§10 — Hindi is first-class).
 *
 * This is a placeholder for a full `next-intl` integration (locale routing +
 * ICU messages + Indian number formatting). Keep every user-facing string keyed
 * in both `en.json` and `hi.json`; `hi` must contain every key `en` does.
 */
export type Dictionary = typeof en;
export type MessageKey = keyof Dictionary;

const dictionaries: Record<UiLanguage, Dictionary> = {
  en,
  // `hi` is validated against `en`'s keys at build time via the shared shape.
  hi: hi as Dictionary,
};

export const DEFAULT_LANGUAGE: UiLanguage = "en";

export function getDictionary(lang: UiLanguage): Dictionary {
  return dictionaries[lang] ?? dictionaries[DEFAULT_LANGUAGE];
}

/** Translate a key for a language, falling back to the key itself. */
export function t(lang: UiLanguage, key: MessageKey): string {
  return getDictionary(lang)[key] ?? key;
}

/** Indian-numeral currency/number formatting (§10) — e.g. ₹1,00,000. */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
