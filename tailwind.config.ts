import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14163A",
        surface: "#FAFAF6",
        card: "#FFFFFF",
        teal: {
          DEFAULT: "#0FB8A6",
          dark: "#0A8F81",
          light: "#E3F8F5",
        },
        amber: {
          DEFAULT: "#F5A524",
          dark: "#D6870A",
          light: "#FDF1DD",
        },
        slate: {
          DEFAULT: "#5B5F7A",
          light: "#8B8FA8",
        },
        line: "#E7E5DC",
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,58,0.04), 0 8px 24px -8px rgba(20,22,58,0.10)",
        lift: "0 12px 32px -12px rgba(20,22,58,0.22)",
      },
      keyframes: {
        "arc-draw": {
          "0%": { strokeDashoffset: "251" },
          "100%": { strokeDashoffset: "var(--offset, 60)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "arc-draw": "arc-draw 1.1s ease-out forwards",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
