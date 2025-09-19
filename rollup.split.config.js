import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
    input: {
        'emotive-engine': 'src/index.js',
        'emotive-core': 'src/core-exports.js',
        'emotive-features': 'src/features-exports.js',
        'emotive-plugins': 'src/plugins-exports.js'
    },
    output: {
        dir: 'dist/modules',
        format: 'es',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name].js',
        sourcemap: !isProduction,
        manualChunks(id) {
            // Separate vendor chunks
            if (id.includes('node_modules')) {
                if (id.includes('firebase')) {
                    return 'vendor-firebase';
                }
                return 'vendor';
            }

            // Core systems
            if (id.includes('/core/')) {
                if (id.includes('AnimationLoopManager') || id.includes('EventManager')) {
                    return 'core-base';
                }
                if (id.includes('renderer/')) {
                    return 'core-renderer';
                }
                if (id.includes('Particle')) {
                    return 'core-particles';
                }
                if (id.includes('Audio') || id.includes('Sound')) {
                    return 'core-audio';
                }
                return 'core-other';
            }

            // Features
            if (id.includes('/features/')) {
                return 'features';
            }

            // Plugins
            if (id.includes('/plugins/')) {
                return 'plugins';
            }

            // Emotions
            if (id.includes('/emotions/')) {
                return 'emotions';
            }

            // Utils
            if (id.includes('/utils/')) {
                return 'utils';
            }
        }
    },
    plugins: [
        nodeResolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs(),
        isProduction && terser({
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log']
            },
            mangle: {
                reserved: ['EmotiveEngine']
            },
            format: {
                comments: false
            }
        })
    ].filter(Boolean),
    external: id => {
        // Keep firebase external for CDN loading
        return id.startsWith('firebase');
    }
};