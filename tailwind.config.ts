import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        royal: "#6B21A8",
        navy: "#1A0630",
        plum: "#2B0B45",
        grape: "#3D1058",
        blush: "#FFD4A8",
        hot: "#FF8A00",
        orange: "#FF8A00",
        ice: "#F7F4FB",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px -32px rgba(43, 11, 69, 0.38)",
      },
    },
  },
  plugins: [],
};

export default config;
