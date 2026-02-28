import { rollup } from 'rollup';
import path from 'path';
import { fileURLToPath } from 'url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const coreDir = path.resolve(root, 'src/core');

const srcDir = path.resolve(root, 'src');

const absoluteRedirects = {
    // Gesture pruning: 134 → ~25 gestures
    [path.resolve(coreDir, 'gestures/index.js')]: path.resolve(coreDir, 'gestures/index-minimal.js'),
    // Audio stripping
    [path.resolve(coreDir, 'audio/rhythm.js')]: path.resolve(coreDir, '_stubs/rhythm.stub.js'),
    [path.resolve(coreDir, 'audio/rhythmIntegration.js')]: path.resolve(coreDir, '_stubs/rhythmIntegration.stub.js'),
    [path.resolve(coreDir, 'morpher/AudioDeformer.js')]: path.resolve(coreDir, '_stubs/AudioDeformer.stub.js'),
    [path.resolve(coreDir, 'morpher/MusicDetector.js')]: path.resolve(coreDir, '_stubs/MusicDetector.stub.js'),
    // Positioning + element targeting
    [path.resolve(coreDir, 'positioning/index.js')]: path.resolve(coreDir, '_stubs/positioning.stub.js'),
    [path.resolve(coreDir, 'positioning/elementTargeting/index.js')]: path.resolve(coreDir, '_stubs/elementTargeting.stub.js'),
    // Debugger
    [path.resolve(srcDir, 'utils/debugger.js')]: path.resolve(coreDir, '_stubs/debugger.stub.js'),
    // Musical duration
    [path.resolve(coreDir, 'audio/MusicalDuration.js')]: path.resolve(coreDir, '_stubs/MusicalDuration.stub.js'),
    // Gesture orchestration
    [path.resolve(coreDir, 'GestureCompatibility.js')]: path.resolve(coreDir, '_stubs/GestureCompatibility.stub.js'),
    [path.resolve(coreDir, 'GestureCompositor.js')]: path.resolve(coreDir, '_stubs/GestureCompositor.stub.js'),
    // Sleep manager
    [path.resolve(coreDir, 'renderer/SleepManager.js')]: path.resolve(coreDir, '_stubs/SleepManager.stub.js'),
    // Effects registry
    [path.resolve(coreDir, 'effects/index.js')]: path.resolve(coreDir, '_stubs/effects.stub.js'),
};

(async () => {
const bundle = await rollup({
    input: 'src/minimal.js',
    plugins: [
        {
            name: 'minimal-redirects',
            resolveId(source, importer) {
                if (!importer || !source.startsWith('.')) return null;
                const resolved = path.resolve(path.dirname(importer), source);
                const candidate = resolved.endsWith('.js') ? resolved : `${resolved  }.js`;
                if (absoluteRedirects[candidate]) return absoluteRedirects[candidate];
                return null;
            }
        },
        resolve({ browser: true, preferBuiltins: false }),
        commonjs()
    ],
    treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false
    }
});

const {modules} = bundle.cache;
const sized = modules
    .filter(m => m.code && m.code.length > 0 && !m.id.includes('node_modules'))
    .map(m => ({
        id: m.id.replace(root + path.sep, '').replace(/\\/g, '/'),
        size: m.code.length
    }))
    .sort((a, b) => b.size - a.size);

const total = sized.reduce((s, m) => s + m.size, 0);
console.log(`Total (tree-shaken, pre-minify): ${(total / 1024).toFixed(0)} KB`);
console.log(`Module count: ${sized.length}`);
console.log('');
console.log('TOP 30 MODULES:');
sized.slice(0, 30).forEach((m, i) => {
    const pct = (m.size / total * 100).toFixed(1);
    console.log(`  ${String(i + 1).padStart(2)}. ${m.id} — ${(m.size / 1024).toFixed(1)} KB (${pct}%)`);
});

// Group by directory (2 levels deep under src/)
console.log('');
console.log('BY DIRECTORY:');
const dirs = {};
sized.forEach(m => {
    const parts = m.id.split('/');
    // e.g. src/core/renderer/Foo.js → src/core/renderer
    let dir;
    if (parts.length >= 4) {
        dir = parts.slice(0, 4).join('/');
    } else if (parts.length >= 3) {
        dir = parts.slice(0, 3).join('/');
    } else {
        dir = parts[0];
    }
    dirs[dir] = (dirs[dir] || 0) + m.size;
});
Object.entries(dirs)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, size]) => {
        console.log(`  ${dir} — ${(size / 1024).toFixed(1)} KB (${(size / total * 100).toFixed(1)}%)`);
    });

await bundle.close();
})();
