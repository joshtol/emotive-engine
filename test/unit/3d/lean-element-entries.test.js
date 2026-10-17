import { describe, it, expect, beforeAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ELEMENTS, entryFor, registrationFor, gesturesFor } from '../../../src/3d/elements.js';

// Each `./3d-<element>` entry must register exactly its own element and its own
// gestures, nothing else. The registries are module singletons, so every entry is
// imported into a fresh module graph (vi.resetModules + dynamic import).
//
// History: the first lean electric build was byte-identical to the base 3D build
// because package.json `sideEffects` did not list the registration modules and the
// bundler dropped them. The dist checks below catch that failure mode on the built
// files; the source checks catch a wrong or missing import in an entry.

const ROOT = path.resolve(__dirname, '../../..');
const src = rel => path.join(ROOT, rel);

/** gesture names per element, read from each register module's GESTURES export */
const gestureNames = new Map();

beforeAll(async () => {
    vi.resetModules();
    for (const e of ELEMENTS) {
        const mod = await import(src(gesturesFor(e)));
        gestureNames.set(e.name, mod.GESTURES.map(g => g.name));
    }
});

describe('src/3d/elements.js', () => {
    it('lists eight distinct elements with distinct types', () => {
        expect(ELEMENTS).toHaveLength(8);
        expect(new Set(ELEMENTS.map(e => e.name)).size).toBe(8);
        expect(new Set(ELEMENTS.map(e => e.type)).size).toBe(8);
    });

    it('has an entry, a registration module and a gesture module for every element', () => {
        for (const e of ELEMENTS) {
            for (const rel of [entryFor(e), registrationFor(e), gesturesFor(e)]) {
                expect(fs.existsSync(src(rel)), `${rel} missing`).toBe(true);
            }
        }
    });

    it('is covered by package.json exports, files and sideEffects', () => {
        const pkg = JSON.parse(fs.readFileSync(src('package.json'), 'utf8'));
        for (const e of ELEMENTS) {
            const dist = `./dist/emotive-mascot-3d-${e.name}.js`;
            expect(pkg.exports[`./3d-${e.name}`]?.import, `exports ./3d-${e.name}`).toBe(dist);
            expect(pkg.files, `files ${dist}`).toContain(dist.slice(2));
        }
        // the registration modules must be declared side-effectful or bundlers drop them
        expect(pkg.sideEffects).toContain('src/3d/effects/elements/*.js');
        expect(pkg.sideEffects).toContain('src/core/gestures/elemental/*/register.js');
    });

    it('gives every element a non-empty, disjoint gesture set', () => {
        const seen = new Map();
        for (const e of ELEMENTS) {
            const names = gestureNames.get(e.name);
            expect(names.length, `${e.name} gestures`).toBeGreaterThan(0);
            for (const n of names) {
                expect(seen.has(n), `gesture ${n} in both ${seen.get(n)} and ${e.name}`).toBe(false);
                seen.set(n, e.name);
            }
        }
    });
});

describe.each(ELEMENTS)('entry ./3d-$name', e => {
    let ElementTypeRegistry;
    let registry;

    beforeAll(async () => {
        vi.resetModules();
        await import(src(entryFor(e)));
        ({ ElementTypeRegistry } = await import(src('src/3d/effects/ElementTypeRegistry.js')));
        ({ GESTURE_REGISTRY: registry } = await import(src('src/core/gestures/index.js')));
    });

    it(`registers only the '${e.type}' element type`, () => {
        expect(ElementTypeRegistry.types()).toEqual([e.type]);
    });

    it('registers its own gestures and none of the other elements', () => {
        for (const n of gestureNames.get(e.name)) {
            expect(registry[n], `own gesture ${n}`).toBeDefined();
        }
        for (const other of ELEMENTS) {
            if (other === e) continue;
            for (const n of gestureNames.get(other.name)) {
                expect(registry[n], `${other.name} gesture ${n} leaked into ./3d-${e.name}`).toBeUndefined();
            }
        }
    });
});

describe('built lean bundles (dist)', () => {
    const distFor = e => src(`dist/emotive-mascot-3d-${e.name}.js`);
    const built = ELEMENTS.filter(e => fs.existsSync(distFor(e)));

    it.skipIf(built.length === 0)('each built bundle contains its own element registration and no other', () => {
        for (const e of built) {
            const code = fs.readFileSync(distFor(e), 'utf8');
            expect(code.includes(`models/Elements/${e.modelDir}/`), `./3d-${e.name} lost its registration (sideEffects?)`).toBe(true);
            for (const other of ELEMENTS) {
                if (other === e) continue;
                expect(code.includes(`models/Elements/${other.modelDir}/`), `./3d-${e.name} bundles ${other.name}`).toBe(false);
            }
        }
    });

    it.skipIf(built.length === 0)('each built bundle is smaller than the all-elementals bundle', () => {
        const all = src('dist/emotive-mascot-3d-elementals.js');
        if (!fs.existsSync(all)) return;
        const allSize = fs.statSync(all).size;
        for (const e of built) {
            expect(fs.statSync(distFor(e)).size, `./3d-${e.name}`).toBeLessThan(allSize);
        }
    });
});
