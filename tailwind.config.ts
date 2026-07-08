import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        night: "#151515",
        paper: "#F7F4EA",
        muted: "#6F6B62",
        cream: "#EFE9DA",
        acid: "#F5F274",
        forest: "#063b32",
        "forest-light": "#084a3f",
        mint: "#f3f9f5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(17, 17, 17, 0.12)",
        card: "0 8px 32px rgba(17, 17, 17, 0.06)",
        "card-hover": "0 16px 48px rgba(17, 17, 17, 0.1)",
        lift: "0 4px 20px rgba(6, 59, 50, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.75rem",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;