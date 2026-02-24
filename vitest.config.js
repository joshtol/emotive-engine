import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./test/setup.js'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/site/**',
            '**/*.spec.ts',
            '**/*.e2e.ts'
        ],
        pool: 'threads',
        passWithNoTests: true,
        testTimeout: 30000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.js'],
            exclude: [
                'scripts/**',
                'examples/**',
                'site/**',
                '**/*.d.ts',
                '**/*.config.js',
                '**/*template*.js',
                '**/_*.js',
                'test/**'
            ]
        }
    }
});
