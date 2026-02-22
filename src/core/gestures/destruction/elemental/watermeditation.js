/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watermeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watermeditation gesture - relay arc energy flow through 3 vertical rings
 * @module gestures/destruction/elemental/watermeditation
 *
 * CONCEPT: Three camera-facing splash-rings stacked vertically (bottom → center → top).
 * Energy flows upward through the rings sequentially via relay arc handoff.
 * Slow rotation and breathing pulse create a meditative, centered feel.
 *
 * Uses the relay arc system (aRandomSeed >= 100 encoding) for per-instance arc control.
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

// Shared animation config for all 3 rings
const SHARED_ANIMATION = {
    appearAt: 0.0,
    disappearAt: 0.7,
    enter: { type: 'fade', duration: 0.2, easing: 'easeInOut' },
    exit: { type: 'fade', duration: 0.25, easing: 'easeInOut' },
    emissive: { min: 0.6, max: 1.0, frequency: 1.5, pattern: 'sine' },
    pulse: { amplitude: 0.08, frequency: 1.5, easing: 'easeInOut' },
    cutout: {
        strength: 0.5,
        primary: { pattern: 0, scale: 0.8, weight: 1.0 },
        secondary: { pattern: 1, scale: 0.6, weight: 0.5 },
        blend: 'multiply',
        travel: 'angular',
        travelSpeed: 0.4,
        strengthCurve: 'bell',
        bellPeakAt: 0.5,
        bellWidth: 1.0
    },
    grain: { type: 3, strength: 0.15, scale: 0.3, speed: 0.8, blend: 'multiply' },
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

const WATERMEDITATION_CONFIG = {
    name: 'watermeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Meditative water relay — energy flows upward through three aligned rings',
    duration: 2500,
    beats: 4,
    intensity: 0.7,
    category: 'emanating',
    turbulence: 0.1,

    spawnMode: [
        // Ring A — bottom — relay 0, slow CW
        {
            type: 'anchor',
            anchor: { ...SHARED_ANCHOR, offset: { x: 0, y: -0.3, z: 0 } },
            count: 1,
            scale: 1.5,
            sizeVariance: 0,
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: 0.3 }],
                modelOverrides: {
                    'splash-ring': {
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
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: -0.25 }],
                modelOverrides: {
                    'splash-ring': {
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
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: 0.2 }],
                modelOverrides: {
                    'splash-ring': {
                        arcPhase: 4.19,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.4, 0.7, 1.0],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.9,
    glowFlickerRate: 2,
    scaleVibration: 0.004,
    scaleFrequency: 1.5,
    scaleGrowth: 0,
    tremor: 0.001,
    tremorFrequency: 1,
    decayRate: 0.2
};

export default buildWaterEffectGesture(WATERMEDITATION_CONFIG);
