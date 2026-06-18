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
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(17, 17, 17, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
