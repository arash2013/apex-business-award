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
          900: "#090E19",
        },
        gold: {
          DEFAULT: "#C9A84C",
          50: "#FAF4E5",
          100: "#F3E6BF",
          400: "#D4B566",
          500: "#C9A84C",
          600: "#A8893A",
          700: "#876D2E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #1B2B4B 0%, #2A4070 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
