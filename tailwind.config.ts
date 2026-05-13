import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: "hsl(var(--bg))",
        panel: "hsl(var(--panel))",
        "panel-2": "hsl(var(--panel-2))",
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        // Text
        fg: "hsl(var(--fg))",
        muted: "hsl(var(--muted))",
        subtle: "hsl(var(--subtle))",
        // Accents (used sparingly). Alpha-value placeholders let
        // utilities like `bg-warning/15` actually emit the alpha.
        critical: "hsl(var(--critical) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        info: "hsl(var(--info) / <alpha-value>)",
        ok: "hsl(var(--ok) / <alpha-value>)",
        "info-solid": "hsl(var(--info-solid) / <alpha-value>)",
        "critical-solid": "hsl(var(--critical-solid) / <alpha-value>)",
        "warning-solid": "hsl(var(--warning-solid) / <alpha-value>)",
        "ok-solid": "hsl(var(--ok-solid) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.012em",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
