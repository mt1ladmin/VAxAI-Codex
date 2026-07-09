import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111718",
        night: "#0B1113",
        paper: "#FFFFFF",
        muted: "#5F686A",
        cream: "#F5F8F8",
        acid: "#D8FC2E",
        pine: {
          50: "#F2F7F7",
          100: "#E3ECEE",
          200: "#C7D9DD",
          600: "#375A62",
          700: "#27464D",
          800: "#1B343A",
          900: "#122428",
          950: "#0B171A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(18, 36, 40, 0.10)",
        card: "0 1px 2px rgba(18, 36, 40, 0.05), 0 12px 32px rgba(18, 36, 40, 0.06)",
        lift: "0 2px 6px rgba(18, 36, 40, 0.05), 0 24px 56px rgba(18, 36, 40, 0.13)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
