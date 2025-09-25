/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        screens: {
            'xs': '475px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
            '3xl': '1920px',
            '4xl': '2560px',
            'portrait': { 'raw': '(orientation: portrait)' },
            'landscape': { 'raw': '(orientation: landscape)' },
        },
        extend: {
            colors: {
                'emotive-orange': '#FF6B35',
                'emotive-dark': '#1A1A1A',
                'emotive-gray': '#2D2D2D',
                'emotive-brown': '#8B4513',
            },
            fontFamily: {
                'poppins': ['var(--font-poppins)', 'sans-serif'],
                'montserrat': ['var(--font-montserrat)', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            aspectRatio: {
                '4/3': '4 / 3',
                '16/9': '16 / 9',
                '21/9': '21 / 9',
            }
        },
    },
    plugins: [],
};


