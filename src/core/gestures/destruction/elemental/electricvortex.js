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
 *        ╲│╱           ← 2 rings at 180° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 2 lightning-rings in spiral formation (180° apart)
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
            endDiameter: 1.6,
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 2,
            spacing: 0,
            arcOffset: 180,
            phaseOffset: 0
        },
        count: 2,
        scale: 2.0,
        models: ['lightning-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.7,
            stagger: 0.02,
            enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            flicker: {
                intensity: 0.35,
                rate: 14,
                pattern: 'random'
            },
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
            // Per-gesture atmospheric particles: ionized air from vortex
            atmospherics: [{
                preset: 'ozone',
                targets: null,
                anchor: 'around',
                intensity: 0.2,
                sizeScale: 1.2,
                progressCurve: 'sustain',
            }],
            flash: {
                events: [
                    { at: 0.20, intensity: 2.0 },
                    { at: 0.45, intensity: 3.0 },
                    { at: 0.60, intensity: 1.5 }
                ],
                decay: 0.02
            },
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
