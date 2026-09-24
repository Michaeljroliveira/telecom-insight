import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        digi: {
          blue: "#0026FF",
          "blue-dark": "#001BB3",
          yellow: "#FFD400",
          green: "#16A34A",
          red: "#DC2626",
          orange: "#EA580C",
        },
      },
    },
  },
  plugins: [],
};

export default config;
