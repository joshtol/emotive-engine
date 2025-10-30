/**
 * Check bundle sizes and report if they exceed thresholds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');

// Size thresholds in bytes
const SIZE_LIMITS = {
    'emotive-mascot.lean.umd.js': {
        raw: 850 * 1024, // 850KB
        gzip: 250 * 1024, // 250KB
    },
    'emotive-mascot.minimal.umd.js': {
        raw: 850 * 1024, // 850KB
        gzip: 250 * 1024, // 250KB
    },
    'emotive-mascot.umd.js': {
        raw: 920 * 1024, // 920KB (increased to accommodate refactored architecture)
        gzip: 300 * 1024, // 300KB
    },
};

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

function checkBundleSize(filename, limits) {
    const filePath = path.join(DIST_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${filename}: File not found`);
        return { passed: true, warnings: [] };
    }

    const content = fs.readFileSync(filePath);
    const rawSize = content.length;
    const gzipSize = gzipSync(content).length;

    const rawExceeded = rawSize > limits.raw;
    const gzipExceeded = gzipSize > limits.gzip;

    const status = rawExceeded || gzipExceeded ? '❌' : '✅';
    const warnings = [];

    console.log(`${status} ${filename}`);
    console.log(`   Raw:  ${formatSize(rawSize)} / ${formatSize(limits.raw)}`);
    console.log(`   Gzip: ${formatSize(gzipSize)} / ${formatSize(limits.gzip)}`);

    if (rawExceeded) {
        warnings.push(
            `Raw size ${formatSize(rawSize)} exceeds limit ${formatSize(limits.raw)}`
        );
    }
    if (gzipExceeded) {
        warnings.push(
            `Gzip size ${formatSize(gzipSize)} exceeds limit ${formatSize(limits.gzip)}`
        );
    }

    return {
        passed: !rawExceeded && !gzipExceeded,
        warnings,
        sizes: { raw: rawSize, gzip: gzipSize },
    };
}

function main() {
    console.log('📦 Checking bundle sizes...\n');

    let allPassed = true;
    const results = [];

    for (const [filename, limits] of Object.entries(SIZE_LIMITS)) {
        const result = checkBundleSize(filename, limits);
        results.push({ filename, ...result });

        if (!result.passed) {
            allPassed = false;
        }
    }

    console.log(`\n${'='.repeat(50)}`);

    if (allPassed) {
        console.log('✅ All bundle sizes are within limits!');
        process.exit(0);
    } else {
        console.log('❌ Some bundles exceed size limits:\n');
        results
            .filter(r => !r.passed)
            .forEach(r => {
                console.log(`  ${r.filename}:`);
                r.warnings.forEach(w => console.log(`    - ${w}`));
            });
        process.exit(1);
    }
}

main();
