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
  },
};