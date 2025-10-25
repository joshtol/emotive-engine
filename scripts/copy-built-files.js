/**
 * Copy built files from dist to site directories
 * This ensures the site has access to the built mascot files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const SITE_JS_DIR = path.join(__dirname, '../site/js');
const SITE_PUBLIC_DIR = path.join(__dirname, '../site/public');

// Files to copy from dist to site/js
const FILES_TO_COPY = [
    // Full builds
    'mascot.js',
    'mascot.js.map',
    'mascot.dev.js',
    'mascot.dev.js.map',
    'emotive-mascot.umd.js',
    'emotive-mascot.umd.js.map',
    'emotive-mascot.umd.dev.js',
    'emotive-mascot.umd.dev.js.map',
    // Minimal builds (v2.5.1+)
    'emotive-mascot.minimal.js',
    'emotive-mascot.minimal.js.map',
    'emotive-mascot.minimal.umd.js',
    'emotive-mascot.minimal.umd.js.map',
    // Audio builds (v2.5.1+)
    'emotive-mascot.audio.js',
    'emotive-mascot.audio.js.map',
    'emotive-mascot.audio.umd.js',
    'emotive-mascot.audio.umd.js.map'
];

// Files to copy from dist to site/public (for Next.js static serving)
const PUBLIC_FILES_TO_COPY = [
    {
        src: 'emotive-mascot.umd.js',
        dest: 'emotive-engine.js'
    },
    {
        src: 'emotive-mascot.umd.js.map',
        dest: 'emotive-mascot.umd.js.map'
    },
    {
        src: 'emotive-mascot.lean.umd.js',
        dest: 'emotive-engine-lean.js'
    },
    {
        src: 'emotive-mascot.lean.umd.js.map',
        dest: 'emotive-mascot.lean.umd.js.map'
    },
    {
        src: 'emotive-mascot.minimal.umd.js',
        dest: 'emotive-engine-minimal.js'
    },
    {
        src: 'emotive-mascot.minimal.umd.js.map',
        dest: 'emotive-mascot.minimal.umd.js.map'
    }
];

function copyBuiltFiles() {
    console.log('📦 Copying built files to site directories...\n');

    let copiedCount = 0;
    let skippedCount = 0;

    // Copy files to site/js
    console.log('📁 Copying to site/js...');
    for (const file of FILES_TO_COPY) {
        const srcPath = path.join(DIST_DIR, file);
        const destPath = path.join(SITE_JS_DIR, file);

        try {
            if (fs.existsSync(srcPath)) {
                // Ensure destination directory exists
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
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

    // Copy files to site/public
    console.log('\n📁 Copying to site/public...');
    for (const fileMapping of PUBLIC_FILES_TO_COPY) {
        const srcPath = path.join(DIST_DIR, fileMapping.src);
        const destPath = path.join(SITE_PUBLIC_DIR, fileMapping.dest);

        try {
            if (fs.existsSync(srcPath)) {
                // Ensure destination directory exists
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.copyFileSync(srcPath, destPath);
                console.log(`✓ Copied: ${fileMapping.src} → ${fileMapping.dest}`);
                copiedCount++;
            } else {
                console.log(`⚠ Skipped: ${fileMapping.src} (not found in dist)`);
                skippedCount++;
            }
        } catch (error) {
            console.error(`✗ Error copying ${fileMapping.src}:`, error.message);
        }
    }

    console.log('\n✅ Copy complete!');
    console.log(`📊 Copied: ${copiedCount} files`);
    console.log(`⚠ Skipped: ${skippedCount} files`);
}

// Run the copy process
copyBuiltFiles();
