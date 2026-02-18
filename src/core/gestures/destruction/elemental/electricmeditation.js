/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Meditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricmeditation gesture - electric mandala with charge pulse
 * @module gestures/destruction/elemental/electricmeditation
 *
 * VISUAL DIAGRAM:
 *         ◎   ◎
 *       ◎       ◎          ← 5 lightning-rings in mandala pattern
 *         ◎ ★ ◎              1 center + 4 outer
 *       ◎       ◎            camera-facing, charge pulse
 *         ◎   ◎
 *
 * CONCEPT: Following the firemeditation pattern with electric aesthetics.
 * A mandala of lightning-rings — controlled, focused energy. Where fire
 * meditation is warm and void meditation is consuming, electric meditation
 * is PRECISE and CRACKLING. Subtle charge flicker with steady pulse.
 *
 * FEATURES:
 * - 5 lightning-rings in mandala formation (1 center + 4 outer)
 * - Camera-facing orientation
 * - Synchronized charge pulse (slightly faster than fire)
 * - Alternating rotation directions
 * - Subtle step-based flicker
 * - Long 4000ms duration
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICMEDITATION_CONFIG = {
    name: 'electricmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Electric mandala — controlled charge energy in meditative focus',
    duration: 4000,
    beats: 4,
    intensity: 0.7,
    category: 'powered',
    charge: 0.5,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'easeInOut',
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.8,
            endDiameter: 1.8,
            orientation: 'camera'
        },
        formation: {
            type: 'mandala',
            count: 5,
            radius: 0.5,
            arcOffset: 45,
            scales: [1.0, 0.6, 0.6, 0.6, 0.6]
        },
        count: 5,
        scale: 1.2,
        models: ['lightning-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.8,
            stagger: 0,
            enter: { type: 'fade', duration: 0.5, easing: 'easeInOut' },
            exit: { type: 'fade', duration: 0.4, easing: 'easeInOut' },
            procedural: { scaleSmoothing: 0.15, geometryStability: true },
            // Charge pulse — slightly faster than fire for electric energy
            pulse: { amplitude: 0.12, frequency: 2.0, easing: 'easeInOut' },
            flicker: { intensity: 0.1, rate: 6, pattern: 'step' },
            emissive: { min: 0.8, max: 1.5, frequency: 2.0, pattern: 'sine' },
            cutout: {
                strength: 0.6,
                primary: { pattern: 4, scale: 2.0, weight: 1.0 },
                secondary: { pattern: 6, scale: 1.5, weight: 0.5 },
                blend: 'add',
                travel: 'angular',
                travelSpeed: 0.8,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 1.0,
                geometricMask: { type: 'distance', core: 0.1, tip: 0.3 }
            },
            grain: {
                type: 3,
                strength: 0.35,
                scale: 0.4,
                speed: 0.8,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'smoke',
                targets: null,
                anchor: 'above',
                intensity: 0.2,
                sizeScale: 0.6,
                speedScale: 0.5,
                progressCurve: 'sustain',
            }],
            rotate: [
                { axis: 'z', rotations: 0.35, phase: 0 },
                { axis: 'z', rotations: -0.3, phase: 0 },
                { axis: 'z', rotations: 0.25, phase: 0 },
                { axis: 'z', rotations: -0.3, phase: 0 },
                { axis: 'z', rotations: 0.35, phase: 0 }
            ],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: -5,
            modelOverrides: {
                'lightning-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.85,
                        arcSpeed: 0.6,
                        arcCount: 2
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [0.5, 0.7, 1.0],        // Electric blue
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.9,
    glowFlickerRate: 3,
    scaleVibration: 0.005,
    scaleFrequency: 2.0,
    scaleGrowth: 0,
    rotationEffect: false
};

export default buildElectricEffectGesture(ELECTRICMEDITATION_CONFIG);
