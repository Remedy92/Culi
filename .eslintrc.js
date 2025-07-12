module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/app/components/ui/dialog',
            message: 'Use @/components/ui/dialog instead for consistency.',
          },
          {
            name: 'app/components/ui/dialog',
            message: 'Use @/components/ui/dialog instead for consistency.',
          },
        ],
        patterns: [
          {
            group: ['@/app/components/ui/*', 'app/components/ui/*'],
            message: 'Use @/components/ui/* instead. All UI components should be imported from the centralized location.',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)(?!-)/]',
        message: 'Use custom max-w-container-* utilities instead. Options: container-narrow (48rem), container-standard (64rem), container-wide (80rem)',
      },
    ],
  },
};