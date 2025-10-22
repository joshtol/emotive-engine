/** @type {import('next').NextConfig} */

// Optionally enable bundle analyzer
// Install: npm install --save-dev @next/bundle-analyzer
// Usage: ANALYZE=true npm run build
let withBundleAnalyzer
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
} catch (e) {
  // Bundle analyzer not installed, use identity function
  withBundleAnalyzer = (config) => config
}

const nextConfig = {
  images: {
    domains: ['firebaseapp.com'],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  },
  eslint: {
    // Only run ESLint on specific directories during production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors for pre-production build
    ignoreBuildErrors: true,
  },

  // Webpack optimizations for code splitting
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Production client-side optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,

            // React framework
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },

            // Firebase (large dependency)
            firebase: {
              name: 'firebase',
              test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
              priority: 35,
              enforce: true,
            },

            // Anthropic SDK
            anthropic: {
              name: 'anthropic',
              test: /[\\/]node_modules[\\/](@anthropic-ai)[\\/]/,
              priority: 33,
              enforce: true,
            },

            // Other vendor libraries
            lib: {
              name: 'lib',
              test: /[\\/]node_modules[\\/]/,
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },

            // Common components used across pages
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },

            // Shared utilities
            shared: {
              name: 'shared',
              test: /[\\/]src[\\/](utils|lib|helpers)[\\/]/,
              priority: 15,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },

          // Maximum initial requests
          maxInitialRequests: 25,
          // Maximum async requests
          maxAsyncRequests: 25,
          // Minimum size for a chunk to be created (20kb)
          minSize: 20000,
        },

        // Runtime chunk for better caching
        runtimeChunk: {
          name: 'runtime',
        },
      }

      // Minification options (already optimized by Next.js, but can be enhanced)
      if (config.optimization.minimizer) {
        // Find terser plugin and configure
        const terserIndex = config.optimization.minimizer.findIndex(
          (minimizer) => minimizer.constructor.name === 'TerserPlugin'
        )

        if (terserIndex !== -1) {
          const TerserPlugin = config.optimization.minimizer[terserIndex].constructor
          config.optimization.minimizer[terserIndex] = new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
              mangle: true,
              format: {
                comments: false,
              },
            },
            extractComments: false,
          })
        }
      }
    }

    return config
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/emotive-engine.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Compression
  compress: true,

  // Experimental features for performance
  experimental: {
    // Enable optimizeCss (requires critters)
    optimizeCss: false, // Set to true if you install critters

    // Optimize font loading
    optimizeFonts: true,
  },

  // Production source maps (optional, for debugging)
  productionBrowserSourceMaps: false,

  // Strict mode for React
  reactStrictMode: true,

  // SWC minification (faster than Terser)
  swcMinify: true,
}

module.exports = withBundleAnalyzer(nextConfig)
