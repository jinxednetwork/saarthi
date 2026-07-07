import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, SUBMISSION_SOURCES } from "@saarthi/shared";
import type { Category, SubmissionSource } from "@saarthi/shared";

/**
 * Generate synthetic demo submissions (§11.2). This scaffold emits a small,
 * deterministic sample of the *raw intake* shape (pre-enrichment); the full
 * ~250-submission Gemini-authored set is a later step. Output → data/seed/submissions.json.
 *
 * Run: `pnpm seed:demo`
 */

interface SeedSubmission {
  id: string;
  source: SubmissionSource;
  text: string;
  language: "hi" | "en" | "hi-en";
  category: Category;
  constituency: string;
  ward: string;
  created_at_iso: string;
}

// Deterministic PRNG (mulberry32) — no Math.random, so output is reproducible.
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WARDS = ["chandrapur", "karol-bagh", "rk-puram", "sarojini"];
const TEMPLATES: Record<Category, string[]> = {
  water: ["Water supply cut for days in {ward}", "{ward} में पानी नहीं आ रहा"],
  air_quality: ["AQI severe in {ward}, heavy smog", "{ward} में प्रदूषण बहुत ज़्यादा"],
  infrastructure: ["Broken road and drainage in {ward}", "{ward} की सड़क खराब है"],
  health: ["PHC understaffed in {ward}", "{ward} में क्लिनिक में डॉक्टर नहीं"],
  other: ["General civic issue in {ward}"],
};

function generate(count: number): SeedSubmission[] {
  const rand = prng(42);
  const base = Date.parse("2026-06-03T00:00:00Z"); // fixed 30-day window before demo
  const out: SeedSubmission[] = [];
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)] ?? "water";
    const source = SUBMISSION_SOURCES[Math.floor(rand() * SUBMISSION_SOURCES.length)] ?? "whatsapp";
    const ward = WARDS[Math.floor(rand() * WARDS.length)] ?? "chandrapur";
    const tmpls = TEMPLATES[category];
    const tmpl = tmpls[Math.floor(rand() * tmpls.length)] ?? tmpls[0]!;
    const isHindi = /[ऀ-ॿ]/.test(tmpl);
    out.push({
      id: `sub_seed_${String(i).padStart(4, "0")}`,
      source,
      text: tmpl.replace("{ward}", ward),
      language: isHindi ? "hi" : "en",
      category,
      constituency: "new-delhi-ls",
      ward,
      created_at_iso: new Date(base + Math.floor(rand() * 30) * 86_400_000).toISOString(),
    });
  }
  return out;
}

const COUNT = Number(process.argv[2] ?? 25);
const submissions = generate(COUNT);

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, "../../data/seed/submissions.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(submissions, null, 2));

console.log(`Wrote ${submissions.length} demo submissions → ${outPath}`);
console.log("(Scaffold sample. Expand to ~250 via Gemini for the real demo — §11.2.)");
