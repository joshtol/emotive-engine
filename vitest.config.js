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
        // Forks pool — child process inherits NODE_OPTIONS from environment.
        // CI sets NODE_OPTIONS='--max-old-space-size=8192' so the forked worker
        // has enough total process memory for v8's RegExpCompiler zone allocator
        // (which is separate from --max-old-space-size JS heap limit).
        // Threads pool deadlocks on Windows with jsdom, so forks is required.
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
                execArgv: ['--max-old-space-size=8192']
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