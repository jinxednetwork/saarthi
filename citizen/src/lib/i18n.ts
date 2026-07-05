import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import { DEFAULT_LANG } from "./languages";

/**
 * Portal i18n core. English is the source + fallback; Hindi is hand-translated;
 * other scheduled languages resolve through the picker but fall back to English
 * (labelled) until their dictionaries land. `t()` interpolates {var}.
 */
export type Dictionary = Record<string, string>;

const DICTIONARIES: Record<string, Dictionary> = { en, hi };

export function translate(
  lang: string,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANG]!;
  let value = dict[key] ?? (en as Dictionary)[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}
