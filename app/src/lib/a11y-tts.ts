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

function readableText(): string {
  const sel = window.getSelection()?.toString().trim();
  if (sel) return sel;
  const main = document.querySelector("main");
  const text = (main?.textContent ?? document.body.textContent ?? "").replace(/\s+/g, " ").trim();
  // Cap length so a whole dashboard doesn't queue minutes of speech.
  return text.slice(0, 3000);
}

/** Speak the selection or main region; returns false if unsupported/empty. */
export function speakPage(onEnd?: () => void): boolean {
  if (!ttsSupported()) return false;
  window.speechSynthesis.cancel();
  const text = readableText();
  if (!text) return false;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = document.documentElement.lang === "hi" ? "hi-IN" : "en-IN";
  utter.rate = 1;
  if (onEnd) {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  window.speechSynthesis.speak(utter);
  return true;
}
