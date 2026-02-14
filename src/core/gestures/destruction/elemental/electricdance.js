/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Dance Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricdance gesture - vertical lightning rings dancing and rising
 * @module gestures/destruction/elemental/electricdance
 *
 * VISUAL DIAGRAM:
 *          ⚡↑
 *        ⚡ ★ ⚡       ← 3 vertical rings at 120° spiral offset
 *          ⚡↑           Rising upward with spinning
 *
 * FEATURES:
 * - 3 lightning-rings in spiral formation (120° apart)
 * - Vertical orientation, traveling bottom to top
 * - Per-element rotation with alternating directions
 * - STREAKS + CRACKS cutout for branching energy
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICDANCE_CONFIG = {
    name: 'electricdance',
    emoji: '💃',
    type: 'blending',
    description: 'Vertical lightning rings dancing and rising',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'powered',

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.4,
            endScale: 1.8,
            startDiameter: 1.3,
            endDiameter: 2.0,
            orientation: 'vertical'
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
            appearAt: 0.02,
            disappearAt: 0.5,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.08,
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
                intensity: 0.35,
                rate: 14,
                pattern: 'random'
            },
            pulse: { amplitude: 0.1, frequency: 5, easing: 'easeInOut' },
            emissive: { min: 1.0, max: 2.2, frequency: 6, pattern: 'sine' },
            cutout: {
                strength: 0.75,
                primary: { pattern: 6, scale: 2.0, weight: 1.0 },
                secondary: { pattern: 7, scale: 1.5, weight: 0.6 },
                blend: 'add',
                travel: 'spiral',
                travelSpeed: 2.5,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.12,
                    tip: 0.28
                }
            },
            grain: {
                type: 3,
                strength: 0.06,
                scale: 0.15,
                speed: 1.0,
                blend: 'multiply'
            },
            // Per-gesture atmospheric particles: ionized air wisps
            atmospherics: [{
                preset: 'ozone',
                targets: null,
                anchor: 'around',
                intensity: 0.3,
                sizeScale: 1.0,
                progressCurve: 'sustain',
            }],
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -2, phase: 90 }
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 11,
            modelOverrides: {
                'lightning-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 1.5, arcCount: 1 },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Minimal jitter
    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    // Glow - bright cyan pulsing
    glowColor: [0.3, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scaleGrowth: 0.01,
    scalePulse: true,
    rotationDrift: 0.01
};

export default buildElectricEffectGesture(ELECTRICDANCE_CONFIG);
