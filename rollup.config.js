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

// 3D plugins (Three.js handles shaders natively, no plugin needed)
const threeDPlugins = [
    ...basePlugins
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

// Full-featured builds (ES Module + UMD)
builds.push({
    input: 'src/index.js',
    output: [
        {
            // ES Module for NPM consumers (bundlers like Webpack, Vite, etc.)
            file: 'dist/mascot.js',
            format: 'es',
            sourcemap: true,
            banner: `/*! Emotive Engine v${process.env.npm_package_version || '3.0.0'} | MIT License */`
        },
        {
            // UMD for CDN/browser usage (includes all features)
            file: 'dist/emotive-mascot.umd.js',
            format: 'umd',
            name: 'EmotiveMascot',
            exports: 'named',
            sourcemap: true,
            banner: `/*! Emotive Engine v${process.env.npm_package_version || '3.0.0'} | MIT License */`
        }
    ],
    plugins: [
        ...(isProduction ? productionPlugins : developmentPlugins),
        ...analysisPlugins
    ],
    treeshake: {
        moduleSideEffects: false  // Enable aggressive tree-shaking
    }
});


// Lean build (ultra-optimized for homepage/marketing sites)
// Removes: rhythm sync, undertone saturation, accessibility, performance monitoring
// Smaller bundle with core emotions, gestures, and particle system
builds.push({
    input: 'src/lean.js',
    output: [
        {
            file: 'dist/emotive-mascot.lean.umd.js',
            format: 'umd',
            name: 'EmotiveMascotLean',  // Different name for lean build
            exports: 'named',
            sourcemap: true,
            banner: `/*! Emotive Engine Lean v${process.env.npm_package_version || '3.0.0'} | MIT License */`
        }
    ],
    plugins: [
        ...basePlugins,
        terser({
            compress: {
                drop_console: true,        // Remove console.* in production
                drop_debugger: true,
                passes: 3,                 // More aggressive optimization
                pure_funcs: ['console.log', 'console.warn', 'console.info'],
                unsafe_arrows: true,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                dead_code: true,
                evaluate: true,
                inline: 3
            },
            mangle: {
                properties: {
                    regex: /^_/  // Mangle private properties starting with _
                }
            },
            format: {
                comments: false
            }
        })
    ],
    treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false
    }
});

// 3D build (WebGL variant with procedural geometries)
// Three.js is a peer dependency - not bundled (for npm consumers with bundlers)
builds.push({
    input: 'src/3d/index.js',
    output: [
        {
            // ES Module - three.js external (for bundlers like Webpack, Vite)
            file: 'dist/emotive-mascot-3d.js',
            format: 'es',
            sourcemap: true,
            inlineDynamicImports: true,
            banner: `/*! Emotive Engine 3D v${process.env.npm_package_version || '3.0.0'} | MIT License */`
        },
        {
            // UMD - three.js external (expects global THREE)
            file: 'dist/emotive-mascot-3d.umd.js',
            format: 'umd',
            name: 'EmotiveMascot3D',
            exports: 'named',
            sourcemap: true,
            inlineDynamicImports: true,
            banner: `/*! Emotive Engine 3D v${process.env.npm_package_version || '3.0.0'} | MIT License */`,
            globals: {
                three: 'THREE'
            }
        }
    ],
    external: ['three'],
    plugins: [
        ...threeDPlugins,
        ...(isProduction ? [terser({
            compress: {
                drop_console: false,
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                properties: false
            },
            format: {
                comments: false
            }
        })] : [])
    ],
    treeshake: {
        moduleSideEffects: false
    }
});

// 3D build BUNDLED (for static HTML examples - includes Three.js)
builds.push({
    input: 'src/3d/index.js',
    output: [
        {
            // ES Module with Three.js bundled - for static HTML demos
            file: 'dist/emotive-mascot-3d.bundled.js',
            format: 'es',
            sourcemap: true,
            inlineDynamicImports: true,
            banner: `/*! Emotive Engine 3D (bundled) v${process.env.npm_package_version || '3.0.0'} | MIT License */`
        }
    ],
    // No external - bundle everything including Three.js
    plugins: [
        ...threeDPlugins,
        ...(isProduction ? [terser({
            compress: {
                drop_console: false,
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                properties: false
            },
            format: {
                comments: false
            }
        })] : [])
    ],
    treeshake: {
        moduleSideEffects: false
    }
});

// 3D build WITH ELEMENTALS (full elemental system — 151+ gestures, instanced materials)
// Three.js is a peer dependency - not bundled (for npm consumers with bundlers)
builds.push({
    input: 'src/3d/index-with-elementals.js',
    output: [
        {
            // ES Module - three.js external (for bundlers like Webpack, Vite)
            file: 'dist/emotive-mascot-3d-elementals.js',
            format: 'es',
            sourcemap: true,
            inlineDynamicImports: true,
            banner: `/*! Emotive Engine 3D + Elementals v${process.env.npm_package_version || '3.0.0'} | MIT License */`
        },
        {
            // UMD - three.js external (expects global THREE)
            file: 'dist/emotive-mascot-3d-elementals.umd.js',
            format: 'umd',
            name: 'EmotiveMascot3D',
            exports: 'named',
            sourcemap: true,
            inlineDynamicImports: true,
            banner: `/*! Emotive Engine 3D + Elementals v${process.env.npm_package_version || '3.0.0'} | MIT License */`,
            globals: {
                three: 'THREE'
            }
        }
    ],
    external: ['three'],
    plugins: [
        ...threeDPlugins,
        ...(isProduction ? [terser({
            compress: {
                drop_console: false,
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                properties: false
            },
            format: {
                comments: false
            }
        })] : [])
    ],
    treeshake: {
        moduleSideEffects: true  // Preserve side-effect imports (element registrations + gesture registration)
    }
});

// 3D build WITH ELEMENTALS BUNDLED (includes Three.js - for static HTML examples)
builds.push({
    input: 'src/3d/index-with-elementals.js',
    output: [
        {
            // ES Module with Three.js bundled - for static HTML demos
            file: 'dist/emotive-mascot-3d-elementals.bundled.js',
            format: 'es',
            sourcemap: true,
            inlineDynamicImports: true,
            banner: `/*! Emotive Engine 3D + Elementals (bundled) v${process.env.npm_package_version || '3.0.0'} | MIT License */`
        }
    ],
    // No external - bundle everything including Three.js
    plugins: [
        ...threeDPlugins,
        ...(isProduction ? [terser({
            compress: {
                drop_console: false,
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                properties: false
            },
            format: {
                comments: false
            }
        })] : [])
    ],
    treeshake: {
        moduleSideEffects: true  // Preserve side-effect imports (element registrations + gesture registration)
    }
});

export default builds;
