import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EEF2F9",
          100: "#D7DEEF",
          300: "#8997C0",
          500: "#2E477E",
          700: "#1B2E5C",
          900: "#0F1F46",
        },
        gleam: {
          100: "#D6F3E2",
          300: "#7EDAA4",
          500: "#2BAA62",
          700: "#1F7E48",
        },
        cream: {
          DEFAULT: "#F8F4ED",
          deep: "#EFE8DA",
        },
        mint: {
          DEFAULT: "#C9ECDA",
          deep: "#A6D9BD",
        },
        sunny: {
          DEFAULT: "#FFD66B",
          deep: "#F2B53C",
        },
        coral: {
          DEFAULT: "#FF8A6B",
          deep: "#E5694B",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 14px 30px -18px rgba(15, 31, 70, 0.22)",
        cardLift: "0 26px 56px -22px rgba(15, 31, 70, 0.34)",
        chip: "0 2px 0 rgba(15, 31, 70, 0.12)",
      },
      borderRadius: {
        card: "28px",
      },
    },
  },
  plugins: [],
};

export default config;
