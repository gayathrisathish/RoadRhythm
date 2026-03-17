import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0D1117",
        surface: "#161B22",
        elevated: "#21262D",
        border: "#30363D",
        muted: "#7D8590",
        primary: "#E6EDF3",
        accent: "#58A6FF",
        low: "#0D2E1A",
        "low-foreground": "#3FB950",
        "low-border": "#238636",
        medium: "#2D1F00",
        "medium-foreground": "#E3B341",
        "medium-border": "#9E6A03",
        high: "#2D0E0E",
        "high-foreground": "#F85149",
        "high-border": "#DA3633",
        severe: "#200A20",
        "severe-foreground": "#BC8CFF",
        "severe-border": "#8957E5",
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
