/**
 * Elemental Gesture Factory Tests
 * Tests that each element's factory produces valid gesture objects
 * with correct structure and working 3d.evaluate() functions
 */

import { describe, it, expect } from 'vitest';
import { buildFireEffectGesture } from '../../../../src/core/gestures/elemental/fire/fireEffectFactory.js';
import { buildWaterEffectGesture } from '../../../../src/core/gestures/elemental/water/waterEffectFactory.js';
import { buildIceEffectGesture } from '../../../../src/core/gestures/elemental/ice/iceEffectFactory.js';
import { buildElectricEffectGesture } from '../../../../src/core/gestures/elemental/electric/electricEffectFactory.js';

// Minimal valid config for each factory
const FIRE_CONFIG = {
    name: 'test-fire',
    emoji: '🔥',
    type: 'fire',
    description: 'Test fire gesture',
    duration: 2000,
    beats: 4,
    intensity: 0.8,
    category: 'burning',
    flickerAmplitude: 0.02,
    flickerFrequency: 8,
    flickerDecay: 0.15,
    riseAmount: 0.01,
    scalePulse: false,
    scaleFrequency: 3,
    scaleVibration: 0.03,
    heatExpansion: 0.01,
    glowIntensityMin: 0.3,
    glowIntensityMax: 1.2,
    glowFlickerRate: 6,
    temperature: 0.8
};

const WATER_CONFIG = {
    name: 'test-water',
    emoji: '💧',
    type: 'water',
    description: 'Test water gesture',
    duration: 2500,
    beats: 4,
    intensity: 0.7,
    category: 'ambient',
    flowSpeed: 1.0,
    turbulence: 0.5,
    splashAmount: 0,
    waveAmplitude: 0.02,
    waveFrequency: 2,
    rippleRate: 3,
    glowIntensityMin: 0.1,
    glowIntensityMax: 0.8,
    glowFlickerRate: 2,
    flowDecay: 0.2
};

const ICE_CONFIG = {
    name: 'test-ice',
    emoji: '❄️',
    type: 'ice',
    description: 'Test ice gesture',
    duration: 3000,
    beats: 4,
    intensity: 0.6,
    category: 'crystalline',
    freezeRate: 0.8,
    shatterChance: 0,
    crystalGrowth: 0.02,
    frostSpread: 0.5,
    crackIntensity: 0.3,
    glowIntensityMin: 0.2,
    glowIntensityMax: 0.7,
    glowFlickerRate: 1,
    meltDecay: 0.1
};

const ELECTRIC_CONFIG = {
    name: 'test-electric',
    emoji: '⚡',
    type: 'electric',
    description: 'Test electric gesture',
    duration: 1500,
    beats: 4,
    intensity: 0.9,
    category: 'discharge',
    arcCount: 3,
    boltFrequency: 6,
    sparkDensity: 0.5,
    chargeBuildup: 0.3,
    flickerRate: 10,
    jitterAmplitude: 0.02,
    jitterFrequency: 15,
    jitterDecay: 0.15,
    scaleVibration: 0.03,
    scaleFrequency: 40,
    scalePulse: false,
    heatExpansion: 0,
    glowIntensityMin: 0.4,
    glowIntensityMax: 1.5,
    glowFlickerRate: 8
};

/**
 * Common gesture shape validation
 */
function expectValidGestureShape(gesture, config) {
    // Top-level properties
    expect(gesture.name).toBe(config.name);
    expect(gesture.emoji).toBe(config.emoji);
    expect(gesture.type).toBe(config.type);
    expect(gesture.description).toBe(config.description);

    // Rhythm config
    expect(gesture.rhythm).toBeDefined();
    expect(gesture.rhythm.enabled).toBe(true);
    expect(['beat', 'phrase']).toContain(gesture.rhythm.syncMode);
    expect(gesture.rhythm.amplitudeSync).toBeDefined();

    // 3D evaluation
    expect(gesture['3d']).toBeDefined();
    expect(typeof gesture['3d'].evaluate).toBe('function');
}

/**
 * Common 3d.evaluate() output validation
 */
function expectValidEvaluateOutput(result) {
    // Position
    expect(result.position).toBeDefined();
    expect(result.position).toHaveLength(3);
    result.position.forEach(v => expect(typeof v).toBe('number'));

    // Rotation
    expect(result.rotation).toBeDefined();
    expect(result.rotation).toHaveLength(3);

    // Scale
    expect(typeof result.scale).toBe('number');
    expect(Number.isNaN(result.scale)).toBe(false);

    // Glow
    expect(typeof result.glowIntensity).toBe('number');
    expect(typeof result.glowBoost).toBe('number');
}

