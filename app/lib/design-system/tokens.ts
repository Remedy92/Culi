/**
 * Design System Tokens
 * Centralized design tokens for consistent UI across Culi
 * Following 8-point grid system and hospitality-focused aesthetics
 */

// Type definitions for design tokens
export type RadiusToken = keyof typeof radius;
export type SpacingToken = keyof typeof spacing;
export type ColorToken = keyof typeof colors;
export type ShadowToken = keyof typeof shadows;

/**
 * Border Radius Tokens
 * Consistent corner rounding across all components
 */
export const radius = {
  none: '0',              // Sharp edges for data tables, analytics
  minimal: '0.375rem',    // 6px - Subtle rounding for tight spaces
  small: '0.5rem',        // 8px - Chips, tags, small elements
  medium: '0.75rem',      // 12px - Form elements, small cards
  large: '1rem',          // 16px - Cards, modals, containers
  xlarge: '1.5rem',       // 24px - Hero sections, large cards
  full: '9999px',         // Fully rounded - buttons, badges, pills
} as const;

/**
 * Spacing Tokens (8-point grid)
 * Fluid spacing with fixed fallbacks for print/export
 */
export const spacing = {
  '0': '0',
  'xs': 'var(--space-xs, 0.5rem)',      // 8px
  'sm': 'var(--space-sm, 0.75rem)',     // 12px
  'md': 'var(--space-md, 1rem)',        // 16px
  'lg': 'var(--space-lg, 1.5rem)',      // 24px
  'xl': 'var(--space-xl, 2rem)',        // 32px
  '2xl': 'var(--space-2xl, 2.5rem)',    // 40px
  '3xl': 'var(--space-3xl, 3rem)',      // 48px
  '4xl': 'var(--space-4xl, 4rem)',      // 64px
  '5xl': 'var(--space-5xl, 5rem)',      // 80px
} as const;

/**
 * Color Tokens
 * Extended palette with semantic colors and dark mode support
 */
export const colors = {
  // Brand colors
  primary: {
    DEFAULT: 'var(--color-spanish-orange, #C65D2C)',
    light: 'var(--color-spanish-orange-light, #D97749)',
    dark: 'var(--color-spanish-orange-dark, #A54E26)',
    foreground: 'var(--color-primary-foreground, #ffffff)',
  },
  secondary: {
    DEFAULT: 'var(--color-cinereous, #B59B88)',
    light: 'var(--color-cinereous-light, #C4ADA0)',
    dark: 'var(--color-cinereous-dark, #9A8170)',
    foreground: 'var(--color-secondary-foreground, #3A3330)',
  },
  
  // Neutral colors
  neutral: {
    50: 'var(--color-seasalt, #FBF8F4)',
    100: 'var(--color-timberwolf, #E6DEDB)',
    200: 'var(--color-warm-taupe, #D4C5BF)',
    300: 'var(--color-cinereous, #B59B88)',
    400: '#9A8170',
    500: '#7F6858',
    600: '#645040',
    700: '#4A3830',
    800: '#3A3330',
    900: 'var(--color-eerie-black, #2A2220)',
  },
  
  // Semantic colors
  success: {
    DEFAULT: '#059669',
    light: '#10B981',
    dark: '#047857',
    background: '#D1FAE5',
    foreground: '#064E3B',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
    background: '#FEF3C7',
    foreground: '#78350F',
  },
  error: {
    DEFAULT: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
    background: '#FEE2E2',
    foreground: '#7F1D1D',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    background: '#DBEAFE',
    foreground: '#1E3A8A',
  },
  
  // Background colors
  background: {
    DEFAULT: 'var(--background, #FBF8F4)',
    secondary: 'var(--background-secondary, #F5F0EB)',
    tertiary: 'var(--background-tertiary, #EDE6E0)',
  },
  
  // Foreground colors
  foreground: {
    DEFAULT: 'var(--foreground, #3A3330)',
    secondary: 'var(--foreground-secondary, #645040)',
    tertiary: 'var(--foreground-tertiary, #9A8170)',
  },
} as const;

/**
 * Shadow Tokens
 * Warm-tinted shadows for depth and hierarchy
 */
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(198, 93, 44, 0.05)',
  sm: '0 1px 3px 0 rgba(198, 93, 44, 0.1), 0 1px 2px 0 rgba(198, 93, 44, 0.06)',
  md: '0 4px 6px -1px rgba(198, 93, 44, 0.1), 0 2px 4px -1px rgba(198, 93, 44, 0.06)',
  lg: '0 10px 15px -3px rgba(198, 93, 44, 0.1), 0 4px 6px -2px rgba(198, 93, 44, 0.05)',
  xl: '0 20px 25px -5px rgba(198, 93, 44, 0.1), 0 10px 10px -5px rgba(198, 93, 44, 0.04)',
  '2xl': '0 25px 50px -12px rgba(198, 93, 44, 0.15)',
  inner: 'inset 0 2px 4px 0 rgba(198, 93, 44, 0.06)',
} as const;

/**
 * Typography Tokens
 * Fluid typography scale for responsive design
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: 'var(--font-inter, system-ui, sans-serif)',
    serif: 'var(--font-playfair, Georgia, serif)',
  },
  
  // Font sizes (fluid)
  fontSize: {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
    '4xl': 'var(--text-4xl)',
    '5xl': 'var(--text-5xl)',
    '6xl': 'var(--text-6xl)',
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75',
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/**
 * Animation Tokens
 * Consistent timing and easing functions
 */
export const animation = {
  // Durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/**
 * Breakpoint Tokens
 * Responsive design breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Z-Index Tokens
 * Layering system for overlapping elements
 */
export const zIndex = {
  auto: 'auto',
  base: '0',
  dropdown: '10',
  sticky: '20',
  fixed: '30',
  modalBackdrop: '40',
  modal: '50',
  popover: '60',
  tooltip: '70',
} as const;

/**
 * Component-specific tokens
 * Predefined combinations for common patterns
 */
export const components = {
  button: {
    radius: radius.full,
    paddingX: spacing.lg,
    paddingY: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: `all ${animation.duration.normal} ${animation.easing.easeOut}`,
  },
  card: {
    radius: radius.large,
    padding: spacing.lg,
    shadow: shadows.md,
  },
  input: {
    radius: radius.full,
    paddingX: spacing.md,
    paddingY: spacing.sm,
    fontSize: typography.fontSize.sm,
  },
  badge: {
    radius: radius.full,
    paddingX: spacing.sm,
    paddingY: spacing.xs,
    fontSize: typography.fontSize.xs,
  },
} as const;

/**
 * Utility function to get CSS variable value
 */
export function getCSSVariable(variable: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
  }
  return '';
}

/**
 * Utility function to set CSS variable value
 */
export function setCSSVariable(variable: string, value: string): void {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(variable, value);
  }
}