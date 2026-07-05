/**
 * Accessibility engine for the portal (UX4G-style). Settings apply as
 * `data-a11y-*` attributes + a `--a11y-zoom` var on <html>; globals.css turns
 * those into the overrides. Light-mode only (public portal). Persisted +
 * applied pre-hydration (layout boot script) to avoid a flash.
 */
export type Contrast = "normal" | "high";
export type Spacing = "normal" | "wide";
export type LineHeight = "normal" | "tall";

export interface A11ySettings {
  contrast: Contrast;
  textScale: number;
  spacing: Spacing;
  lineHeight: LineHeight;
  bigCursor: boolean;
}

export const ZOOM_STEPS = [1, 1.1, 1.25, 1.4] as const;
export const A11Y_STORAGE_KEY = "saarthi-a11y";

export const A11Y_DEFAULTS: A11ySettings = {
  contrast: "normal",
  textScale: 0,
  spacing: "normal",
  lineHeight: "normal",
  bigCursor: false,
};

export function applyA11y(s: A11ySettings) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.setAttribute("data-a11y-contrast", s.contrast);
  el.setAttribute("data-a11y-spacing", s.spacing);
  el.setAttribute("data-a11y-line", s.lineHeight);
  el.style.setProperty("--a11y-zoom", String(ZOOM_STEPS[s.textScale] ?? 1));
  if (s.bigCursor) el.setAttribute("data-a11y-cursor", "big");
  else el.removeAttribute("data-a11y-cursor");
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export function loadA11y(): A11ySettings {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (raw) return { ...A11Y_DEFAULTS, ...(JSON.parse(raw) as Partial<A11ySettings>) };
  } catch {}
  return A11Y_DEFAULTS;
}

export function isA11yDefault(s: A11ySettings): boolean {
  return (
    s.contrast === "normal" &&
    s.textScale === 0 &&
    s.spacing === "normal" &&
    s.lineHeight === "normal" &&
    !s.bigCursor
  );
}
