/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#06B6D4", dark: "#0891B2", light: "#22D3EE" },  // cyan
        accent: { DEFAULT: "#F59E0B", dark: "#D97706", light: "#FBBF24" }, // gold
        ink: { 50:"#F9FAFB",100:"#F3F4F6",200:"#E5E7EB",300:"#D1D5DB",900:"#111827" }
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.08), 0 4px 16px rgba(16,24,40,.06)",
        hover: "0 4px 12px rgba(16,24,40,.12)"
      },
      borderRadius: { xl2: "1.25rem" },
      animation: { float: "float 8s ease-in-out infinite" },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" }
        }
      }
    }
  },
  plugins: [],
};
