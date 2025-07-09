import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "spanish-orange": "#e16e27",
        "timberwolf": "#E6DEDB",
        "cinereous": "#ae9990",
        "eerie-black": "#0a0a0a",
        "seasalt": "#f8f8f8",
        "warm-taupe": "#ae9990",
        primary: {
          DEFAULT: "#e16e27",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#ae9990",
          foreground: "#1e1e1e",
        },
        muted: {
          DEFAULT: "#E6DEDB",
          foreground: "#1e1e1e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "spin-slow": "spin 20s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(225, 110, 39, 0.05)',
        'warm': '0 1px 3px 0 rgba(225, 110, 39, 0.1), 0 1px 2px 0 rgba(225, 110, 39, 0.06)',
        'warm-md': '0 4px 6px -1px rgba(225, 110, 39, 0.1), 0 2px 4px -1px rgba(225, 110, 39, 0.06)',
        'warm-lg': '0 10px 15px -3px rgba(225, 110, 39, 0.1), 0 4px 6px -2px rgba(225, 110, 39, 0.05)',
        'warm-xl': '0 20px 25px -5px rgba(225, 110, 39, 0.1), 0 10px 10px -5px rgba(225, 110, 39, 0.04)',
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;