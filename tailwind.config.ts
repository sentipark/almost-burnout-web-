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
        background: "var(--background)",
        foreground: "var(--foreground)",
        origin: {
          purple: "#A0568C",
          "purple-dark": "#8B4876",
          gold: "#B8860B",
          "gold-light": "#D4A017",
          navy: "#2C3E80",
          "navy-dark": "#1E2D5F",
          gray: "#5A5A5A",
          "gray-light": "#8A8A8A",
        },
      },
    },
  },
  plugins: [],
};
export default config;
