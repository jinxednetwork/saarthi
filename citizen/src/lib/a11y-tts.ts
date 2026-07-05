/** Read-aloud over the Web Speech API (browser-capability dependent). */
export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopTts() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export function speakPage(onEnd?: () => void): boolean {
  if (!ttsSupported()) return false;
  window.speechSynthesis.cancel();
  const sel = window.getSelection()?.toString().trim();
  const main = document.querySelector("main");
  const text = (sel || main?.textContent || document.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);
  if (!text) return false;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = document.documentElement.lang === "hi" ? "hi-IN" : "en-IN";
  if (onEnd) {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  window.speechSynthesis.speak(utter);
  return true;
}
