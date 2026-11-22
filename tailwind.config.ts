import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        royal: "#1646A0",
        navy: "#101D42",
        blush: "#FFB6D5",
        hot: "#F15B9B",
        orange: "#FF793B",
        ice: "#F2F7FF",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 24px 60px -32px rgba(16, 29, 66, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
