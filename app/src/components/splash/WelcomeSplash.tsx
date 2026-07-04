"use client";

import { useEffect, useState } from "react";
import { DASHBOARD_META, MOCK_CONSTITUENCY } from "@/lib/mock-data";

const SEEN_KEY = "saarthi-splash-seen";

/**
 * Welcome splash — once per session, click or Esc to skip, skipped entirely
 * under prefers-reduced-motion. Never blocks input after dismissal.
 */
export function WelcomeSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sessionStorage.setItem(SEEN_KEY, "1");
        return;
      }
      sessionStorage.setItem(SEEN_KEY, "1");
      setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 2600);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShow(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  if (!show) return null;

  const bars = [
    { h: 28, c: "hsl(var(--primary-brand))", d: 0.05 },
    { h: 52, c: "hsl(var(--primary-brand))", d: 0.12 },
    { h: 40, c: "hsl(var(--primary-brand))", d: 0.19 },
    { h: 68, c: "hsl(var(--saffron))", d: 0.26 },
    { h: 34, c: "hsl(var(--primary-brand))", d: 0.33 },
  ];

  return (
    <div
      role="status"
      aria-label="Preparing your dashboard — click to skip"
      onClick={() => setShow(false)}
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-canvas"
      style={{ animation: "splashFadeOut 2.6s ease-out forwards" }}
    >
      <div className="max-w-[480px] p-10 text-center">
        <div className="mb-7 inline-flex h-[68px] items-end gap-1">
          {bars.map((b, i) => (
            <div
              key={i}
              className="w-2 rounded-[2px]"
              style={{
                height: b.h,
                background: b.c,
                transformOrigin: "bottom",
                animation: `splashBar 0.45s ease-out ${b.d}s both`,
              }}
            />
          ))}
        </div>
        <div
          className="mb-9 flex items-baseline justify-center gap-3.5"
          style={{ animation: "splashRise 0.5s ease-out 0.45s both" }}
        >
          <div className="text-[34px] font-semibold tracking-tight text-primary">Saarthi</div>
          <div className="hi text-[22px] text-faint">सारथि</div>
        </div>
        <div
          className="mb-2 text-[15px] text-muted-foreground"
          style={{ animation: "splashRise 0.5s ease-out 0.7s both" }}
        >
          Welcome,
        </div>
        <h1
          className="mb-2.5 text-[32px] font-semibold leading-tight tracking-tight text-ink"
          style={{ animation: "splashRise 0.5s ease-out 0.82s both" }}
        >
          Hon&rsquo;ble {MOCK_CONSTITUENCY.mp.name}
        </h1>
        <div
          className="mb-9 text-sm text-faint"
          style={{ animation: "splashRise 0.5s ease-out 0.94s both" }}
        >
          Member of Parliament · New Delhi Lok Sabha
        </div>
        <div
          className="mx-auto h-0.5 w-[200px] overflow-hidden rounded-full bg-line"
          style={{ animation: "splashRise 0.4s ease-out 1.05s both" }}
        >
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--primary-brand)), hsl(var(--saffron)))",
              transformOrigin: "left",
              animation: "splashProgress 1.2s ease-out 1.05s both",
            }}
          />
        </div>
        <div
          className="mt-3.5 text-[11.5px] tracking-wide text-faint"
          style={{ animation: "splashRise 0.4s ease-out 1.15s both" }}
        >
          Preparing your dashboard · {DASHBOARD_META.weekLabel} · click to skip
        </div>
      </div>
    </div>
  );
}
