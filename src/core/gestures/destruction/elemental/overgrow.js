/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Overgrow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Overgrow gesture - completely covered by growth, consumed by nature
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/overgrow
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Overgrow gesture configuration
 * Dense vegetation completely enveloping the mascot in layered growth
 */
const CONFIG = {
    name: 'overgrow',
    emoji: '🌲',
    type: 'blending',
    description: 'Completely covered by growth, consumed by nature',
    duration: 4000,
    beats: 6,
    intensity: 1.3,
    category: 'transform',
    growth: 1.0,

    // Nature-specific parameters
    coverageRate: 0.6,
    layerCount: 4,
    completeEnvelopment: true,

    // 3D Element spawning - maximum density, multi-model coverage
    spawnMode: {
        type: 'surface',
        pattern: 'shell',
        embedDepth: 0.2,
        cameraFacing: 0.25,
        clustering: 0.15,
        count: 15,
        scale: 1.1,
        models: ['vine-twist', 'vine-cluster', 's-vine', 'thorn-curl'],
        minDistance: 0.1,
        animation: {
            appearAt: 0.05,
            disappearAt: 0.88,
            stagger: 0.03,
            enter: { type: 'grow', duration: 0.1, easing: 'easeOutBack', overshoot: 1.15 },
            exit: { type: 'shrink', duration: 0.15, easing: 'easeInCubic' },
            pulse: { amplitude: 0.08, frequency: 2, easing: 'easeInOut', sync: 'global' },
            emissive: { min: 0.4, max: 0.75, frequency: 2, pattern: 'sine' },
            drift: { direction: 'outward', speed: 0.008, noise: 0.1 },
            rotate: { axis: 'y', speed: 0.008, oscillate: true, range: Math.PI / 12 },
            scaleVariance: 0.2,
            lifetimeVariance: 0.12,
            blending: 'normal',
            renderOrder: 8,
            intensityScaling: { scale: 1.2, emissiveMax: 1.25 }
        }
    },

    // Glow - deep forest green
    glowColor: [0.15, 0.6, 0.2],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.85,
    glowFlickerRate: 2,

    // Scale dynamics - expanding overgrowth
    scaleVibration: 0.02,
    scaleFrequency: 2,
    scaleGrow: 0.08,

    // Organic tremor and sinking
    tremor: 0.003,
    tremorFrequency: 3,
    sinkAmount: 0.005,
    sinkAcceleration: 0.2,

    // Twisting rotation
    rotationTwist: 0.04,
    rotationTwistSpeed: 0.3,

    // Fade out at end
    fadeOut: true,
    fadeStartAt: 0.6,
    fadeEndAt: 0.95,
    fadeCurve: 'smooth',
    decayRate: 0.1,

    // Post-processing
    cutout: {
        primary: { pattern: 'growth', scale: 3.0, blend: 'multiply', travelSpeed: 0.35 },
        secondary: { pattern: 'organic', scale: 5.0, blend: 'overlay', travelSpeed: 0.2 }
    },
    grain: { type: 3, strength: 0.04, blend: 'multiply', speed: 0.4 }
};

export default buildNatureEffectGesture(CONFIG);
