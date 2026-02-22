/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earthmeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthmeditation gesture - relay arc energy flow through 3 vertical rings
 * @module gestures/destruction/elemental/earthmeditation
 *
 * CONCEPT: Three camera-facing earth-rings stacked vertically (bottom → center → top).
 * Energy flows upward through the rings sequentially via relay arc handoff.
 * Slow rotation and breathing pulse create a meditative, centered feel.
 *
 * Uses the relay arc system (aRandomSeed >= 100 encoding) for per-instance arc control.
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

// Shared animation config for all 3 rings
const SHARED_ANIMATION = {
    appearAt: 0.0,
    disappearAt: 0.7,
    enter: { type: 'fade', duration: 0.2, easing: 'easeInOut' },
    exit: { type: 'fade', duration: 0.25, easing: 'easeInOut' },
    emissive: { min: 0.5, max: 0.9, frequency: 1.2, pattern: 'sine' },
    pulse: { amplitude: 0.08, frequency: 1.5, easing: 'easeInOut' },
    cutout: {
        strength: 0.5,
        primary: { pattern: 4, scale: 2.0, weight: 1.0 },
        secondary: { pattern: 6, scale: 1.5, weight: 0.5 },
        blend: 'add',
        travel: 'angular',
        travelSpeed: 0.4,
        strengthCurve: 'bell',
        bellPeakAt: 0.5,
        bellWidth: 1.0
    },
    grain: { type: 3, strength: 0.25, scale: 0.4, speed: 0.4, blend: 'multiply' },
    atmospherics: [{
        preset: 'earth-dust',
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

const EARTHMEDITATION_CONFIG = {
    name: 'earthmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Meditative earth relay — energy flows upward through three aligned rings',
    duration: 2500,
    beats: 4,
    intensity: 0.7,
    category: 'emanating',
    petrification: 0.3,

    spawnMode: [
        // Ring A — bottom — relay 0, slow CW
        {
            type: 'anchor',
            anchor: { ...SHARED_ANCHOR, offset: { x: 0, y: -0.3, z: 0 } },
            count: 1,
            scale: 1.5,
            sizeVariance: 0,
            models: ['earth-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: 0.3 }],
                modelOverrides: {
                    'earth-ring': {
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
            models: ['earth-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: -0.25 }],
                modelOverrides: {
                    'earth-ring': {
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
            models: ['earth-ring'],
            animation: {
                ...SHARED_ANIMATION,
                rotate: [{ axis: 'z', rotations: 0.2 }],
                modelOverrides: {
                    'earth-ring': {
                        arcPhase: 4.19,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.80, 0.55, 0.25],
    glowIntensityMin: 0.3,
    glowIntensityMax: 0.6,
    glowFlickerRate: 2,
    scaleVibration: 0.004,
    scaleFrequency: 1.5,
    scaleGrowth: 0,
    tremor: 0.002,
    tremorFrequency: 1.5,
    decayRate: 0.2
};

export default buildEarthEffectGesture(EARTHMEDITATION_CONFIG);
