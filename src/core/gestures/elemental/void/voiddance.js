/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Dance Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voiddance gesture - vertical void rings dancing upward
 * @module gestures/destruction/elemental/voiddance
 *
 * VISUAL DIAGRAM:
 *         ╱│╲        TOP (expanding)
 *        ╱ │ ╲
 *       │  │  │      ← Vertical rings
 *       │  ★  │        dancing upward
 *       │  │  │      ← 120° apart
 *        ╲ │ ╱
 *         ╲│╱        BOTTOM (converging)
 *
 * FEATURES:
 * - 3 void rings with vertical orientation
 * - Rings travel from bottom to top
 * - DANCING COINS rotation: all spin on Y axis, 120° phase offset
 * - Musical timing: counter-rotating pairs
 * - GPU-instanced rendering via ElementInstancedSpawner
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDDANCE_CONFIG = {
    name: 'voiddance',
    emoji: '💃',
    type: 'blending',
    description: 'Vertical void rings dancing and rising',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'manifestation',
    depth: 0.5,

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
            orientation: 'flat',
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0,
        },
        count: 3,
        scale: 1.0,
        models: ['void-wrap'],
        animation: {
            appearAt: 0.02,
            disappearAt: 0.5,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.08,
                easing: 'easeOut',
            },
            exit: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeIn',
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true,
            },
            pulse: {
                amplitude: 0.1,
                frequency: 5,
                easing: 'easeInOut',
            },
            emissive: {
                min: 0.3,
                max: 0.8,
                frequency: 6,
                pattern: 'sine',
            },
            cutout: {
                strength: 0.45,
                primary: { pattern: 6, scale: 2.0, weight: 1.0 }, // SPIRAL
                secondary: { pattern: 7, scale: 1.5, weight: 0.6 }, // DISSOLVE
                blend: 'add',
                travel: 'spiral',
                travelSpeed: 2.5,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.12,
                    tip: 0.28,
                },
                trailDissolve: {
                    enabled: true,
                    offset: -0.8,
                    softness: 2.0,
                },
            },
            atmospherics: [
                {
                    preset: 'darkness',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 1.2,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.4,
                    centrifugal: { speed: 0.5, tangentialBias: 0.5 },
                },
            ],
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -2, phase: 60 },
                { axis: 'y', rotations: 3, phase: 120 },
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 3,
            modelOverrides: {
                'void-wrap': {
                    shaderAnimation: {
                        type: 1, // ROTATING_ARC
                        arcWidth: 0.5,
                        arcSpeed: 2.0, // Moderate — rhythmic dance
                        arcCount: 2,
                    },
                    orientationOverride: 'flat',
                },
            },
        },
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    glowColor: [0.3, 0.15, 0.4],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.65,
    glowFlickerRate: 2,
    dimStrength: 0.2,
    scaleVibration: 0.018,
    scaleFrequency: 4,
    scalePulse: true,
    rotationDrift: 0.005,
};

export default buildVoidEffectGesture(VOIDDANCE_CONFIG);
