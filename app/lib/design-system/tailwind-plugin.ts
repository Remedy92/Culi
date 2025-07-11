import plugin from 'tailwindcss/plugin';
import { radius, spacing, colors, shadows, typography, animation, zIndex } from './tokens';

/**
 * Culi Design System Tailwind Plugin
 * Enforces design tokens and provides custom utilities
 */
export const culiDesignPlugin = plugin(
  function ({ matchUtilities, addUtilities, addBase }) {
    // Add CSS variables to :root
    addBase({
      ':root': {
        // Spacing variables (fluid with fallbacks)
        '--space-xs': 'clamp(0.25rem, 1vw, 0.5rem)',
        '--space-sm': 'clamp(0.5rem, 1.5vw, 0.75rem)',
        '--space-md': 'clamp(1rem, 2vw, 1.5rem)',
        '--space-lg': 'clamp(1.5rem, 3vw, 2rem)',
        '--space-xl': 'clamp(2rem, 4vw, 2.5rem)',
        '--space-2xl': 'clamp(2.5rem, 5vw, 3.5rem)',
        '--space-3xl': 'clamp(3rem, 6vw, 5rem)',
        '--space-4xl': 'clamp(4rem, 7vw, 6rem)',
        '--space-5xl': 'clamp(5rem, 8vw, 7rem)',
        
        // Color variables for dark mode support
        '--color-spanish-orange': '#C65D2C',
        '--color-spanish-orange-light': '#D97749',
        '--color-spanish-orange-dark': '#A54E26',
        '--color-cinereous': '#B59B88',
        '--color-cinereous-light': '#C4ADA0',
        '--color-cinereous-dark': '#9A8170',
      },
      
      // Dark mode color overrides
      '.dark': {
        '--background': '#2A2220',
        '--background-secondary': '#3A3330',
        '--background-tertiary': '#4A3830',
        '--foreground': '#FBF8F4',
        '--foreground-secondary': '#E6DEDB',
        '--foreground-tertiary': '#B59B88',
        '--color-spanish-orange': '#D97749',
        '--color-spanish-orange-light': '#E08A5C',
        '--color-spanish-orange-dark': '#C65D2C',
      },
    });

    // Custom border radius utilities
    matchUtilities(
      {
        'rounded-token': (value) => ({
          borderRadius: value,
        }),
      },
      {
        values: radius,
      }
    );

    // Custom spacing utilities enforcing 8-point grid
    matchUtilities(
      {
        'p-token': (value) => ({
          padding: value,
        }),
        'px-token': (value) => ({
          paddingLeft: value,
          paddingRight: value,
        }),
        'py-token': (value) => ({
          paddingTop: value,
          paddingBottom: value,
        }),
        'pt-token': (value) => ({
          paddingTop: value,
        }),
        'pr-token': (value) => ({
          paddingRight: value,
        }),
        'pb-token': (value) => ({
          paddingBottom: value,
        }),
        'pl-token': (value) => ({
          paddingLeft: value,
        }),
      },
      {
        values: spacing,
      }
    );

    // Margin utilities
    matchUtilities(
      {
        'm-token': (value) => ({
          margin: value,
        }),
        'mx-token': (value) => ({
          marginLeft: value,
          marginRight: value,
        }),
        'my-token': (value) => ({
          marginTop: value,
          marginBottom: value,
        }),
        'mt-token': (value) => ({
          marginTop: value,
        }),
        'mr-token': (value) => ({
          marginRight: value,
        }),
        'mb-token': (value) => ({
          marginBottom: value,
        }),
        'ml-token': (value) => ({
          marginLeft: value,
        }),
      },
      {
        values: spacing,
      }
    );

    // Gap utilities
    matchUtilities(
      {
        'gap-token': (value) => ({
          gap: value,
        }),
        'gap-x-token': (value) => ({
          columnGap: value,
        }),
        'gap-y-token': (value) => ({
          rowGap: value,
        }),
      },
      {
        values: spacing,
      }
    );

    // Custom shadow utilities
    matchUtilities(
      {
        'shadow-token': (value) => ({
          boxShadow: value,
        }),
      },
      {
        values: shadows,
      }
    );

    // RTL-aware utilities
    addUtilities({
      '.rtl-aware': {
        '[dir="rtl"] &': {
          direction: 'rtl',
        },
      },
      '.ltr\\:ml-auto': {
        '[dir="ltr"] &': {
          marginLeft: 'auto',
        },
      },
      '.rtl\\:mr-auto': {
        '[dir="rtl"] &': {
          marginRight: 'auto',
        },
      },
      '.ltr\\:text-left': {
        '[dir="ltr"] &': {
          textAlign: 'left',
        },
      },
      '.rtl\\:text-right': {
        '[dir="rtl"] &': {
          textAlign: 'right',
        },
      },
    });

    // Component preset utilities
    addUtilities({
      // Button presets
      '.btn-primary': {
        borderRadius: radius.full,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        transition: `all ${animation.duration.normal} ${animation.easing.easeOut}`,
        backgroundColor: colors.primary.DEFAULT,
        color: colors.primary.foreground,
        boxShadow: shadows.md,
        '&:hover': {
          boxShadow: shadows.lg,
          transform: 'scale(1.05)',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: colors.primary.DEFAULT,
          outlineOffset: '2px',
        },
      },
      
      // Card presets
      '.card-base': {
        borderRadius: radius.large,
        padding: spacing.lg,
        backgroundColor: 'white',
        boxShadow: shadows.md,
        border: '1px solid rgba(181, 155, 136, 0.1)',
      },
      
      // Input presets
      '.input-base': {
        borderRadius: radius.full,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        fontSize: typography.fontSize.sm,
        border: '1px solid rgba(181, 155, 136, 0.3)',
        transition: `all ${animation.duration.normal} ${animation.easing.easeOut}`,
        '&:focus': {
          outline: '2px solid',
          outlineColor: colors.primary.DEFAULT,
          outlineOffset: '2px',
          borderColor: 'transparent',
        },
      },
      
      // Badge presets
      '.badge-base': {
        borderRadius: radius.full,
        paddingLeft: spacing.sm,
        paddingRight: spacing.sm,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xs,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
      },
      
      // Elevation classes
      '.elevation-1': {
        boxShadow: shadows.xs,
      },
      '.elevation-2': {
        boxShadow: shadows.sm,
      },
      '.elevation-3': {
        boxShadow: shadows.md,
      },
      '.elevation-4': {
        boxShadow: shadows.lg,
      },
      '.elevation-5': {
        boxShadow: shadows.xl,
      },
    });

    // Animation utilities
    Object.entries(animation.duration).forEach(([key, value]) => {
      addUtilities({
        [`.duration-${key}`]: {
          animationDuration: value,
          transitionDuration: value,
        },
      });
    });

    Object.entries(animation.easing).forEach(([key, value]) => {
      addUtilities({
        [`.ease-${key}`]: {
          animationTimingFunction: value,
          transitionTimingFunction: value,
        },
      });
    });
  },
  {
    // Extend theme with design tokens
    theme: {
      extend: {
        borderRadius: radius,
        spacing: spacing,
        boxShadow: shadows,
        zIndex: zIndex,
        transitionDuration: animation.duration,
        transitionTimingFunction: animation.easing,
        colors: {
          'token-primary': colors.primary,
          'token-secondary': colors.secondary,
          'token-success': colors.success,
          'token-warning': colors.warning,
          'token-error': colors.error,
          'token-info': colors.info,
        },
      },
    },
  }
);