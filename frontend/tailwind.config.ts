import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2B4B",
          50: "#E8EBF0",
          100: "#C5CCDA",
          500: "#1B2B4B",
          700: "#111C31",
          900: "#080D1A",
        },
        gold: {
          DEFAULT: "#C9A84C",
          50: "#FAF4E5",
          100: "#F3E6BF",
          300: "#DEAD7A",
          400: "#D4B566",
          500: "#C9A84C",
          600: "#A8893A",
          700: "#876D2E",
        },
        cream: {
          DEFAULT: "#FAFAF8",
          50: "#FDFDFB",
          100: "#F5F5F0",
          200: "#EDEDEA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(160deg, #0F1D35 0%, #1B2B4B 50%, #1E3258 100%)",
        "gradient-gold":
          "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)",
      },
      letterSpacing: {
        "ultra": "0.25em",
      },
    },
  },
  plugins: [],
};

export default config;
