import { defineConfig } from 'vitest/config';
import glsl from 'rollup-plugin-glsl';

export default defineConfig({
    plugins: [
        glsl({
            include: ['**/*.vert', '**/*.frag', '**/*.glsl'],
            sourceMap: false
        })
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.js'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/site/**',
            '**/*.spec.ts',
            '**/*.e2e.ts'
        ],
        // Fix IPC errors with large test suites (5000+ tests)
        // Use singleThread mode to eliminate worker process memory overhead
        poolOptions: {
            threads: {
                singleThread: true // Run all tests in main thread to avoid IPC/memory issues
            }
        },
        // Increase timeouts for large test suite
        testTimeout: 30000,
        hookTimeout: 30000,
        // Reduce memory pressure
        maxConcurrency: 3,
        // Isolate tests to prevent leaks
        isolate: true,
        // Use minimal reporter to reduce memory overhead
        reporters: [['default', { summary: false }]],
        // Disable file parallelization
        fileParallelism: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            // Focus coverage on actual library code
            include: [
                'src/**/*.js'
            ],
            exclude: [
                // Build and tooling
                'scripts/**',
                'examples/**',
                'site/**',

                // Type definitions and configs
                '**/*.d.ts',
                '**/*.config.js',

                // Templates and reference files
                '**/*template*.js',
                '**/_*.js',

                // Test files
                'test/**'
            ]
        }
    }
});