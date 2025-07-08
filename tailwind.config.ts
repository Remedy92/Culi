import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Grid columns
    'grid-cols-1',
    'grid-cols-6',
    'grid-cols-12',
    'md:grid-cols-6',
    'lg:grid-cols-12',
    // Column spans
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'col-span-6',
    'col-span-12',
    'md:col-span-2',
    'md:col-span-3',
    'md:col-span-6',
    'lg:col-span-3',
    'lg:col-span-6',
    'lg:col-span-12',
    // Row spans
    'row-span-1',
    'row-span-2',
    'md:row-span-1',
    'md:row-span-2',
    // Auto rows
    'auto-rows-[160px]',
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
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "spin-slow": "spin 20s linear infinite",
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
      },
    },
  },
  plugins: [],
};
export default config;