/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Voidmeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidmeditation gesture - relay arc energy flow through 3 vertical rings
 * @module gestures/destruction/elemental/voidmeditation
 *
 * CONCEPT: Three camera-facing void-rings stacked vertically (bottom → center → top).
 * Energy flows upward through the rings sequentially via relay arc handoff.
 * Slow rotation and breathing pulse create a meditative, centered feel.
 *
 * Uses the relay arc system (aRandomSeed >= 100 encoding) for per-instance arc control.
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

// Shared animation config for all 3 rings
const SHARED_ANIMATION = {
    appearAt: 0.0,
    disappearAt: 0.7,
    enter: { type: 'fade', duration: 0.2, easing: 'easeInOut' },
    exit: { type: 'fade', duration: 0.25, easing: 'easeInOut' },
    emissive: { min: 0.4, max: 0.8, frequency: 1.2, pattern: 'sine' },
    pulse: { amplitude: 0.08, frequency: 1.5, easing: 'easeInOut' },
    cutout: {
        strength: 0.5,
        primary: { pattern: 4, scale: 2.0, weight: 1.0 },
        secondary: { pattern: 6, scale: 1.5, weight: 0.5 },
        blend: 'add',
        travel: 'angular',
        travelSpeed: 0.3,
        strengthCurve: 'bell',
        bellPeakAt: 0.5,
        bellWidth: 1.0
    },
    grain: { type: 3, strength: 0.4, scale: 0.5, speed: 0.3, blend: 'multiply' },
    atmospherics: [{
        preset: 'smoke',
        targets: null,
        anchor: 'above',
        intensity: 0.2,
        sizeScale: 0.8,
        progressCurve: 'sustain'
    }],
    renderOrder: 10
};

const SHARED_ANCHOR = {
    landmark: 'center',
    orientation: 'camera',
    cameraOffset: 1.0,
    relativeOffset: true,
    startScale: 1.0,
    endScale: 1.0
};

const VOIDMEDITATION_CONFIG = {
    name: 'voidmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Meditative void relay — entropy flows through three aligned rings',
    duration: 2500,
    beats: 4,
    intensity: 0.7,
    category: 'emanating',
    entropy: 0.3,

    spawnMode: [
        // Ring A — bottom — relay 0, slow CW
        {
            type: 'anchor',
            anchor: { ...SHARED_ANCHOR, offset: { x: 0, y: -0.3, z: 0 } },
            count: 1,
            scale: 1.5,
            sizeVariance: 0,
            models: ['void-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: 0.2 }],
                modelOverrides: {
                    'void-ring': {
                        arcPhase: 0.0,
                        relayIndex: 0,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring B — center — relay 1, slow CCW
        {
            type: 'anchor',
            anchor: { ...SHARED_ANCHOR, offset: { x: 0, y: 0, z: 0 } },
            count: 1,
            scale: 1.5,
            sizeVariance: 0,
            models: ['void-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: -0.15 }],
                modelOverrides: {
                    'void-ring': {
                        arcPhase: 2.09,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring C — top — relay 2, slow CW
        {
            type: 'anchor',
            anchor: { ...SHARED_ANCHOR, offset: { x: 0, y: 0.3, z: 0 } },
            count: 1,
            scale: 1.5,
            sizeVariance: 0,
            models: ['void-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: 0.1 }],
                modelOverrides: {
                    'void-ring': {
                        arcPhase: 4.19,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.3, 0.1, 0.5],
    glowIntensityMin: 0.4,
    glowIntensityMax: 0.8,
    glowFlickerRate: 2,
    scaleVibration: 0.004,
    scaleFrequency: 1.5,
    scaleGrowth: 0,
    tremor: 0.002,
    tremorFrequency: 1.2,
    decayRate: 0.2
};

export default buildVoidEffectGesture(VOIDMEDITATION_CONFIG);
