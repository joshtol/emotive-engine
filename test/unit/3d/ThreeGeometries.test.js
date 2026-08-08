import { describe, it, expect } from 'vitest';
import { THREE_GEOMETRIES } from '../../../src/3d/geometries/ThreeGeometries.js';

// Both EmotiveMascot3D and Core3DManager resolve an omitted geometry to 'sphere',
// and Core3DManager's "unknown geometry" guard also falls back to
// THREE_GEOMETRIES.sphere. If that key is missing, the guard dereferences undefined
// and construction throws — so a default-configured mascot cannot start at all.
const DEFAULT_GEOMETRY = 'sphere';

describe('THREE_GEOMETRIES', () => {
    it('registers the default geometry used when coreGeometry is omitted', () => {
        expect(THREE_GEOMETRIES[DEFAULT_GEOMETRY]).toBeDefined();
    });

    it('gives the default geometry a usable buffer geometry', () => {
        const config = THREE_GEOMETRIES[DEFAULT_GEOMETRY];
        expect(config.geometry ?? config.geometryLoader).toBeTruthy();
    });

    it('gives every registered geometry either a geometry or a loader', () => {
        for (const [name, config] of Object.entries(THREE_GEOMETRIES)) {
            expect(
                config.geometry ?? config.geometryLoader,
                `geometry "${name}" has neither geometry nor geometryLoader`
            ).toBeTruthy();
        }
    });

    it('gives every registered geometry a particleRadiusMultiplier', () => {
        for (const [name, config] of Object.entries(THREE_GEOMETRIES)) {
            expect(
                typeof config.particleRadiusMultiplier,
                `geometry "${name}" is missing particleRadiusMultiplier`
            ).toBe('number');
        }
    });
});
