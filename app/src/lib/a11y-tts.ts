"use client";

/**
 * Lightweight text-to-speech over the Web Speech API. Reads the current
 * selection if there is one, else the page's <main> region. Browser-capability
 * dependent (degrades to a no-op with a signal when unsupported).
 */
export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function ttsSpeaking(): boolean {
  return ttsSupported() && window.speechSynthesis.speaking;
}

export function stopTts() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/**
 * Pick the best-sounding voice for a UI language. Chrome ships online neural
 * voices named "Google …" that sound far better than the OS default; prefer
 * those for the target BCP-47 tag, then any voice whose lang matches, else null
 * (browser default). Voices load async, so we re-read them lazily and on the
 * one-time `onvoiceschanged` event. ponytail: zero-dep — the Cloud TTS upgrade
 * path (a /api/tts route) is the next rung only if browser voices fall short.
 */
let voiceCache: SpeechSynthesisVoice[] | null = null;
function loadVoices() {
  if (!ttsSupported()) return;
  voiceCache = window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged === null) {
    window.speechSynthesis.onvoiceschanged = () => {
      voiceCache = window.speechSynthesis.getVoices();
    };
  }
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (!voiceCache || voiceCache.length === 0) loadVoices();
  const voices = voiceCache ?? [];
  const tag = lang === "hi" ? "hi-IN" : "en-IN";
  const prefix = tag.slice(0, 2); // "hi" | "en"
  const langMatch = (v: SpeechSynthesisVoice) =>
    v.lang === tag || v.lang.toLowerCase().startsWith(prefix);
  return (
    voices.find((v) => langMatch(v) && /google/i.test(v.name)) ??
    voices.find((v) => langMatch(v) && /natural|neural/i.test(v.name)) ??
    voices.find(langMatch) ??
    null
  );
}

function readableText(): string {
  const sel = window.getSelection()?.toString().trim();
  if (sel) return sel;
  const main = document.querySelector("main");
  const text = (main?.textContent ?? document.body.textContent ?? "").replace(/\s+/g, " ").trim();
  // Cap length so a whole dashboard doesn't queue minutes of speech.
  return text.slice(0, 3000);
}

/** Speak arbitrary text in the given UI language; returns false if unsupported/empty. */
export function speak(text: string, lang: string, onEnd?: () => void): boolean {
  if (!ttsSupported() || !text) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "hi" ? "hi-IN" : "en-IN";
  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;
  // Calmer, senior-aide delivery than the default staccato.
  utter.rate = 0.98;
  utter.pitch = 0.95;
  if (onEnd) {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  window.speechSynthesis.speak(utter);
  return true;
}

/** Speak the selection or main region; returns false if unsupported/empty. */
export function speakPage(onEnd?: () => void): boolean {
  if (!ttsSupported()) return false;
  return speak(readableText(), document.documentElement.lang, onEnd);
}
