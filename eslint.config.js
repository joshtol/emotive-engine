import js from '@eslint/js';

export default [
    // Base recommended configuration
    js.configs.recommended,

    // Global configuration for all files
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                performance: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                Image: 'readonly',
                Audio: 'readonly',
                AudioContext: 'readonly',
                SpeechSynthesisUtterance: 'readonly',
                XMLHttpRequest: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                CustomEvent: 'readonly',
                Event: 'readonly',
                EventTarget: 'readonly',
                ResizeObserver: 'readonly',
                IntersectionObserver: 'readonly',
                MutationObserver: 'readonly',
                WebSocket: 'readonly',
                Worker: 'readonly',
                SharedWorker: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                // Node globals (for scripts)
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly'
            }
        },
        rules: {
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'semi': ['error', 'always'],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'arrow-parens': ['error', 'as-needed'],
            'arrow-spacing': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-destructuring': ['error', {
                object: true,
                array: false
            }],
            'prefer-template': 'error',
            'template-curly-spacing': ['error', 'never'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-return-await': 'error',
            'no-self-compare': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-unmodified-loop-condition': 'error',
            'no-useless-call': 'error',
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'prefer-promise-reject-errors': 'error',
            'radix': 'error',
            'require-await': 'error',
            'yoda': 'error',
            'no-shadow': 'warn',
            'no-duplicate-imports': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-constructor': 'error',
            'no-useless-rename': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-numeric-literals': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'rest-spread-spacing': ['error', 'never'],
            'symbol-description': 'error'
        }
    },

    // Test files configuration
    {
        files: ['test/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly'
            }
        },
        rules: {
            'no-console': 'off'
        }
    },

    // Scripts configuration
    {
        files: ['scripts/**/*.js'],
        rules: {
            'no-console': 'off'
        }
    },

    // Ignore patterns
    {
        ignores: [
            'dist/',
            'node_modules/',
            'site/dist/',
            'coverage/',
            '*.min.js',
            '*.old.js'
        ]
    }
];