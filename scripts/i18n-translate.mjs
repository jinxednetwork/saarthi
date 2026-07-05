// Machine-translate the English UI dictionaries into the scheduled languages via
// Gemini. Run once (with GOOGLE_GENERATIVE_AI_API_KEY set); output is committed
// and clearly labelled "machine-assisted" — English + Hindi stay hand-verified.
//
//   node scripts/i18n-translate.mjs            # all target languages
//   node scripts/i18n-translate.mjs bn ta mr   # only these
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "..");

const KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!KEY) {
  console.error("Set GOOGLE_GENERATIVE_AI_API_KEY (e.g. source app/.env.local).");
  process.exit(1);
}

const LANGS = [
  ["bn", "Bengali", "বাংলা"], ["mr", "Marathi", "मराठी"], ["te", "Telugu", "తెలుగు"],
  ["ta", "Tamil", "தமிழ்"], ["gu", "Gujarati", "ગુજરાતી"], ["ur", "Urdu", "اردو"],
  ["kn", "Kannada", "ಕನ್ನಡ"], ["or", "Odia", "ଓଡ଼ିଆ"], ["ml", "Malayalam", "മലയാളം"],
  ["pa", "Punjabi", "ਪੰਜਾਬੀ"], ["as", "Assamese", "অসমীয়া"], ["mai", "Maithili", "मैथिली"],
  ["sat", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ"], ["ks", "Kashmiri", "کٲشُر"], ["ne", "Nepali", "नेपाली"],
  ["kok", "Konkani", "कोंकणी"], ["sd", "Sindhi", "سنڌي"], ["doi", "Dogri", "डोगरी"],
  ["mni", "Manipuri", "ꯃꯤꯇꯩꯂꯣꯟ"], ["brx", "Bodo", "बड़ो"], ["sa", "Sanskrit", "संस्कृतम्"],
];

const TARGETS = [
  resolve(ROOT, "app/src/locales"),
  resolve(ROOT, "citizen/src/locales"),
];

const filter = process.argv.slice(2);
const langs = filter.length ? LANGS.filter(([c]) => filter.includes(c)) : LANGS;

async function translate(enJson, english, endonym) {
  const prompt =
    `Translate ONLY the string VALUES of this JSON UI dictionary into ${english} (${endonym}), ` +
    `an Indian scheduled language, for a government civic app used by Members of Parliament and citizens. ` +
    `Rules: keep every KEY exactly unchanged; keep {placeholder} tokens and emoji unchanged; keep ` +
    `"Saarthi", "MPLADS", "OTP", "AI", "WhatsApp", "Gemini", "Reddit", "X", and ward/place names as-is; ` +
    `natural, respectful register. Return ONLY the translated JSON object, same shape.\n\n` +
    JSON.stringify(enJson, null, 0);

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    },
  );
  if (!res.ok) throw new Error(`${english}: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

for (const dir of TARGETS) {
  const en = JSON.parse(await readFile(resolve(dir, "en.json"), "utf8"));
  const keys = Object.keys(en);
  for (const [code, english, endonym] of langs) {
    try {
      const out = await translate(en, english, endonym);
      // Guarantee every key exists; fall back to English for any the model dropped.
      const filled = Object.fromEntries(keys.map((k) => [k, out[k] ?? en[k]]));
      await writeFile(resolve(dir, `${code}.json`), JSON.stringify(filled, null, 2) + "\n");
      const missing = keys.filter((k) => out[k] == null).length;
      console.log(`✓ ${dir.split("/").slice(-3, -2)}/${code} (${english})${missing ? ` — ${missing} keys fell back` : ""}`);
    } catch (err) {
      console.error(`✗ ${code} (${english}): ${err.message}`);
    }
  }
}
console.log("done.");
