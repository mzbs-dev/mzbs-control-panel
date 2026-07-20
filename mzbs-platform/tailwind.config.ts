/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1B18",
        paper: "#FAF9F6",
        slate: "#5B5A54",
        line: "#DEDCD3",
        accent: "#2F5D50",
        "accent-soft": "#E6EEEA",
        warn: "#9A3B2E",
        "warn-soft": "#F5E7E3",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
