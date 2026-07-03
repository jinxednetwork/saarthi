import type { Config } from "tailwindcss";
import { ux4gTokens } from "./src/lib/ux4g-tokens";

const t = ux4gTokens;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: t.colors.primary,
        accent: t.colors.accent,
        success: t.colors.success,
        warning: t.colors.warning,
        danger: t.colors.danger,
        urgency: t.colors.urgency,
        ink: t.colors.ink,
        muted: t.colors.muted,
        line: t.colors.line,
        surface: t.colors.surface,
        canvas: t.colors.canvas,
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
      },
    },
  },
  plugins: [],
};

export default config;
