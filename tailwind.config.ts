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
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /*
          ElevenLabs-derived white + maroon system (the new primary identity).
          Deep Maroon (#5c0a14) is the system ink — text + filled primary
          buttons. Bright Maroon / Wine are DECORATIVE accents only (orbs,
          gradient washes), never UI affordances. Sourced from DESIGN.md.
        */
        "pure-white": "#ffffff",
        porcelain: "#fbf7f7",
        "maroon-mist": "#f3e6e8",
        "rose-border": "#e7d3d5",
        "deep-maroon": "#5c0a14",
        maroon: "#800020",
        wine: "#9e2b25",
        rosewood: "#8c5a60",
        "dusty-rose": "#b89aa0",
        /*
          Legacy gabay token names retained, but their VALUES now point at the
          ElevenLabs maroon system so every inner page (diagnostic, dashboard,
          results, practice) reskins without touching each component. berry /
          mango / teal all collapse onto Deep Maroon ink — the system has a
          single accent. state.* is a monochrome light→dark maroon ramp
          (strength encoded by value, never hue — see DESIGN.md).
        */
        berry: {
          DEFAULT: "#5c0a14",
          deep: "#470810",
          soft: "#800020",
          tint: "#f3e6e8",
        },
        teal: {
          DEFAULT: "#5c0a14",
          deep: "#470810",
          soft: "#8c5a60",
          tint: "#f3e6e8",
        },
        mango: {
          DEFAULT: "#5c0a14",
          deep: "#470810",
          tint: "#f3e6e8",
        },
        cream: "#ffffff",
        clay: {
          DEFAULT: "#fbf7f7",
          deep: "#f3e6e8",
          line: "#e7d3d5",
        },
        ink: {
          DEFAULT: "#5c0a14",
          muted: "#8c5a60",
          faint: "#b89aa0",
        },
        state: {
          strong: "#5c0a14",
          steady: "#9e2b25",
          weak: "#b89aa0",
        },
        // shadcn/ui semantic tokens (driven by CSS vars in globals.css).
        // Mapped to the gabay palette on whiter surfaces for the results UI.
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        // Display = Figtree (weight 300, the Waldenburg "whisper authority" role),
        // body/UI = Inter. Both wired to next/font CSS vars in layout.tsx.
        display: ["var(--font-figtree)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        // Capped at the landing's scale: 20px cards, 24px large panels.
        // (Was 28/36px — softer/bubblier than the landing system.)
        clay: "20px",
        "clay-lg": "24px",
        "clay-xl": "24px",
        // shadcn radius tokens
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Maroon-tinted hairline elevation (replaces the old claymorphic shadows).
      // Surface contrast + sub-pixel maroon rings do the separation work — no
      // soft blurs, matching the ElevenLabs system in DESIGN.md.
      boxShadow: {
        clay: "rgba(92,10,20,0.06) 0px 0px 0px 1px, rgba(92,10,20,0.04) 0px 1px 2px 0px, rgba(92,10,20,0.04) 0px 2px 4px 0px",
        "clay-sm": "rgba(92,10,20,0.05) 0px 0px 0px 1px, rgba(92,10,20,0.04) 0px 1px 1px 0px",
        "clay-lg": "rgba(92,10,20,0.06) 0px 0px 0px 1px, rgba(92,10,20,0.06) 0px 4px 12px 0px",
        "clay-pressed": "rgba(92,10,20,0.1) 0px 0px 0px 1px inset",
        "clay-mango": "rgba(92,10,20,0.08) 0px 0px 0px 1px, rgba(92,10,20,0.05) 0px 1px 2px 0px",
        "clay-berry": "rgba(92,10,20,0.08) 0px 0px 0px 1px, rgba(92,10,20,0.05) 0px 1px 2px 0px",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pop-check": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.25)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "complete-glow": {
          "0%": { boxShadow: "0 0 0 0 rgba(47,111,94,0.45)" },
          "70%": { boxShadow: "0 0 0 8px rgba(47,111,94,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(47,111,94,0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "float-soft": "float-soft 6s ease-in-out infinite",
        "fade-up": "fade-up 600ms ease-out both",
        "fade-in": "fade-in 450ms ease-out both",
        "scale-in": "scale-in 380ms cubic-bezier(0.22,1,0.36,1) both",
        "slide-in-right": "slide-in-right 500ms cubic-bezier(0.22,1,0.36,1) both",
        "slide-in-left": "slide-in-left 500ms cubic-bezier(0.22,1,0.36,1) both",
        "pop-check": "pop-check 440ms cubic-bezier(0.22,1,0.36,1) both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "complete-glow": "complete-glow 1100ms ease-out",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
