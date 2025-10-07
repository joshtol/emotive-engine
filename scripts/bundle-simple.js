/**
 * Simple production bundler - concatenates and minifies JS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_DIR = path.join(__dirname, '../site');
const OUTPUT_FILE = path.join(SITE_DIR, 'js/emotive-bundle.min.js');

// Order matters for dependencies
// const JS_FILES = [
//     'js/bootstrap-loader.js'  // Just use the bootstrap loader which handles everything
// ];

function createSimpleBundle() {
    console.log('🔨 Creating simple production setup...\n');

    // Copy bootstrap-loader as-is (it already loads everything in order)
    const bootstrapPath = path.join(SITE_DIR, 'js/bootstrap-loader.js');
    const bootstrapCode = fs.readFileSync(bootstrapPath, 'utf8');

    // Just minify whitespace, keep it functional
    const minified = bootstrapCode
        .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove block comments
        .replace(/\/\/.*$/gm, '')           // Remove line comments
        .replace(/\n\s*\n/g, '\n')          // Remove empty lines
        .replace(/\s+/g, ' ')               // Collapse spaces
        .trim();

    fs.writeFileSync(OUTPUT_FILE, minified);

    console.log(`✅ Bundle created: ${OUTPUT_FILE}`);
    console.log(`📊 Size: ${(minified.length / 1024).toFixed(1)}KB`);
}

// Create production HTML with loading indicator
function createProductionHTML() {
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EMOTIVE A.I. Core - Neural Interface</title>
    <link rel="icon" type="image/svg+xml" href="../assets/emotive-engine-icon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="emotive-scifi-modular.css">

    <style>
        #loader {
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
            transition: opacity 0.5s;
        }
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(0,255,255,0.2);
            border-top-color: #00ffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loader-text {
            position: absolute;
            bottom: 45%;
            color: #00ffff;
            font-family: 'Poppins', sans-serif;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        body.loaded #loader {
            opacity: 0;
            pointer-events: none;
        }
    </style>

    <script>
        // Production console silencer
        if (location.hostname === 'emotive-engine.web.app' ||
            location.hostname === 'emotive-engine.firebaseapp.com' ||
            location.hostname === 'emotiveengine.com') {
            const n = function(){};
            window.console = {log:n,debug:n,info:n,warn:n,error:n,trace:n,dir:n,group:n,groupEnd:n,time:n,timeEnd:n,assert:n,clear:n,count:n,table:n};
        }

        // Handle resize events
        window.addEventListener('resize', function() {
            if (window.emotiveApp) {
                const canvas = document.getElementById('emotive-canvas');
                if (canvas) {
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;
                }
            }
        });

        // Remove loader when ready
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.body.classList.add('loaded');
                setTimeout(function() {
                    const loader = document.getElementById('loader');
                    if (loader) loader.style.display = 'none';
                }, 500);
            }, 800);
        });
    </script>
</head>
<body class="dark">
    <div id="loader">
        <div class="loader-spinner"></div>
        <div class="loader-text">Initializing</div>
    </div>`;

    // Read the rest of the HTML body from current index.html
    const currentHTML = fs.readFileSync(path.join(SITE_DIR, 'index.html'), 'utf8');
    const bodyMatch = currentHTML.match(/<header[\s\S]*<\/footer>/);

    if (bodyMatch) {
        const bodyContent = bodyMatch[0];
        const fullHTML = htmlTemplate + '\n    ' + bodyContent + '\n    <script src="js/bootstrap-loader.js"></script>\n</body>\n</html>';

        // Save as index.prod.html
        const outputPath = path.join(SITE_DIR, 'index.prod.html');
        fs.writeFileSync(outputPath, fullHTML);

        console.log(`\n✅ Production HTML created: ${outputPath}`);
        console.log('📝 This includes:');
        console.log('   - Loading indicator');
        console.log('   - Console silencer');
        console.log('   - Resize handler');
    }
}

// Run the process
async function build() {
    try {
        await createSimpleBundle();
        await createProductionHTML();
        console.log('\n🎉 Production setup complete!');
        console.log('\nTo deploy:');
        console.log('1. Copy index.prod.html to index.html');
        console.log('2. Run: firebase deploy --only hosting');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build();