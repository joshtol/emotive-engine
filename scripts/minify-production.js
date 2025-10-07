/**
 * Production minification script
 * Minifies HTML, removes comments, and strips debug code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTML_FILE = path.join(__dirname, '../site/index.html');
const OUTPUT_FILE = path.join(__dirname, '../site/index.min.html');

function minifyHTML(html) {
    return html
        // Remove all console.log statements from inline scripts
        .replace(/console\.(log|debug|info|warn|error|trace)\([^)]*\);?/g, '')

        // Remove HTML comments (except IE conditionals)
        .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')

        // Remove unnecessary whitespace between tags
        .replace(/>\s+</g, '><')

        // Remove whitespace around attributes
        .replace(/\s*=\s*/g, '=')

        // Collapse multiple spaces
        .replace(/\s+/g, ' ')

        // Remove whitespace from beginning of lines
        .replace(/^\s+/gm, '')

        // Remove empty lines
        .replace(/\n\s*\n/g, '\n')

        // Remove spaces around specific tags
        .replace(/\s*(<\/?(?:html|head|body|div|span|p|a|li|ul|ol|table|tr|td|th|h[1-6]|br|hr|img|input|button|script|style|link|meta)[^>]*>)\s*/gi, '$1')

        // Minify inline JavaScript
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match, code) => {
            if (code.includes('type="module"')) return match;

            // Remove the entire Firebase auth initialization script
            if (code.includes('Firebase auth') || code.includes('authUI')) {
                return ''; // Remove completely
            }

            const minified = code
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                .replace(/\/\/.*$/gm, '') // Remove line comments
                .replace(/console\.(log|debug|info|warn|error|trace)\([^)]*\);?/g, '') // Remove console
                .replace(/\s+/g, ' ') // Collapse spaces
                .trim();

            return minified ? `<script>${minified}</script>` : '';
        })

        // Minify inline CSS
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
            const minified = css
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                .replace(/\s+/g, ' ') // Collapse spaces
                .replace(/:\s+/g, ':') // Remove space after colon
                .replace(/;\s+/g, ';') // Remove space after semicolon
                .replace(/\s*{\s*/g, '{') // Remove space around braces
                .replace(/\s*}\s*/g, '}')
                .replace(/;\s*}/g, '}') // Remove last semicolon
                .trim();

            return `<style>${minified}</style>`;
        })

        // Remove the auth container div if it exists
        .replace(/<div id="auth-container"><\/div>/g, '')

        // Clean up any remaining multiple spaces
        .replace(/  +/g, ' ');
}

function createProductionHTML() {
    console.log('Reading HTML file...');
    let html = fs.readFileSync(HTML_FILE, 'utf8');

    console.log('Minifying HTML...');
    html = minifyHTML(html);

    // Add production header comment
    const header = '<!DOCTYPE html><!-- Emotive Engine v2.5.0 | (c) 2024 | emotiveengine.com -->\n';
    html = header + html.replace('<!DOCTYPE html>', '');

    console.log('Writing minified HTML...');
    fs.writeFileSync(OUTPUT_FILE, html);

    // Also overwrite the original for deployment
    fs.writeFileSync(HTML_FILE, html);

    const originalSize = fs.statSync(HTML_FILE).size;
    const minifiedSize = html.length;
    const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(2);

    console.log(`HTML minified: ${originalSize} bytes → ${minifiedSize} bytes (${reduction}% reduction)`);
}

// Run the minification
createProductionHTML();
console.log('Production HTML created successfully!');