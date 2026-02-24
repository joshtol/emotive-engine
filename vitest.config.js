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
        // OOM prevention: CI uses --shard to split into separate processes
        // (v8 RegExpCompiler zone allocator accumulates across files in one process).
        // These settings are for local runs; CI sharding in .github/workflows/ci.yml.
        pool: 'forks',
        testTimeout: 30000,
        hookTimeout: 30000,
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
