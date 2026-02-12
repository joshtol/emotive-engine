/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electrichelix gesture - DNA-style double helix of lightning rings
 * @module gestures/destruction/elemental/electrichelix
 *
 * VISUAL DIAGRAM:
 *      ⚡    ⚡
 *        ╲╱         ← Double helix of 2 lightning rings
 *        ╱╲           2 strands intertwining upward
 *      ⚡  ★ ⚡
 *
 * FEATURES:
 * - 2 lightning-rings in double helix (strands=2)
 * - DNA-like intertwining pattern ascending
 * - WAVES + SPIRAL cutout for energy flow
 * - Angular travel for rotating patterns
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICHELIX_CONFIG = {
    name: 'electrichelix',
    emoji: '🧬',
    type: 'blending',
    description: 'Double helix of lightning rings ascending',
    duration: 2000,
    beats: 3,
    intensity: 1.2,
    category: 'powered',

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
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 2,
            strands: 2,
            spacing: 0.2,
            arcOffset: 180,
            phaseOffset: 0.05
        },
        count: 2,
        scale: 2.0,
        models: ['lightning-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.06,
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            flicker: {
                intensity: 0.25,
                rate: 12,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.06,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.0,
                max: 2.2,
                frequency: 6,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.8,
                primary: { pattern: 4, scale: 2.0, weight: 1.0 },
                secondary: { pattern: 6, scale: 1.8, weight: 0.6 },
                blend: 'max',
                travel: 'angular',
                travelSpeed: 3.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.1,
                    tip: 0.25
                }
            },
            grain: {
                type: 3,
                strength: 0.08,
                scale: 0.2,
                speed: 1.5,
                blend: 'multiply'
            },
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 16,
            modelOverrides: {
                'lightning-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.6,
                        arcSpeed: 1.5,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 5,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.015
};

export default buildElectricEffectGesture(ELECTRICHELIX_CONFIG);
