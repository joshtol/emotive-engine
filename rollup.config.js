import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import analyzer from 'rollup-plugin-analyzer';
import bundleSize from 'rollup-plugin-bundle-size';
import { visualizer } from 'rollup-plugin-visualizer';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

// Bundle size limits (in bytes) - DEPRECATED: Now using package.json bundlesize
// const BUNDLE_SIZE_LIMITS = {
//     umd: 51200, // 50KB
//     es: 40960,  // 40KB
//     minimal: 20480 // 20KB for minimal build
// };

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
            drop_console: false,
            drop_debugger: true,
            passes: 2,
            unsafe_arrows: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true
        },
        mangle: {
            properties: false
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
    input: 'src/index.js',
    output: [
        {
            // UMD production bundle
            file: 'dist/emotive-mascot.umd.js',
            format: 'umd',
            name: 'EmotiveMascot',
            exports: 'named',
            sourcemap: true,
            banner: `/*! Emotive Engine v${process.env.npm_package_version || '2.1.0'} | Proprietary License */`
        },
        {
            // UMD development bundle
            file: 'dist/emotive-mascot.umd.dev.js',
            format: 'umd',
            name: 'EmotiveMascot',
            exports: 'named',
            sourcemap: true
        },
        {
            // ES Module production bundle
            file: 'dist/mascot.js',
            format: 'es',
            sourcemap: true,
            banner: `/*! Emotive Engine v${process.env.npm_package_version || '2.1.0'} | Proprietary License */`
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
        moduleSideEffects: true
    }
});

// Minimal build (core functionality only - no audio)
builds.push({
    input: 'src/minimal.js', // Minimal entry point
    output: [
        {
            file: 'dist/emotive-mascot.minimal.js',
            format: 'es',
            sourcemap: true,
            banner: `/*! Emotive Engine Minimal v${process.env.npm_package_version || '2.5.1'} | Proprietary License */`
        },
        {
            file: 'dist/emotive-mascot.minimal.umd.js',
            format: 'umd',
            name: 'EmotiveMascotMinimal',
            exports: 'named',
            sourcemap: true,
            banner: `/*! Emotive Engine Minimal v${process.env.npm_package_version || '2.5.1'} | Proprietary License */`
        }
    ],
    plugins: [
        ...(isProduction ? productionPlugins : developmentPlugins)
    ],
    treeshake: {
        moduleSideEffects: false  // Aggressive tree-shaking for minimal build
    }
});

// Audio-focused build (for music-reactive applications)
builds.push({
    input: 'src/audio.js', // Audio entry point
    output: [
        {
            file: 'dist/emotive-mascot.audio.js',
            format: 'es',
            sourcemap: true,
            banner: `/*! Emotive Engine Audio v${process.env.npm_package_version || '2.5.1'} | Proprietary License */`
        },
        {
            file: 'dist/emotive-mascot.audio.umd.js',
            format: 'umd',
            name: 'EmotiveMascotAudio',
            exports: 'named',
            sourcemap: true,
            banner: `/*! Emotive Engine Audio v${process.env.npm_package_version || '2.5.1'} | Proprietary License */`
        }
    ],
    plugins: [
        ...(isProduction ? productionPlugins : developmentPlugins)
    ],
    treeshake: {
        moduleSideEffects: false  // Aggressive tree-shaking for audio build
    }
});

export default builds;