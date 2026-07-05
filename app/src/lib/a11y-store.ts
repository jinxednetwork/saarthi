"use client";

import { create } from "zustand";

/**
 * Accessibility engine (UX4G-style toolbar). Settings apply as `data-a11y-*`
 * attributes + a `--a11y-zoom` var on <html>; globals.css turns those into the
 * actual overrides. Text size uses `zoom` on the shell (the codebase is px-heavy,
 * so rem-scaling wouldn't work) with a counter-zoom on the map so its geometry is
 * untouched. Persisted to localStorage and applied pre-hydration (layout script)
 * to avoid a flash. Independent of next-themes — high contrast layers over
 * whichever theme is active.
 */
export type Contrast = "normal" | "high";
export type Spacing = "normal" | "wide";
export type LineHeight = "normal" | "tall";

export interface A11ySettings {
  contrast: Contrast;
  /** Index into ZOOM_STEPS. */
  textScale: number;
  spacing: Spacing;
  lineHeight: LineHeight;
  hideImages: boolean;
  bigCursor: boolean;
}

export const ZOOM_STEPS = [1, 1.1, 1.25, 1.4] as const;

export const A11Y_STORAGE_KEY = "saarthi-a11y";

const DEFAULTS: A11ySettings = {
  contrast: "normal",
  textScale: 0,
  spacing: "normal",
  lineHeight: "normal",
  hideImages: false,
  bigCursor: false,
};

interface A11yState extends A11ySettings {
  hydrated: boolean;
  hydrate(): void;
  setContrast(c: Contrast): void;
  incTextScale(delta: number): void;
  setSpacing(s: Spacing): void;
  setLineHeight(l: LineHeight): void;
  toggleHideImages(): void;
  toggleBigCursor(): void;
  reset(): void;
  isDefault(): boolean;
}

/** Write the current settings to <html> and localStorage. */
export function applyA11y(s: A11ySettings) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.setAttribute("data-a11y-contrast", s.contrast);
  el.setAttribute("data-a11y-spacing", s.spacing);
  el.setAttribute("data-a11y-line", s.lineHeight);
  el.style.setProperty("--a11y-zoom", String(ZOOM_STEPS[s.textScale] ?? 1));
  if (s.hideImages) el.setAttribute("data-a11y-hide-images", "true");
  else el.removeAttribute("data-a11y-hide-images");
  if (s.bigCursor) el.setAttribute("data-a11y-cursor", "big");
  else el.removeAttribute("data-a11y-cursor");
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function pick(s: A11yState): A11ySettings {
  return {
    contrast: s.contrast,
    textScale: s.textScale,
    spacing: s.spacing,
    lineHeight: s.lineHeight,
    hideImages: s.hideImages,
    bigCursor: s.bigCursor,
  };
}

export const useA11yStore = create<A11yState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    let stored: Partial<A11ySettings> = {};
    try {
      const raw = localStorage.getItem(A11Y_STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as Partial<A11ySettings>;
    } catch {}
    const next = { ...DEFAULTS, ...stored };
    set({ ...next, hydrated: true });
    applyA11y(next);
  },
  setContrast: (contrast) => set(() => commit(get, { contrast })),
  incTextScale: (delta) =>
    set(() => {
      const textScale = Math.max(0, Math.min(ZOOM_STEPS.length - 1, get().textScale + delta));
      return commit(get, { textScale });
    }),
  setSpacing: (spacing) => set(() => commit(get, { spacing })),
  setLineHeight: (lineHeight) => set(() => commit(get, { lineHeight })),
  toggleHideImages: () => set(() => commit(get, { hideImages: !get().hideImages })),
  toggleBigCursor: () => set(() => commit(get, { bigCursor: !get().bigCursor })),
  reset: () => set(() => commit(get, DEFAULTS)),
  isDefault: () => {
    const s = get();
    return (
      s.contrast === "normal" &&
      s.textScale === 0 &&
      s.spacing === "normal" &&
      s.lineHeight === "normal" &&
      !s.hideImages &&
      !s.bigCursor
    );
  },
}));

function commit(get: () => A11yState, patch: Partial<A11ySettings>): Partial<A11yState> {
  const next = { ...pick(get()), ...patch };
  applyA11y(next);
  return next;
}
