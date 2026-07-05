import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Citizen Portal tokens — the Saarthi palette (light only; public-facing).
 * HSL channels live in globals.css :root; this maps names → hsl(var()).
 */
const v = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: v("canvas"),
        foreground: v("ink"),
        primary: {
          DEFAULT: v("primary-brand"),
          foreground: v("primary-foreground"),
          hover: v("primary-hover"),
          link: v("link"),
        },
        muted: { foreground: v("muted-fg") },
        border: v("line"),
        input: v("input"),
        ring: v("ring"),
        canvas: v("canvas"),
        surface: v("surface"),
        chip: v("chip"),
        panel: v("panel"),
        ink: v("ink"),
        body: v("body-text"),
        faint: v("faint"),
        line: { DEFAULT: v("line"), warm: v("line-warm"), dark: v("line-dark") },
        saffron: v("saffron"),
        success: v("success"),
        urgency: {
          critical: v("urgency-critical"),
          high: v("urgency-high"),
          medium: v("urgency-medium-text"),
          low: v("urgency-low-text"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Noto Sans", "system-ui", "sans-serif"],
        devanagari: ["var(--font-devanagari)", "Noto Sans Devanagari", "sans-serif"],
      },
    },
  },
  plugins: [animate],
};

export default config;
