import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        border: "var(--border)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        low: "var(--low-bg)",
        "low-foreground": "var(--low-text)",
        "low-border": "var(--low-border)",
        medium: "var(--medium-bg)",
        "medium-foreground": "var(--medium-text)",
        "medium-border": "var(--medium-border)",
        high: "var(--high-bg)",
        "high-foreground": "var(--high-text)",
        "high-border": "var(--high-border)",
        severe: "var(--severe-bg)",
        "severe-foreground": "var(--severe-text)",
        "severe-border": "var(--severe-border)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        "mono-metric": ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
