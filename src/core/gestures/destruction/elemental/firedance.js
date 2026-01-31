/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firedance Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firedance gesture - vertical flame rings dancing upward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firedance
 * @complexity ⭐⭐⭐ Advanced
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
 * - 3 flame rings with vertical orientation
 * - Rings travel from bottom to top
 * - Standing rings create dancing/swaying effect
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Celebratory fire effects
 * - Dancing flame auras
 * - Rhythmic fire displays
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firedance gesture configuration
 * Vertical flame rings dancing and rising around the mascot
 */
const FIREDANCE_CONFIG = {
    name: 'firedance',
    emoji: '💃',
    type: 'blending',
    description: 'Vertical flame rings dancing and rising',
    duration: 3000,
    beats: 5,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.7,

    // 3D Element spawning - vertical dancing rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.8,
            endScale: 2.2,
            startDiameter: 1.6,
            endDiameter: 2.4,
            ringOrientation: 'vertical'  // Standing rings for dance effect
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.0,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.12,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.5,
                    peak: 0.75,
                    end: 0.55,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.35,
                rate: 14,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.1,
                frequency: 5,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.0,
                max: 2.2,
                frequency: 6,
                pattern: 'sine'
            },
            rotate: {
                axis: 'y',
                speed: 1.5,
                oscillate: false
            },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 11,
            modelOverrides: {
                'flame-ring': {
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

    // Mesh effects
    flickerFrequency: 12,
    flickerAmplitude: 0.012,
    flickerDecay: 0.15,
    glowColor: [1.0, 0.5, 0.15],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 10,
    scaleVibration: 0.018,
    scaleFrequency: 4,
    scaleGrowth: 0.025,
    rotationEffect: true,
    rotationSpeed: 0.4
};

/**
 * Firedance gesture - vertical flame rings dancing upward.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 flame-ring models travel from bottom to top
 * - Rings are VERTICAL (ringOrientation: 'vertical') for dance effect
 * - 120° arcOffset spreads rings around the mascot
 */
export default buildFireEffectGesture(FIREDANCE_CONFIG);
