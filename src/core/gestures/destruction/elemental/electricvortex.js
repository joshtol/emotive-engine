/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricvortex gesture - lightning tornado spiraling around mascot
 * @module gestures/destruction/elemental/electricvortex
 *
 * VISUAL DIAGRAM:
 *        ╱│╲           TOP (wider)
 *       │ │ │
 *      │  ★  │         ← Horizontal lightning rings
 *       │ │ │            spinning in funnel
 *        ╲│╱           ← 3 rings at 120° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 3 lightning-rings in spiral formation (120° apart)
 * - Horizontal orientation — tornado funnel shape
 * - Narrower at bottom, wider at top
 * - STREAKS + VORONOI cutout for electric vortex
 * - Trail dissolve for organic fade
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICVORTEX_CONFIG = {
    name: 'electricvortex',
    emoji: '🌀',
    type: 'blending',
    description: 'Lightning tornado spiraling around mascot',
    duration: 1500,
    beats: 5,
    intensity: 1.4,
    category: 'powered',

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.2,
            endScale: 1.5,
            startDiameter: 0.6,
            endDiameter: 2.0,
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.5,
        models: ['lightning-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.1 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.12, frequency: 6, easing: 'easeInOut' },
            emissive: { min: 1.0, max: 2.0, frequency: 5, pattern: 'sine' },
            cutout: {
                strength: 0.5,
                primary: { pattern: 1, scale: 1.2, weight: 0.6 },
                secondary: { pattern: 3, scale: 0.8, weight: 0.4 },
                blend: 'add',
                travel: 'angular',
                travelSpeed: 2.5,
                strengthCurve: 'bell',
                trailDissolve: {
                    enabled: true,
                    offset: -0.4,
                    softness: 1.2
                }
            },
            grain: { type: 3, strength: 0.2, scale: 0.3, speed: 2.5, blend: 'multiply' },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 12,
            modelOverrides: {
                'lightning-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,
                        arcSpeed: 5.0,
                        arcCount: 1
                    },
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.1 },
                            y: { expand: false, rate: 0.3 },
                            z: { expand: true, rate: 1.1 }
                        }
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    glowColor: [0.4, 0.85, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.2,
    glowFlickerRate: 6,
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scaleGrowth: 0.03,
    scalePulse: true,
    rotationDrift: 0.02
};

export default buildElectricEffectGesture(ELECTRICVORTEX_CONFIG);
