/**
 * Production build script with security hardening
 * Minifies, obfuscates, and removes all debug code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { minify as terserMinify } from 'terser';
import { minify as htmlMinify } from 'html-minifier-terser';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_DIR = path.join(__dirname, '../site');
const JS_DIR = path.join(SITE_DIR, 'js');
const HTML_FILE = path.join(SITE_DIR, 'index.html');

// Track integrity hashes for SRI
const integrityHashes = new Map();

async function obfuscateJavaScript(code, _filePath) {
    // First minify with Terser
    const minified = await terserMinify(code, {
        compress: {
            drop_console: true,
            drop_debugger: true,
            dead_code: true,
            unused: true,
            passes: 3
        },
        mangle: {
            toplevel: true,
            properties: {
                regex: /^_/
            }
        },
        format: {
            comments: false
        }
    });

    // Then obfuscate for additional protection
    const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
    });

    return obfuscated.getObfuscatedCode();
}

async function processJavaScriptFile(filePath) {
    const relativePath = path.relative(SITE_DIR, filePath);

    // Skip already minified files and config
    if (filePath.includes('.min.') || filePath.includes('firebase')) {
        return;
    }

    console.log(`Processing: ${relativePath}`);

    try {
        const code = fs.readFileSync(filePath, 'utf8');
        const processed = await obfuscateJavaScript(code, filePath);

        // Calculate integrity hash
        const hash = crypto.createHash('sha384').update(processed).digest('base64');
        integrityHashes.set(relativePath, `sha384-${hash}`);

        // Write obfuscated file
        fs.writeFileSync(filePath, processed);

        console.log(`✓ Obfuscated: ${relativePath}`);
    } catch (error) {
        console.error(`✗ Error processing ${relativePath}:`, error.message);
    }
}

async function processHTML() {
    console.log('Processing HTML...');

    let html = fs.readFileSync(HTML_FILE, 'utf8');

    // Add SRI integrity attributes to script tags
    integrityHashes.forEach((hash, scriptPath) => {
        const regex = new RegExp(`<script([^>]*src="${scriptPath.replace(/\\/g, '/')}"[^>]*)>`, 'g');
        html = html.replace(regex, `<script$1 integrity="${hash}" crossorigin="anonymous">`);
    });

    // Minify HTML aggressively
    const minified = await htmlMinify(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true
    });

    // Add production header
    const header = '<!DOCTYPE html><!-- Emotive Engine v2.5.0 | © 2024 | emotiveengine.com -->';
    const finalHTML = minified.replace('<!DOCTYPE html>', header);

    fs.writeFileSync(HTML_FILE, finalHTML);
    console.log('✓ HTML minified and secured');

    return finalHTML;
}

function generateIntegrityFile() {
    const integrityData = Object.fromEntries(integrityHashes);
    const integrityFile = path.join(SITE_DIR, 'integrity.json');

    fs.writeFileSync(integrityFile, JSON.stringify(integrityData, null, 2));
    console.log('✓ Generated integrity.json');
}

async function processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
            await processJavaScriptFile(fullPath);
        }
    }
}

async function buildProduction() {
    console.log('🔨 Starting production build with security hardening...\n');

    // Process JavaScript files
    await processDirectory(JS_DIR);

    // Process HTML
    await processHTML();

    // Generate integrity file
    await generateIntegrityFile();

    console.log('\n✅ Production build complete!');
    console.log('📦 All files obfuscated and secured');
    console.log('🔐 SRI integrity hashes generated');
}

// Run the build
buildProduction().catch(console.error);