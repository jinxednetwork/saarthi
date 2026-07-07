"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

// ponytail: no @types/dom-speech-recognition dep — minimal ambient shape for
// the handful of members actually used. Chrome/Edge only (no Firefox/Safari);
// transcribeAudio (lib/ai/media.ts) is the fallback upgrade path if broader
// browser support is ever needed.
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoiceState = "idle" | "listening" | "processing";

/**
 * Push-to-talk voice capture. `continuous: false` means the browser's own
 * silence detection ends the utterance — no custom timer needed.
 */
export function useVoiceInput(onFinal: (text: string) => void) {
  const { lang } = useI18n();
  const [state, setState] = useState<VoiceState>("idle");
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const supported = getRecognitionCtor() != null;

  useEffect(() => () => recRef.current?.stop(), []);

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const results = Array.from(e.results);
      const last = results[results.length - 1];
      if (!last) return;
      const text = last[0].transcript;
      if (last.isFinal) {
        setState("processing");
        setInterim("");
        onFinalRef.current(text.trim());
      } else {
        setInterim(text);
      }
    };
    rec.onerror = () => setState((s) => (s === "listening" ? "idle" : s));
    rec.onend = () => setState((s) => (s === "listening" ? "idle" : s));
    recRef.current = rec;
    setState("listening");
    setInterim("");
    rec.start();
  };

  const stop = () => {
    recRef.current?.stop();
    setState("idle");
  };

  const reset = () => setState("idle");

  return { supported, state, interim, start, stop, reset };
}
