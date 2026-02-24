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
        // Forks pool (vitest 3.x default). Each test file gets its own
        // forked process with fresh memory, preventing the 275 MB
        // accumulation that crashes v8's RegExpCompiler zone allocator.
        pool: 'forks',
        poolOptions: {
            forks: {
                // MUST be false — singleFork: true crams all 487 tests
                // into one process whose RegExpCompiler OOMs at ~275 MB.
                singleFork: false
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
