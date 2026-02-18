/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Pillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightpillar gesture - vertical column of stacked light rings
 * @module gestures/destruction/elemental/lightpillar
 *
 * VISUAL DIAGRAM:
 *        ◎ ◎ ◎         TOP — stacked rings glow
 *        ◎ ◎ ◎
 *        ◎ ◎ ◎         ← Pillar of divine light
 *         ★
 *        /|\
 *
 * FEATURES:
 * - 5 light-rings stacked vertically in a column
 * - Uniform diameter (no funnel) — divine pillar from heaven
 * - Slow synchronized rotation — stately, majestic
 * - SPIRAL + EMBERS cutout for heavenly effect
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTPILLAR_CONFIG = {
    name: 'lightpillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Vertical column of stacked light rings — pillar of divine radiance',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    radiance: 0.8,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'linear',
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.2,
            endDiameter: 1.2,        // Uniform — pillar, not funnel
            orientation: 'flat'
        },
        formation: {
            type: 'stack',
            count: 5,
            spacing: 0.30,
            phaseOffset: 0.04
        },
        count: 5,
        scale: 1.1,
        models: ['sun-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.55,
            stagger: 0.04,
            enter: { type: 'scale', duration: 0.12, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.06, frequency: 2, easing: 'easeInOut', sync: 'global' },
            emissive: { min: 1.0, max: 2.2, frequency: 2, pattern: 'sine' },
            rotate: { axis: 'z', rotations: 0.4, phase: 0 },
            cutout: {
                strength: 0.55,
                primary: { pattern: 6, scale: 1.0, weight: 0.8 },   // SPIRAL
                secondary: { pattern: 5, scale: 1.5, weight: 0.4 }, // EMBERS
                blend: 'add',
                travel: 'linear',
                travelSpeed: 1.2,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
            },
            grain: {
                type: 3, strength: 0.15, scale: 0.2, speed: 0.8, blend: 'multiply'
            },
            atmospherics: [{
                preset: 'firefly',
                targets: ['sun-ring'],
                anchor: 'above',
                intensity: 0.4,
                sizeScale: 1.0,
                progressCurve: 'sustain',
            }],
            scaleVariance: 0.05,
            lifetimeVariance: 0.05,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'sun-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.9,
                        arcSpeed: 0.4,
                        arcCount: 2
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.95, 0.75],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.5,
    glowFlickerRate: 2,
    scaleVibration: 0.006,
    scaleFrequency: 2,
    scalePulse: true
};

export default buildLightEffectGesture(LIGHTPILLAR_CONFIG);
