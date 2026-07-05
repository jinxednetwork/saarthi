"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  A11Y_DEFAULTS,
  ZOOM_STEPS,
  applyA11y,
  isA11yDefault,
  loadA11y,
  type A11ySettings,
  type Contrast,
  type LineHeight,
  type Spacing,
} from "@/lib/a11y";

interface A11yContextValue extends A11ySettings {
  setContrast(c: Contrast): void;
  incTextScale(delta: number): void;
  setSpacing(s: Spacing): void;
  setLineHeight(l: LineHeight): void;
  toggleBigCursor(): void;
  reset(): void;
  isDefault: boolean;
}

const Ctx = createContext<A11yContextValue | null>(null);

/** Adopts the persisted a11y settings on mount and re-applies on change. */
export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(A11Y_DEFAULTS);

  useEffect(() => {
    setSettings(loadA11y());
  }, []);

  const update = useCallback((patch: Partial<A11ySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      applyA11y(next);
      return next;
    });
  }, []);

  const value = useMemo<A11yContextValue>(
    () => ({
      ...settings,
      isDefault: isA11yDefault(settings),
      setContrast: (contrast) => update({ contrast }),
      incTextScale: (delta) =>
        update({
          textScale: Math.max(0, Math.min(ZOOM_STEPS.length - 1, settings.textScale + delta)),
        }),
      setSpacing: (spacing) => update({ spacing }),
      setLineHeight: (lineHeight) => update({ lineHeight }),
      toggleBigCursor: () => update({ bigCursor: !settings.bigCursor }),
      reset: () => update(A11Y_DEFAULTS),
    }),
    [settings, update],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useA11y(): A11yContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useA11y must be used within A11yProvider");
  return ctx;
}
