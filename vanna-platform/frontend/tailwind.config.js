/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ongc: { red: "#CC0000", "red-h": "#aa0000", dark: "#0a0e1a" },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
};
