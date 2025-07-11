import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Safelist semantic color patterns
    { pattern: /^(bg|text|border|ring)-(success|warning|error|info)(-\d{2,3})?/ },
    { pattern: /^(bg|text|border)-(primary|secondary|muted)(-foreground)?/ },
    // Safelist rounded patterns
    { pattern: /^rounded-(none|minimal|small|medium|large|xlarge|full)/ },
  ],
  theme: {
    extend: {
      colors: {
        // Base colors with CSS variable support
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Brand colors
        primary: {
          DEFAULT: "var(--color-spanish-orange, #C65D2C)",
          light: "var(--color-spanish-orange-light, #D97749)",
          dark: "var(--color-spanish-orange-dark, #A54E26)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--color-cinereous, #B59B88)",
          light: "var(--color-cinereous-light, #C4ADA0)",
          dark: "var(--color-cinereous-dark, #9A8170)",
          foreground: "#3A3330",
        },
        muted: {
          DEFAULT: "#FBF8F4",
          foreground: "#3A3330",
        },
        
        // Legacy color names (for backward compatibility)
        "spanish-orange": "#C65D2C",
        "timberwolf": "#FBF8F4",
        "cinereous": "#B59B88",
        "eerie-black": "#3A3330",
        "seasalt": "#FBF8F4",
        "warm-taupe": "#B59B88",
        
        // Semantic colors with shades
        success: {
          DEFAULT: "var(--color-success, #059669)",
          50: "var(--color-success-background, #D1FAE5)",
          100: "#A7F3D0",
          200: "#6EE7B7",
          300: "#34D399",
          400: "#10B981",
          500: "var(--color-success, #059669)",
          600: "var(--color-success-dark, #047857)",
          700: "var(--color-success-foreground, #064E3B)",
          light: "var(--color-success-light, #10B981)",
          dark: "var(--color-success-dark, #047857)",
          background: "var(--color-success-background, #D1FAE5)",
          foreground: "var(--color-success-foreground, #064E3B)",
        },
        warning: {
          DEFAULT: "var(--color-warning, #F59E0B)",
          50: "var(--color-warning-background, #FEF3C7)",
          100: "#FDE68A",
          200: "#FCD34D",
          300: "#FBC119",
          400: "var(--color-warning-light, #FCD34D)",
          500: "var(--color-warning, #F59E0B)",
          600: "var(--color-warning-dark, #D97706)",
          700: "var(--color-warning-foreground, #78350F)",
          light: "var(--color-warning-light, #FCD34D)",
          dark: "var(--color-warning-dark, #D97706)",
          background: "var(--color-warning-background, #FEF3C7)",
          foreground: "var(--color-warning-foreground, #78350F)",
        },
        error: {
          DEFAULT: "var(--color-error, #DC2626)",
          50: "var(--color-error-background, #FEE2E2)",
          100: "#FECACA",
          200: "#FCA5A5",
          300: "#F87171",
          400: "var(--color-error-light, #EF4444)",
          500: "var(--color-error, #DC2626)",
          600: "var(--color-error-dark, #B91C1C)",
          700: "var(--color-error-foreground, #7F1D1D)",
          light: "var(--color-error-light, #EF4444)",
          dark: "var(--color-error-dark, #B91C1C)",
          background: "var(--color-error-background, #FEE2E2)",
          foreground: "var(--color-error-foreground, #7F1D1D)",
        },
        info: {
          DEFAULT: "var(--color-info, #3B82F6)",
          50: "var(--color-info-background, #DBEAFE)",
          100: "#BFDBFE",
          200: "#93BBFC",
          300: "var(--color-info-light, #60A5FA)",
          400: "#3B82F6",
          500: "var(--color-info, #3B82F6)",
          600: "var(--color-info-dark, #2563EB)",
          700: "var(--color-info-foreground, #1E3A8A)",
          light: "var(--color-info-light, #60A5FA)",
          dark: "var(--color-info-dark, #2563EB)",
          background: "var(--color-info-background, #DBEAFE)",
          foreground: "var(--color-info-foreground, #1E3A8A)",
        },
        
        // Neutral palette
        neutral: {
          50: "#FBF8F4",
          100: "#F5F0EB",
          200: "#E6DEDB",
          300: "#D4C5BF",
          400: "#B59B88",
          500: "#9A8170",
          600: "#7F6858",
          700: "#645040",
          800: "#3A3330",
          900: "#2A2220",
        },
      },
      
      // Border radius with our design tokens
      borderRadius: {
        none: "0",
        minimal: "0.375rem", // 6px
        small: "0.5rem",     // 8px
        medium: "0.75rem",   // 12px
        large: "1rem",       // 16px
        xlarge: "1.5rem",    // 24px
        full: "9999px",
      },
      
      // Spacing that uses CSS variables for fluid values
      spacing: {
        // Fluid system with proper fallbacks matching max clamp values
        xs: "var(--space-xs, 0.5rem)",      // 8px fallback
        sm: "var(--space-sm, 0.75rem)",     // 12px fallback
        md: "var(--space-md, 1rem)",        // 16px fallback
        lg: "var(--space-lg, 1.5rem)",      // 24px fallback
        xl: "var(--space-xl, 2rem)",        // 32px fallback
        "2xl": "var(--space-2xl, 2.5rem)",  // 40px fallback
        "3xl": "var(--space-3xl, 3rem)",    // 48px fallback
        "4xl": "var(--space-4xl, 4rem)",    // 64px fallback
        "5xl": "var(--space-5xl, 5rem)",    // 80px fallback
        
        // Standard Tailwind spacing for compatibility and migration
        0: '0px',
        0.5: '0.125rem', // 2px
        1: '0.25rem',    // 4px
        1.5: '0.375rem', // 6px
        2: '0.5rem',     // 8px
        2.5: '0.625rem', // 10px
        3: '0.75rem',    // 12px
        3.5: '0.875rem', // 14px
        4: '1rem',       // 16px
        5: '1.25rem',    // 20px
        6: '1.5rem',     // 24px
        7: '1.75rem',    // 28px
        8: '2rem',       // 32px
        9: '2.25rem',    // 36px
        10: '2.5rem',    // 40px
        11: '2.75rem',   // 44px
        12: '3rem',      // 48px
        14: '3.5rem',    // 56px
        16: '4rem',      // 64px
        20: '5rem',      // 80px
        24: '6rem',      // 96px
        28: '7rem',      // 112px
        32: '8rem',      // 128px
        36: '9rem',      // 144px
        40: '10rem',     // 160px
        44: '11rem',     // 176px
        48: '12rem',     // 192px
        52: '13rem',     // 208px
        56: '14rem',     // 224px
        60: '15rem',     // 240px
        64: '16rem',     // 256px
        72: '18rem',     // 288px
        80: '20rem',     // 320px
        96: '24rem',     // 384px
      },
      
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      
      fontSize: {
        // Fluid typography
        "fluid-xs": "var(--text-xs)",
        "fluid-sm": "var(--text-sm)",
        "fluid-base": "var(--text-base)",
        "fluid-lg": "var(--text-lg)",
        "fluid-xl": "var(--text-xl)",
        "fluid-2xl": "var(--text-2xl)",
        "fluid-3xl": "var(--text-3xl)",
        "fluid-4xl": "var(--text-4xl)",
        "fluid-5xl": "var(--text-5xl)",
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
        // Warm-tinted shadows
        "warm-xs": "0 1px 2px 0 rgba(198, 93, 44, 0.05)",
        "warm-sm": "0 1px 3px 0 rgba(198, 93, 44, 0.1), 0 1px 2px 0 rgba(198, 93, 44, 0.06)",
        "warm": "0 1px 3px 0 rgba(198, 93, 44, 0.1), 0 1px 2px 0 rgba(198, 93, 44, 0.06)",
        "warm-md": "0 4px 6px -1px rgba(198, 93, 44, 0.1), 0 2px 4px -1px rgba(198, 93, 44, 0.06)",
        "warm-lg": "0 10px 15px -3px rgba(198, 93, 44, 0.1), 0 4px 6px -2px rgba(198, 93, 44, 0.05)",
        "warm-xl": "0 20px 25px -5px rgba(198, 93, 44, 0.1), 0 10px 10px -5px rgba(198, 93, 44, 0.04)",
        "warm-2xl": "0 25px 50px -12px rgba(198, 93, 44, 0.15)",
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
  darkMode: "class", // Enable dark mode support
};
export default config;