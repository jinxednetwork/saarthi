/**
 * The 22 scheduled languages of India (Eighth Schedule) — the intake + UI
 * language set (§2). English + Hindi ship fully translated; the rest select
 * cleanly and fall back to English (with a labelled notice) until their
 * dictionaries are filled in. `dir` drives RTL for Urdu / Kashmiri / Sindhi.
 */
export interface LanguageMeta {
  code: string;
  /** Name in the language's own script (shown primary in the picker). */
  endonym: string;
  /** English name (shown as the secondary label). */
  english: string;
  dir: "ltr" | "rtl";
  /** True once the dictionary is hand-verified; false → falls back to English. */
  translated: boolean;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", endonym: "English", english: "English", dir: "ltr", translated: true },
  { code: "hi", endonym: "हिन्दी", english: "Hindi", dir: "ltr", translated: true },
  { code: "bn", endonym: "বাংলা", english: "Bengali", dir: "ltr", translated: false },
  { code: "mr", endonym: "मराठी", english: "Marathi", dir: "ltr", translated: false },
  { code: "te", endonym: "తెలుగు", english: "Telugu", dir: "ltr", translated: false },
  { code: "ta", endonym: "தமிழ்", english: "Tamil", dir: "ltr", translated: false },
  { code: "gu", endonym: "ગુજરાતી", english: "Gujarati", dir: "ltr", translated: false },
  { code: "ur", endonym: "اردو", english: "Urdu", dir: "rtl", translated: false },
  { code: "kn", endonym: "ಕನ್ನಡ", english: "Kannada", dir: "ltr", translated: false },
  { code: "or", endonym: "ଓଡ଼ିଆ", english: "Odia", dir: "ltr", translated: false },
  { code: "ml", endonym: "മലയാളം", english: "Malayalam", dir: "ltr", translated: false },
  { code: "pa", endonym: "ਪੰਜਾਬੀ", english: "Punjabi", dir: "ltr", translated: false },
  { code: "as", endonym: "অসমীয়া", english: "Assamese", dir: "ltr", translated: false },
  { code: "mai", endonym: "मैथिली", english: "Maithili", dir: "ltr", translated: false },
  { code: "sat", endonym: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali", dir: "ltr", translated: false },
  { code: "ks", endonym: "کٲشُر", english: "Kashmiri", dir: "rtl", translated: false },
  { code: "ne", endonym: "नेपाली", english: "Nepali", dir: "ltr", translated: false },
  { code: "kok", endonym: "कोंकणी", english: "Konkani", dir: "ltr", translated: false },
  { code: "sd", endonym: "سنڌي", english: "Sindhi", dir: "rtl", translated: false },
  { code: "doi", endonym: "डोगरी", english: "Dogri", dir: "ltr", translated: false },
  { code: "mni", endonym: "ꯃꯤꯇꯩꯂꯣꯟ", english: "Manipuri", dir: "ltr", translated: false },
  { code: "brx", endonym: "बड़ो", english: "Bodo", dir: "ltr", translated: false },
  { code: "sa", endonym: "संस्कृतम्", english: "Sanskrit", dir: "ltr", translated: false },
];

export const LANG_CODES = LANGUAGES.map((l) => l.code);
export type LangCode = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LANG = "en";

export function langMeta(code: string): LanguageMeta {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!;
}
