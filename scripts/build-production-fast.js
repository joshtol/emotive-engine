/**
 * Fast production build script
 * Minifies and removes debug code without heavy obfuscation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as terserMinify } from 'terser';
// import crypto from 'crypto'; // Not used

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_DIR = path.join(__dirname, '../site');
const JS_DIR = path.join(SITE_DIR, 'js');
const HTML_FILE = path.join(SITE_DIR, 'index.html');

// Track file sizes
let totalOriginalSize = 0;
let totalMinifiedSize = 0;

async function minifyJavaScript(code) {
    const result = await terserMinify(code, {
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
            reserved: ['EmotiveMascot', 'EMOTIVE_CONFIG', 'emotiveState']
        },
        format: {
            comments: false,
            semicolons: false
        }
    });

    return result.code;
}

async function processJavaScriptFile(filePath) {
    const relativePath = path.relative(SITE_DIR, filePath).replace(/\\/g, '/');

    // Skip already minified files, firebase, and service workers
    if (filePath.includes('.min.') ||
        filePath.includes('firebase') ||
        filePath.includes('service-worker')) {
        return;
    }

    try {
        const code = fs.readFileSync(filePath, 'utf8');
        const originalSize = code.length;

        // Remove debug code before minification
        let cleanCode = code
            .replace(/\/\*\s*DEBUG[\s\S]*?\*\//g, '')
            .replace(/\/\/\s*DEBUG:.*$/gm, '')
            .replace(/if\s*\(\s*DEBUG.*?\)\s*{[\s\S]*?}/g, '');

        const minified = await minifyJavaScript(cleanCode);
        const minifiedSize = minified.length;

        totalOriginalSize += originalSize;
        totalMinifiedSize += minifiedSize;

        fs.writeFileSync(filePath, minified);

        const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
        console.log(`✓ ${relativePath} (${reduction}% smaller)`);
    } catch (error) {
        console.error(`✗ Error processing ${relativePath}:`, error.message);
    }
}

function minifyHTML(html) {
    return html
        // Remove console statements from inline scripts
        .replace(/console\.(log|debug|info|warn|error|trace)\([^)]*\);?/g, '')
        // Remove HTML comments
        .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
        // Remove whitespace between tags
        .replace(/>\s+</g, '><')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ')
        // Remove empty lines
        .replace(/\n\s*\n/g, '\n')
        // Trim
        .trim();
}

function processHTML() {
    console.log('\nProcessing HTML...');

    let html = fs.readFileSync(HTML_FILE, 'utf8');
    const originalSize = html.length;

    // Inject production config loader first
    const productionLoader = `<script>(function(){var n=function(){},c=window.location.hostname,p=c==="emotive-engine.web.app"||c==="emotive-engine.firebaseapp.com"||c==="emotiveengine.com";if(p){window.console={log:n,debug:n,info:n,warn:n,error:n,trace:n,dir:n,group:n,groupEnd:n,time:n,timeEnd:n,assert:n,clear:n};Object.defineProperty(window,"console",{value:window.console,writable:false,configurable:false});window.DEBUG=false;window.DEBUG_MODE=false;}})();</script>`;

    // Add production loader right after <head>
    html = html.replace('<head>', `<head>${productionLoader}`);

    // Minify
    const minified = minifyHTML(html);

    // Add header
    const finalHTML = '<!DOCTYPE html><!-- Emotive Engine v2.5.0 | © 2024 | emotiveengine.com -->\n' +
                      minified.replace('<!DOCTYPE html>', '');

    fs.writeFileSync(HTML_FILE, finalHTML);

    const minifiedSize = finalHTML.length;
    const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
    console.log(`✓ HTML minified (${reduction}% smaller)`);
}

async function processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else if (entry.name.endsWith('.js')) {
            await processJavaScriptFile(fullPath);
        }
    }
}

async function buildProduction() {
    console.log('🚀 Fast production build starting...\n');

    // Process JavaScript files
    await processDirectory(JS_DIR);

    // Process HTML
    await processHTML();

    const totalReduction = ((1 - totalMinifiedSize / totalOriginalSize) * 100).toFixed(1);
    console.log('\n✅ Production build complete!');
    console.log(`📦 Total size reduction: ${totalReduction}%`);
    console.log(`🔐 Debug code removed, console disabled in production`);
}

// Run the build
buildProduction().catch(console.error);