/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Natureshield Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Natureshield gesture - gyroscopic vine rings protecting mascot
 * @module gestures/destruction/elemental/natureshield
 *
 * CONCEPT: Six large vine-rings anchored at the mascot center on different axes,
 * each tumbling/flipping on an axis PERPENDICULAR to its plane — true gyroscopic
 * motion. Adjacent rings flip in opposite directions.
 *
 * Ring 1: Flat — flips on X (tumbles front-to-back) CW
 * Ring 2: Vertical (0°) — flips on Y (tumbles around vertical) CCW
 * Ring 3: Vertical (60°) — flips on X CW
 * Ring 4: Vertical (120°) — flips on Y CCW
 * Ring 5: Tilted 45° — flips on X CW
 * Ring 6: Tilted -45° — flips on Y CCW
 *
 * Each ring FLIPS through space rather than spinning in-place like a record.
 * This creates the classic gyroscope / gimbal look.
 *
 * VISUAL DIAGRAM (oblique view):
 *       ╱───╲╱───╲
 *      │╱─╲  ╱─╲ │
 *      ││ ╱★╲ │ ││    ← Six rings tumbling on different axes
 *      │╲─╱  ╲─╱ │       flipping to sweep out a protective sphere
 *       ╲───╱╲───╱
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

// Shared animation for all gyroscopic rings
const SHARED_RING_ANIMATION = {
    disappearAt: 0.9,
    enter: { type: 'scale', duration: 0.15, easing: 'easeOutBack' },
    exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
    procedural: { scaleSmoothing: 0.08, geometryStability: true },
    pulse: { amplitude: 0.03, frequency: 2, easing: 'easeInOut', sync: 'global' },
    emissive: { min: 0.5, max: 1.0, frequency: 2, pattern: 'sine' },
    cutout: {
        strength: 0.4,
        primary: { pattern: 0, scale: 3.0, weight: 1.0 },
        secondary: { pattern: 3, scale: 2.0, weight: 0.3 },
        blend: 'add',
        travel: 'angular',
        travelSpeed: 0.5,
        strengthCurve: 'constant'
    },
    grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.3, blend: 'multiply' },
    blending: 'normal',
};

const NATURESHIELD_CONFIG = {
    name: 'natureshield',
    emoji: '🛡️',
    type: 'blending',
    description: 'Gyroscopic vine cage — six tumbling rings form a protective sphere',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'emanating',
    growth: 0.7,

    spawnMode: [
        // ── Ring 1: Flat — flips on X axis (front-to-back tumble) CW ─────
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'flat',
                bob: { amplitude: 0.008, frequency: 0.3 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                ...SHARED_RING_ANIMATION,
                appearAt: 0.0,
                rotate: { axis: 'x', rotations: 0.75, phase: 0 },
                renderOrder: 6,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.4, arcCount: 2 },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ── Ring 2: Vertical (0°) — flips on Y axis (vertical tumble) CCW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'vertical',
                bob: { amplitude: 0.008, frequency: 0.35 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                ...SHARED_RING_ANIMATION,
                appearAt: 0.03,
                rotate: { axis: 'y', rotations: -0.75, phase: 0 },
                renderOrder: 8,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.45, arcCount: 2 },
                        orientationOverride: 'vertical'
                    }
                }
            }
        },

        // ── Ring 3: Vertical (60°) — flips on X axis CW ─────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'vertical',
                bob: { amplitude: 0.008, frequency: 0.4 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                ...SHARED_RING_ANIMATION,
                appearAt: 0.06,
                rotate: { axis: 'x', rotations: 0.75, phase: 60 },
                renderOrder: 10,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.5, arcCount: 2 },
                        orientationOverride: 'vertical'
                    }
                }
            }
        },

        // ── Ring 4: Vertical (120°) — flips on Y axis CCW ───────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'vertical',
                bob: { amplitude: 0.008, frequency: 0.45 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                ...SHARED_RING_ANIMATION,
                appearAt: 0.09,
                rotate: { axis: 'y', rotations: -0.75, phase: 120 },
                renderOrder: 12,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.45, arcCount: 2 },
                        orientationOverride: 'vertical'
                    }
                }
            }
        },

        // ── Ring 5: Tilted 45° — flips on X axis CW ─────────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'radial',
                bob: { amplitude: 0.008, frequency: 0.38 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                ...SHARED_RING_ANIMATION,
                appearAt: 0.12,
                rotate: { axis: 'x', rotations: 0.75, phase: 45 },
                renderOrder: 14,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.5, arcCount: 2 },
                        orientationOverride: 'radial'
                    }
                }
            }
        },

        // ── Ring 6: Tilted -45° — flips on Y axis CCW ───────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'radial',
                bob: { amplitude: 0.008, frequency: 0.42 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                ...SHARED_RING_ANIMATION,
                appearAt: 0.15,
                rotate: { axis: 'y', rotations: -0.75, phase: -45 },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.2,
                    sizeScale: 0.7,
                    progressCurve: 'sustain',
                }],
                renderOrder: 16,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.55, arcCount: 2 },
                        orientationOverride: 'radial'
                    }
                }
            }
        }
    ],

    glowColor: [0.15, 0.55, 0.15],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.85,
    glowFlickerRate: 2,
    scaleVibration: 0.005,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 2,
    decayRate: 0.2
};

export default buildNatureEffectGesture(NATURESHIELD_CONFIG);
