import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A1915",
        night: "#151515",
        paper: "#F7F5EE",
        muted: "#6C675C",
        cream: "#F0ECDF",
        acid: "#EFEA78",
        pine: {
          50: "#F1F6F1",
          100: "#E2ECE4",
          200: "#C5D9CB",
          600: "#26655A",
          700: "#1C574B",
          800: "#12463B",
          900: "#0B3931",
          950: "#07251F",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(11, 57, 49, 0.10)",
        card: "0 1px 2px rgba(11, 57, 49, 0.05), 0 12px 32px rgba(11, 57, 49, 0.06)",
        lift: "0 2px 6px rgba(11, 57, 49, 0.05), 0 24px 56px rgba(11, 57, 49, 0.13)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
