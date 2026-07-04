"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Streaming feel for assistant answers: reveals the text in word chunks.
 * Instant under prefers-reduced-motion, and only ever animates once per
 * message (ref-guarded), so re-renders don't replay it.
 */
export function useStagedReveal(text: string, animate: boolean): string {
  const [shown, setShown] = useState(animate ? "" : text);
  const done = useRef(!animate);

  useEffect(() => {
    if (done.current) {
      setShown(text);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      done.current = true;
      setShown(text);
      return;
    }
    const words = text.split(/(\s+)/);
    let i = 0;
    setShown("");
    const timer = setInterval(() => {
      i = Math.min(i + 4, words.length);
      setShown(words.slice(0, i).join(""));
      if (i >= words.length) {
        done.current = true;
        clearInterval(timer);
      }
    }, 28);
    return () => clearInterval(timer);
  }, [text]);

  return shown;
}
