/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lighthelix gesture - double helix of light rings spiraling upward
 * @module gestures/destruction/elemental/lighthelix
 *
 * VISUAL DIAGRAM:
 *        ○   ●        TOP
 *       ●     ○
 *        ○   ●        ← Two interleaved
 *       ●     ○          spirals rising
 *        ○   ●
 *       ●     ○       BOTTOM
 *
 * FEATURES:
 * - 6 sun-ring elements in double helix formation (strands: 2)
 * - DNA-style interleaved spiral ascending
 * - Matches firehelix pattern with light-appropriate visuals
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTHELIX_CONFIG = {
    name: 'lighthelix',
    emoji: '🧬',
    type: 'blending',
    description: 'Double helix of light rings spiraling upward',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    radiance: 0.7,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeInOut',
            startScale: 0.9,
            endScale: 1.1,
            startDiameter: 1.8,
            endDiameter: 2.0,
            orientation: 'vertical',
        },
        formation: {
            type: 'spiral',
            count: 6,
            strands: 2,
            spacing: 0.2,
            arcOffset: 120,
            phaseOffset: 0.05,
        },
        count: 6,
        scale: 0.7,
        models: ['sun-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.06,
            enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.5, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.06, frequency: 4, easing: 'easeInOut' },
            emissive: { min: 1.2, max: 2.5, frequency: 6, pattern: 'sine' },
            cutout: {
                strength: 0.8,
                primary: { pattern: 5, scale: 2.0, weight: 1.0 }, // EMBERS - sparkly light
                secondary: { pattern: 0, scale: 1.8, weight: 0.6 }, // CELLULAR - organic breakup
                blend: 'max',
                travel: 'angular',
                travelSpeed: 3.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: { type: 'distance', core: 0.1, tip: 0.25 },
            },
            grain: { type: 3, strength: 0.05, scale: 0.2, speed: 1.0, blend: 'multiply' },
            atmospherics: [
                {
                    preset: 'firefly',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.3,
                    sizeScale: 0.6,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.5,
                    centrifugal: { speed: 0.8, tangentialBias: 0.4 },
                },
            ],
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'sun-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 1.5, arcCount: 1 },
                    orientationOverride: 'vertical',
                },
            },
        },
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.92, 0.6],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.4,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.01,
};

export default buildLightEffectGesture(LIGHTHELIX_CONFIG);
