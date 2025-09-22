/**
 * Copy built files from dist to site/js directory
 * This ensures the site has access to the built mascot files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const SITE_JS_DIR = path.join(__dirname, '../site/js');

// Files to copy from dist to site/js
const FILES_TO_COPY = [
    'mascot.js',
    'mascot.js.map',
    'mascot.dev.js',
    'mascot.dev.js.map',
    'emotive-mascot.umd.js',
    'emotive-mascot.umd.js.map',
    'emotive-mascot.umd.dev.js',
    'emotive-mascot.umd.dev.js.map',
    'emotive-mascot.minimal.js',
    'emotive-mascot.minimal.js.map',
    'emotive-mascot.minimal.umd.js',
    'emotive-mascot.minimal.umd.js.map',
    'emotive-mascot.audio.js',
    'emotive-mascot.audio.js.map'
];

function copyBuiltFiles() {
    console.log('📦 Copying built files to site/js...\n');

    let copiedCount = 0;
    let skippedCount = 0;

    for (const file of FILES_TO_COPY) {
        const srcPath = path.join(DIST_DIR, file);
        const destPath = path.join(SITE_JS_DIR, file);

        try {
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`✓ Copied: ${file}`);
                copiedCount++;
            } else {
                console.log(`⚠ Skipped: ${file} (not found in dist)`);
                skippedCount++;
            }
        } catch (error) {
            console.error(`✗ Error copying ${file}:`, error.message);
        }
    }

    console.log('\n✅ Copy complete!');
    console.log(`📊 Copied: ${copiedCount} files`);
    console.log(`⚠ Skipped: ${skippedCount} files`);
}

// Run the copy process
copyBuiltFiles();
