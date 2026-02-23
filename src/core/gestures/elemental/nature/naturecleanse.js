/**
 * =========================================================================================
 *  +===-+  emotive
 *    **  ENGINE - Naturecleanse Gesture
 *  +-=-=+
 * =========================================================================================
 *
 * @fileoverview Naturecleanse gesture - purifying vine-ring scanning upward
 * @module gestures/destruction/elemental/naturecleanse
 *
 * CONCEPT: A single vine-ring scans from below the mascot to above —
 * a simple, clean upward sweep of nature energy.
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATURECLEANSE_CONFIG = {
    name: 'naturecleanse',
    emoji: '🌿',
    type: 'blending',
    description: 'Purifying scan — a vine-ring sweeps upward through the mascot',
    duration: 2500,
    beats: 4,
    intensity: 0.9,
    category: 'afflicted',
    growth: 0.6,

    spawnMode: [
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'linear',
                startScale: 1.0,
                endScale: 1.0,
                startDiameter: 1.6,
                endDiameter: 1.6,
                diameterUnit: 'mascot',
                orientation: 'flat'
            },
            count: 1,
            scale: 2.0,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.65,
                enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                emissive: { min: 0.8, max: 1.6, frequency: 2.5, pattern: 'sine' },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 6, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 0, scale: 3.0, weight: 0.3 },
                    blend: 'add',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.05, scale: 0.3, speed: 0.3, blend: 'multiply' },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.4,
                    sizeScale: 0.8,
                    progressCurve: 'rampUp',
                }],
                blending: 'normal',
                renderOrder: 15,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'flat'
                    }
                }
            }
        }
    ],

    decayRate: 0.2,
    glowColor: [0.3, 0.85, 0.25],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.2,
    glowFlickerRate: 3,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 2
};

export default buildNatureEffectGesture(NATURECLEANSE_CONFIG);
