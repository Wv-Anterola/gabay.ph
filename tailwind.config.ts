import type { Config } from "tailwindcss";

/**
 * Gabay warm-academic claymorphism theme.
 * Brand-owned palette: deep berry primary, botanical teal contrast,
 * mango accent, parchment/cream surfaces, espresso ink.
 * Deliberately NOT official UP colors.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        berry: {
          DEFAULT: "#7A1F3D",
          deep: "#5C1730",
          soft: "#9C3454",
          tint: "#F3DCE3",
        },
        teal: {
          DEFAULT: "#2F6F5E",
          deep: "#214F43",
          soft: "#4A8C7A",
          tint: "#D9EAE4",
        },
        mango: {
          DEFAULT: "#E07B2C",
          deep: "#C2641A",
          tint: "#FBE4CC",
        },
        cream: "#FBF3E7",
        clay: {
          DEFAULT: "#F6E7D7",
          deep: "#EAD7C4",
          line: "#E4D2BD",
        },
        ink: {
          DEFAULT: "#2E211B",
          muted: "#6B584C",
          faint: "#8A7A6E",
        },
        state: {
          strong: "#3E8E63",
          steady: "#C98A2B",
          weak: "#B23A48",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        clay: "20px",
        "clay-lg": "28px",
        "clay-xl": "36px",
      },
      boxShadow: {
        clay: "8px 8px 18px rgba(92,23,48,0.12), -6px -6px 16px rgba(255,255,255,0.75), inset 1px 1px 2px rgba(255,255,255,0.55)",
        "clay-sm": "4px 4px 10px rgba(92,23,48,0.10), -3px -3px 9px rgba(255,255,255,0.7)",
        "clay-lg": "14px 16px 30px rgba(92,23,48,0.16), -8px -8px 20px rgba(255,255,255,0.7), inset 1px 1px 2px rgba(255,255,255,0.5)",
        "clay-pressed": "inset 4px 4px 9px rgba(92,23,48,0.16), inset -3px -3px 8px rgba(255,255,255,0.6)",
        "clay-mango": "6px 6px 14px rgba(194,100,26,0.28), -4px -4px 12px rgba(255,255,255,0.5)",
        "clay-berry": "6px 6px 14px rgba(92,23,48,0.30), -4px -4px 12px rgba(255,255,255,0.35)",
      },
      maxWidth: {
        content: "1180px",
        wide: "1320px",
      },
      fontSize: {
        display: ["clamp(2.75rem, 5vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h1: ["clamp(2rem, 3.4vw, 2.75rem)", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
        h2: ["clamp(1.5rem, 2.4vw, 2rem)", { lineHeight: "1.18" }],
      },
      keyframes: {
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float-soft": "float-soft 6s ease-in-out infinite",
        "fade-up": "fade-up 400ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
