import type { Config } from "tailwindcss";
import { ux4gTokens } from "./src/lib/ux4g-tokens";

const t = ux4gTokens;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: t.colors.canvas,
        surface: t.colors.surface,
        chip: t.colors.chip,
        panel: t.colors.panel,
        ink: t.colors.ink,
        body: t.colors.body,
        muted: t.colors.muted,
        faint: t.colors.faint,
        line: t.colors.line,
        "line-warm": t.colors.lineWarm,
        "line-dark": t.colors.lineDark,
        "line-faint": t.colors.lineFaint,
        primary: t.colors.primary,
        accent: t.colors.accent,
        success: t.colors.success,
        urgency: t.colors.urgency,
        pathway: t.colors.pathway,
        source: t.colors.source,
        category: t.colors.category,
        highlight: t.colors.highlight,
      },
      borderRadius: {
        DEFAULT: t.radii.md,
        sm: t.radii.sm,
        md: t.radii.md,
        lg: t.radii.lg,
        xl: t.radii.xl,
      },
      fontFamily: {
        sans: [t.font.sans],
        devanagari: [t.font.devanagari],
        mono: [t.font.mono],
      },
      keyframes: {
        halo: {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.85)" },
        },
        feedIn: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        splashFadeOut: {
          "0%, 62%": { opacity: "1", visibility: "visible" },
          "100%": { opacity: "0", visibility: "hidden" },
        },
        splashRise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        splashBar: {
          "0%": { transform: "scaleY(0.2)", opacity: "0" },
          "60%": { opacity: "1" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
        splashProgress: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        halo: "halo 1.8s ease-out infinite",
        livePulse: "livePulse 2s ease-in-out infinite",
        livePulseFast: "livePulse 1.4s ease-in-out infinite",
        feedIn: "feedIn 0.35s ease-out",
        fadeIn: "fadeIn 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
