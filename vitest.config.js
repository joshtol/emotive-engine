import { defineConfig } from 'vitest/config';

export default defineConfig({
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
        // Forks pool with singleFork — all tests run in one forked process.
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true
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