describe('Elemental Gesture Factories', () => {
    describe('buildFireEffectGesture', () => {
        it('should produce valid gesture shape', () => {
            const gesture = buildFireEffectGesture(FIRE_CONFIG);
            expectValidGestureShape(gesture, FIRE_CONFIG);
        });

        it('should produce valid 3d.evaluate output at all progress points', () => {
            const gesture = buildFireEffectGesture(FIRE_CONFIG);

            [0, 0.25, 0.5, 0.75, 1.0].forEach(progress => {
                const result = gesture['3d'].evaluate(progress, {});
                expectValidEvaluateOutput(result);

                // Fire-specific: fireOverlay
                expect(result.fireOverlay).toBeDefined();
                expect(result.fireOverlay.duration).toBe(FIRE_CONFIG.duration);
                expect(result.fireOverlay.category).toBe('burning');
                expect(result.fireOverlay.progress).toBe(progress);
            });
        });

        it('should decay effect in final phase', () => {
            const gesture = buildFireEffectGesture(FIRE_CONFIG);

            const mid = gesture['3d'].evaluate(0.5, {});
            const end = gesture['3d'].evaluate(0.99, {});

            // At end, overlay strength should be near zero
            expect(end.fireOverlay.strength).toBeLessThan(mid.fireOverlay.strength);
        });

        it('should distinguish burning vs radiating categories', () => {
            const burning = buildFireEffectGesture({ ...FIRE_CONFIG, category: 'burning' });
            const radiating = buildFireEffectGesture({ ...FIRE_CONFIG, category: 'radiating', scalePulse: true });

            const bResult = burning['3d'].evaluate(0.5, {});
            const rResult = radiating['3d'].evaluate(0.5, {});

            expect(bResult.fireOverlay.category).toBe('burning');
            expect(rResult.fireOverlay.category).toBe('radiating');
            // Radiating uses smooth curve
            expect(burning.rhythm.amplitudeSync.curve).toBe('sharp');
            expect(radiating.rhythm.amplitudeSync.curve).toBe('smooth');
        });
    });

    describe('buildWaterEffectGesture', () => {
        it('should produce valid gesture shape', () => {
            const gesture = buildWaterEffectGesture(WATER_CONFIG);
            expectValidGestureShape(gesture, WATER_CONFIG);
        });

        it('should produce valid 3d.evaluate output', () => {
            const gesture = buildWaterEffectGesture(WATER_CONFIG);

            [0, 0.5, 1.0].forEach(progress => {
                const result = gesture['3d'].evaluate(progress, {});
                expectValidEvaluateOutput(result);

                // Water-specific: waterOverlay
                expect(result.waterOverlay).toBeDefined();
                expect(result.waterOverlay.duration).toBe(WATER_CONFIG.duration);
            });
        });
    });

    describe('buildIceEffectGesture', () => {
        it('should produce valid gesture shape', () => {
            const gesture = buildIceEffectGesture(ICE_CONFIG);
            expectValidGestureShape(gesture, ICE_CONFIG);
        });

        it('should produce valid 3d.evaluate output', () => {
            const gesture = buildIceEffectGesture(ICE_CONFIG);

            [0, 0.5, 1.0].forEach(progress => {
                const result = gesture['3d'].evaluate(progress, {});
                expectValidEvaluateOutput(result);

                // Ice-specific: iceOverlay
                expect(result.iceOverlay).toBeDefined();
                expect(result.iceOverlay.duration).toBe(ICE_CONFIG.duration);
            });
        });
    });

    describe('buildElectricEffectGesture', () => {
        it('should produce valid gesture shape', () => {
            const gesture = buildElectricEffectGesture(ELECTRIC_CONFIG);
            expectValidGestureShape(gesture, ELECTRIC_CONFIG);
        });

        it('should produce valid 3d.evaluate output', () => {
            const gesture = buildElectricEffectGesture(ELECTRIC_CONFIG);

            [0, 0.5, 1.0].forEach(progress => {
                const result = gesture['3d'].evaluate(progress, {});
                expectValidEvaluateOutput(result);

                // Electric-specific: electricOverlay
                expect(result.electricOverlay).toBeDefined();
                expect(result.electricOverlay.duration).toBe(ELECTRIC_CONFIG.duration);
            });
        });
    });

    describe('Consistency across all factories', () => {
        it('should all return NaN-free position/scale at all progress points', () => {
            const gestures = [
                buildFireEffectGesture(FIRE_CONFIG),
                buildWaterEffectGesture(WATER_CONFIG),
                buildIceEffectGesture(ICE_CONFIG),
                buildElectricEffectGesture(ELECTRIC_CONFIG)
            ];

            gestures.forEach(gesture => {
                for (let p = 0; p <= 1.0; p += 0.1) {
                    const result = gesture['3d'].evaluate(p, {});

                    result.position.forEach((v, i) => {
                        expect(Number.isNaN(v)).toBe(false);
                    });
                    expect(Number.isNaN(result.scale)).toBe(false);
                    expect(Number.isNaN(result.glowIntensity)).toBe(false);
                }
            });
        });
    });
});
