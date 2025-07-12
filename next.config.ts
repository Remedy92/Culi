import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Optimize for faster builds
    optimizeCss: true,
  },
  
  // Fix Tesseract.js worker resolution (moved to stable API in Next.js 15)
  serverExternalPackages: ['tesseract.js'],
  
  // Include WASM files for Tesseract.js
  outputFileTracingIncludes: {
    '/api/menu/extract': ['./node_modules/tesseract.js-core/**/*.wasm'],
  },
  
  // Optimize bundle size
  productionBrowserSourceMaps: false,
  
  // Configure module imports optimization
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  
  webpack: (config, { isServer }) => {
    // Better chunk splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          lib: {
            test(module: any) {
              return module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier());
            },
            name(module: any) {
              const hash = require('crypto').createHash('sha256');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "tablelink-7a",
project: "sentry-tablelink",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: false, // Changed to false to reduce bundle size

// Reduce bundle size by disabling certain features
hideSourceMaps: true,
disableServerWebpackPlugin: process.env.NODE_ENV === 'development',

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});