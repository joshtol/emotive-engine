/**
 * Print a size table (raw / gzip / brotli) for the published bundles in dist/.
 * Brotli is what a static host serves to modern browsers, so that column is the
 * one the README quotes. Usage: node scripts/report-sizes.js [--json]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSync, brotliCompressSync, constants } from 'zlib';
import { ELEMENTS } from '../src/3d/elements.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '../dist');

const ROWS = [
    ['.', 'mascot.js', '2D engine, ES module'],
    ['./lean', 'emotive-mascot.lean.js', '2D, lean'],
    ['./minimal', 'emotive-mascot.minimal.js', '2D, loading-screen minimal'],
    ['./3d', 'emotive-mascot-3d.js', '3D base, no elementals (three external)'],
    ...ELEMENTS.map(e => [`./3d-${e.name}`, `emotive-mascot-3d-${e.name}.js`, `3D + ${e.type} only`]),
    ['./3d-elementals', 'emotive-mascot-3d-elementals.js', '3D + all eight elementals'],
];

const kb = n => `${(n / 1024).toFixed(0)} KB`;

const rows = ROWS.map(([subpath, file, note]) => {
    const full = path.join(DIST, file);
    if (!fs.existsSync(full)) return { subpath, file, note, missing: true };
    const buf = fs.readFileSync(full);
    return {
        subpath,
        file,
        note,
        raw: buf.length,
        gzip: gzipSync(buf, { level: 9 }).length,
        brotli: brotliCompressSync(buf, {
            params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: buf.length },
        }).length,
    };
});

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(rows, null, 2));
} else {
    console.log('| import | file | raw | gzip | brotli | what |');
    console.log('|---|---|---:|---:|---:|---|');
    for (const r of rows) {
        if (r.missing) {
            console.log(`| \`${r.subpath}\` | ${r.file} | – | – | – | (not built) |`);
        } else {
            console.log(`| \`${r.subpath}\` | ${r.file} | ${kb(r.raw)} | ${kb(r.gzip)} | ${kb(r.brotli)} | ${r.note} |`);
        }
    }
}
