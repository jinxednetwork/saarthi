"use client";

import { useEffect, useRef } from "react";

/** Scroll-linked ombre: fixed warm gradient that deepens as the user scrolls. */
export function ScrollShade() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const t = Math.min(y / 900, 1);
      if (ref.current) ref.current.style.opacity = t.toFixed(3);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-300"
      style={{
        background:
          "radial-gradient(ellipse 80% 45% at 50% 100%, rgba(193, 90, 21, 0.08), transparent 65%), linear-gradient(180deg, transparent 25%, rgba(133, 96, 54, 0.12) 100%)",
      }}
    />
  );
}
