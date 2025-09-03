import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import analyzer from 'rollup-plugin-analyzer';
import bundleSize from 'rollup-plugin-bundle-size';
import { visualizer } from 'rollup-plugin-visualizer';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const shouldAnalyze = process.env.ANALYZE === 'true';

// Bundle size limits (in bytes)
const BUNDLE_SIZE_LIMITS = {
  umd: 51200, // 50KB
  es: 40960,  // 40KB
  minimal: 20480 // 20KB for minimal build
};

// Base plugins used by all builds
const basePlugins = [
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs()
];

// Production plugins
const productionPlugins = [
  ...basePlugins,
  terser({
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.warn'],
      passes: 2,
      unsafe_arrows: true,
      unsafe_methods: true,
      unsafe_proto: true,
      unsafe_regexp: true
    },
    mangle: {
      properties: {
        regex: /^_/
      }
    },
    format: {
      comments: false
    }
  })
];

// Development plugins
const developmentPlugins = [
  ...basePlugins
];

// Analysis plugins
const analysisPlugins = shouldAnalyze ? [
  analyzer({
    summaryOnly: true,
    limit: 10
  }),
  bundleSize(),
  visualizer({
    filename: 'dist/bundle-analysis.html',
    open: true,
    gzipSize: true,
    brotliSize: true
  })
] : [];

// Build configurations
const builds = [];

// Full-featured builds
builds.push({
  input: 'src/mascot.js',
  output: [
    {
      // UMD production bundle
      file: 'dist/emotive-mascot.umd.js',
      format: 'umd',
      name: 'EmotiveMascot',
      sourcemap: true, // Always generate source maps
      banner: `/*! Emotive Mascot v${process.env.npm_package_version || '1.0.0'} | MIT License */`
    },
    {
      // UMD development bundle
      file: 'dist/emotive-mascot.umd.dev.js',
      format: 'umd',
      name: 'EmotiveMascot',
      sourcemap: true
    },
    {
      // ES Module production bundle
      file: 'dist/mascot.js',
      format: 'es',
      sourcemap: true, // Always generate source maps
      banner: `/*! Emotive Mascot v${process.env.npm_package_version || '1.0.0'} | MIT License */`
    },
    {
      // ES Module development bundle
      file: 'dist/mascot.dev.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    ...(isProduction ? productionPlugins : developmentPlugins),
    ...analysisPlugins
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false
  }
});

// Minimal build (core functionality only)
builds.push({
  input: 'src/minimal.js', // Use existing minimal version
  output: [
    {
      file: 'dist/emotive-mascot.minimal.js',
      format: 'es',
      sourcemap: true, // Always generate source maps
      banner: `/*! Emotive Mascot Minimal v${process.env.npm_package_version || '1.0.0'} | MIT License */`
    },
    {
      file: 'dist/emotive-mascot.minimal.umd.js',
      format: 'umd',
      name: 'EmotiveMascotMinimal',
      sourcemap: true, // Always generate source maps
      banner: `/*! Emotive Mascot Minimal v${process.env.npm_package_version || '1.0.0'} | MIT License */`
    }
  ],
  plugins: [
    ...(isProduction ? productionPlugins : developmentPlugins),
    bundleSize({
      limit: BUNDLE_SIZE_LIMITS.minimal
    })
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false
  }
});

// Audio-only build (for audio-focused applications)
builds.push({
  input: 'src/audio-only.js', // We'll create this
  output: [
    {
      file: 'dist/emotive-mascot.audio.js',
      format: 'es',
      sourcemap: true, // Always generate source maps
      banner: `/*! Emotive Mascot Audio v${process.env.npm_package_version || '1.0.0'} | MIT License */`
    }
  ],
  plugins: [
    ...(isProduction ? productionPlugins : developmentPlugins)
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false
  }
});

export default builds;