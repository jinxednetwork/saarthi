import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Dual-theme token mapping. Values live as HSL channels in globals.css
 * (`:root` light / `.dark`); this config only maps names → hsl(var()).
 * Saarthi semantic names (canvas/surface/ink/…) and the shadcn vocabulary
 * (background/card/primary/…) both resolve to the same variables.
 */
const v = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* --- shadcn vocabulary --- */
        background: v("background"),
        foreground: v("foreground"),
        card: { DEFAULT: v("card"), foreground: v("card-foreground") },
        popover: { DEFAULT: v("popover"), foreground: v("popover-foreground") },
        primary: {
          DEFAULT: v("primary"),
          foreground: v("primary-foreground"),
          hover: v("primary-hover"),
          link: v("link"),
        },
        secondary: { DEFAULT: v("secondary"), foreground: v("secondary-foreground") },
        muted: { DEFAULT: v("muted"), foreground: v("muted-foreground") },
        accent: { DEFAULT: v("accent"), foreground: v("accent-foreground") },
        destructive: { DEFAULT: v("destructive"), foreground: v("destructive-foreground") },
        border: v("border"),
        input: v("input"),
        ring: v("ring"),

        /* --- Saarthi semantics --- */
        canvas: v("canvas"),
        surface: v("surface"),
        chip: v("chip"),
        panel: v("panel"),
        ink: v("ink"),
        body: v("body-text"),
        faint: v("faint"),
        line: {
          DEFAULT: v("line"),
          warm: v("line-warm"),
          dark: v("line-dark"),
          faint: v("line-faint"),
        },
        saffron: v("saffron"),
        success: v("success"),
        highlight: v("highlight"),
        urgency: {
          critical: v("urgency-critical"),
          high: v("urgency-high"),
          medium: v("urgency-medium"),
          mediumText: v("urgency-medium-text"),
          low: v("urgency-low"),
          lowText: v("urgency-low-text"),
        },
        pathway: {
          MPLADS: v("pathway-mplads"),
          STATE: v("pathway-state"),
          CENTRAL: v("pathway-central"),
          COORDINATION: v("pathway-coordination"),
        },
        /* Channel brand colours — fixed across themes */
        source: {
          whatsapp: "#25D366",
          twitter: "#8899A6",
          reddit: "#FF4500",
          widget: "#4C8DD6",
          portal: "#4C8DD6",
          news: "#B07A45",
          document: "#7E8590",
        },
        category: {
          infrastructure: "#5C7FA3",
          water: "#4C8DD6",
          health: "#B07A45",
          air_quality: "#B07A45",
          other: "#7E8590",
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
        devanagari: [
          "var(--font-devanagari)",
          "Noto Sans Devanagari",
          "Noto Sans",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        livePulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.85)" },
        },
        feedIn: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        livePulse: "livePulse 2s ease-in-out infinite",
        livePulseFast: "livePulse 1.4s ease-in-out infinite",
        feedIn: "feedIn 0.35s ease-out",
        fadeIn: "fadeIn 0.15s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
