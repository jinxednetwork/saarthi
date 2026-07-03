"use client";

import { useEffect, useState } from "react";
import { DASHBOARD_META, MOCK_CONSTITUENCY } from "@/lib/mock-data";

/**
 * Welcome splash (design: 3.2s fade-out, staggered brand bars, MP name rise).
 * Unmounts itself after the fade completes.
 */
export function WelcomeSplash() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 3300);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  const bars = [
    { h: 28, c: "#12325B", d: 0.05 },
    { h: 52, c: "#12325B", d: 0.15 },
    { h: 40, c: "#12325B", d: 0.25 },
    { h: 68, c: "#C15A15", d: 0.35 },
    { h: 34, c: "#12325B", d: 0.45 },
  ];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #F1EBDD 0%, #EDE5D0 100%)",
        animation: "splashFadeOut 3.2s ease-out forwards",
      }}
    >
      <div className="max-w-[480px] p-10 text-center">
        <div className="mb-8 inline-flex h-[68px] items-end gap-1">
          {bars.map((b, i) => (
            <div
              key={i}
              className="w-2 rounded-[2px]"
              style={{
                height: b.h,
                background: b.c,
                transformOrigin: "bottom",
                animation: `splashBar 0.5s ease-out ${b.d}s both`,
              }}
            />
          ))}
        </div>
        <div
          className="mb-11 flex items-baseline justify-center gap-3.5"
          style={{ animation: "splashRise 0.6s ease-out 0.6s both" }}
        >
          <div className="text-[34px] font-semibold tracking-tight text-primary">Saarthi</div>
          <div className="hi text-[22px] text-faint">सारथि</div>
        </div>
        <div
          className="mb-2 text-[15px] text-muted"
          style={{ animation: "splashRise 0.6s ease-out 0.95s both" }}
        >
          Welcome,
        </div>
        <h1
          className="mb-2.5 text-[32px] font-semibold leading-tight tracking-tight text-ink"
          style={{ animation: "splashRise 0.6s ease-out 1.1s both" }}
        >
          Hon&rsquo;ble {MOCK_CONSTITUENCY.mp.name}
        </h1>
        <div
          className="mb-11 text-sm text-faint"
          style={{ animation: "splashRise 0.6s ease-out 1.25s both" }}
        >
          Member of Parliament · New Delhi Lok Sabha
        </div>
        <div
          className="mx-auto h-0.5 w-[200px] overflow-hidden rounded-full bg-[#E6DFC9]"
          style={{ animation: "splashRise 0.5s ease-out 1.4s both" }}
        >
          <div
            className="h-full w-full"
            style={{
              background: "linear-gradient(90deg, #12325B, #C15A15)",
              transformOrigin: "left",
              animation: "splashProgress 1.6s ease-out 1.4s both",
            }}
          />
        </div>
        <div
          className="mt-3.5 text-[11.5px] tracking-wide text-faint"
          style={{ animation: "splashRise 0.5s ease-out 1.55s both" }}
        >
          Preparing your dashboard · {DASHBOARD_META.weekLabel}
        </div>
      </div>
    </div>
  );
}
