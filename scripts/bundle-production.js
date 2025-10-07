/**
 * Production bundler - creates single minified JS file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_DIR = path.join(__dirname, '../site');
const OUTPUT_FILE = path.join(SITE_DIR, 'js/emotive-bundle.min.js');

// Order matters for dependencies
const JS_FILES = [
    // Configuration first
    'js/config/assets-config.js',
    'js/config/constants.js',
    'js/config/ui-strings.js',
    'js/config/footer-config.js',
    'js/config/icons-config.js',

    // UI modules
    'js/ui/theme-manager.js',
    'js/ui/display-manager.js',
    'js/ui/dice-roller.js',
    'js/ui/dj-scratcher.js',
    'js/ui/audio-visualizer.js',
    'js/ui/notification-system.js',
    'js/ui/rhythm-sync-visualizer.js',
    'js/ui/scrollbar-compensator.js',
    'js/ui/tooltip-system.js',

    // Control modules
    'js/controls/randomizer-controller.js',
    'js/controls/gesture-chain-controller.js',
    'js/controls/undertone-controller.js',
    'js/controls/system-controls-controller.js',
    'js/controls/emotion-controller.js',
    'js/controls/shape-morph-controller.js',
    'js/controls/audio-controller.js',
    'js/controls/dice-controller.js',
    'js/controls/gesture-controller.js',
    'js/controls/orientation-controller.js',

    // Core modules
    'js/core/global-state.js',
    'js/core/module-loader.js',
    'js/core/legacy-compatibility.js',
    'js/core/app.js',
    'js/core/app-bootstrap.js'
];

async function bundleScripts() {
    console.log('🔨 Building production bundle...\n');

    let bundledCode = '/* Emotive Engine Bundle v2.5.0 | (c) 2024 | emotiveengine.com */\n';
    bundledCode += '(function() {\n"use strict";\n\n';

    let totalOriginalSize = 0;

    // Read and concatenate all files
    for (const file of JS_FILES) {
        const filePath = path.join(SITE_DIR, file);

        try {
            let code = fs.readFileSync(filePath, 'utf8');
            totalOriginalSize += code.length;

            // Remove IIFE wrappers to avoid nested closures
            code = code.replace(/^\(function\(\)\s*{\s*['"]use strict['"];?/, '');
            code = code.replace(/}\)\(\);?\s*$/, '');

            // Add file marker comment (will be removed in minification)
            bundledCode += `/* === ${file} === */\n`;
            bundledCode += code + '\n\n';

            console.log(`✓ Added ${file}`);
        } catch (error) {
            console.error(`✗ Failed to read ${file}:`, error.message);
        }
    }

    // Close the main IIFE
    bundledCode += '\n})();';

    console.log('\n📦 Minifying bundle...');

    // Minify the bundle
    const minified = await minify(bundledCode, {
        compress: {
            drop_console: true,
            drop_debugger: true,
            dead_code: true,
            unused: true,
            passes: 2,
            pure_funcs: ['console.log', 'console.debug', 'console.info']
        },
        mangle: {
            toplevel: false,
            reserved: ['EmotiveMascot', 'emotiveState', 'EMOTIVE_CONFIG']
        },
        format: {
            comments: false,
            semicolons: false
        }
    });

    // Write the minified bundle
    fs.writeFileSync(OUTPUT_FILE, minified.code);

    const bundleSize = minified.code.length;
    const reduction = ((1 - bundleSize / totalOriginalSize) * 100).toFixed(1);

    console.log(`\n✅ Bundle created: ${OUTPUT_FILE}`);
    console.log(`📊 Size: ${(bundleSize / 1024).toFixed(1)}KB (${reduction}% reduction)`);
    console.log(`🚀 ${JS_FILES.length} files bundled into 1`);

    return OUTPUT_FILE;
}

// Create production HTML that uses the bundle
function createProductionHTML() {
    const htmlPath = path.join(SITE_DIR, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Replace bootstrap-loader with bundle
    html = html.replace(
        '<script src="js/bootstrap-loader.js"></script>',
        '<script src="js/emotive-bundle.min.js"></script>'
    );

    // Add loading indicator CSS
    const loadingCSS = `
    <style id="loading-styles">
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0a0a0a;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        }
        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 3px solid rgba(0, 255, 255, 0.2);
            border-top-color: #00ffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            position: absolute;
            bottom: 40%;
            color: #00ffff;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
    </style>`;

    // Add loading overlay HTML
    const loadingHTML = `
    <div id="loading-overlay" class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">Initializing Neural Interface</div>
    </div>`;

    // Insert loading elements
    html = html.replace('</head>', loadingCSS + '</head>');
    html = html.replace('<body class="dark">', '<body class="dark">' + loadingHTML);

    // Add script to remove loader when ready
    const loaderScript = `
    <script>
        window.addEventListener('load', function() {
            setTimeout(function() {
                const loader = document.getElementById('loading-overlay');
                if (loader) {
                    loader.style.opacity = '0';
                    setTimeout(function() {
                        loader.style.display = 'none';
                    }, 500);
                }
            }, 500);
        });

        // Fix inspector resize issue
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (window.emotiveApp && window.emotiveApp.handleResize) {
                    window.emotiveApp.handleResize();
                } else if (window.EmotiveMascot) {
                    // Trigger a re-render
                    const event = new CustomEvent('viewport-resize');
                    window.dispatchEvent(event);
                }
            }, 250);
        });
    </script>`;

    html = html.replace('</body>', loaderScript + '</body>');

    // Write production HTML
    const prodHtmlPath = path.join(SITE_DIR, 'index.prod.html');
    fs.writeFileSync(prodHtmlPath, html);

    console.log(`\n✅ Production HTML created: ${prodHtmlPath}`);

    return prodHtmlPath;
}

// Run the bundling process
async function build() {
    try {
        await bundleScripts();
        await createProductionHTML();
        console.log('\n🎉 Production build complete!');
        console.log('📝 Deploy index.prod.html as index.html');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();