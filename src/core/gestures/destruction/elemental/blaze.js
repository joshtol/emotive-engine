/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Blaze Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Blaze gesture - flagship fire aura with pulsing flame star
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/blaze
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *               ✴️                ← Layer 1: Varied 5-point flame star
 *           ✦  ✦  ✦  ✦            ← Layer 2: Rising wisps
 *          · · · · · · ·           ← Layer 3: Base ember glow
 *
 * FEATURES:
 * - THREE SPAWN LAYERS for flagship fire effect
 * - Layer 1: Pulsing flame-tongue star with varied sizes/speeds (hero)
 * - Layer 2: Rising flame-wisps from below
 * - Layer 3: Base ember-cluster glow
 * - Mascot is SOURCE of fire (radiating category)
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Power-up fire aura
 * - Flagship fire effect
 * - Intense controlled burning
 * - Fire mastery display
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Blaze gesture configuration
 * Flagship fire aura with pulsing flame star
 */
const BLAZE_CONFIG = {
    name: 'blaze',
    emoji: '🔆',
    type: 'blending',
    description: 'Flagship fire aura with pulsing flame star',
    duration: 2000,
    beats: 4,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.75,

    // THREE LAYERS for flagship fire effect
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Pulsing flame-tongue star (the hero element)
        // 5 flame-tongues in a star pattern with varied sizes and speeds
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 0.1,
                radius: 0.2,                    // Tight cluster at center
                plane: 'horizontal',
                orientation: 'radial'           // Point outward like star rays
            },
            formation: {
                type: 'ring',
                count: 5,
                startAngle: 0
            },
            count: 5,
            scale: 1.6,
            models: ['flame-tongue'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.2,
                    easing: 'easeInCubic',
                    burstScale: 1.3
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.6,
                        peak: 0.85,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.2,
                    rate: 8,
                    pattern: 'sine'
                },
                // Strong pulsing for dramatic star effect
                pulse: {
                    amplitude: 0.35,
                    frequency: 3,
                    easing: 'easeInOut',
                    perElement: true              // Each pulses independently
                },
                emissive: {
                    min: 2.5,
                    max: 4.5,
                    frequency: 3,
                    pattern: 'sine'
                },
                // Varied rotation speeds for each star point
                rotate: [
                    { axis: 'y', rotations: 2.0, phase: 0 },
                    { axis: 'y', rotations: 1.2, phase: 72 },
                    { axis: 'y', rotations: 1.8, phase: 144 },
                    { axis: 'y', rotations: 1.0, phase: 216 },
                    { axis: 'y', rotations: 1.5, phase: 288 }
                ],
                // Varied scales for each star point
                scalePerElement: [1.0, 0.7, 0.85, 0.6, 0.75],
                blending: 'additive',
                renderOrder: 16
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Rising flame wisps
        // Small flames rising from below creating upward energy
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: -0.3,               // Start below center
                radius: 0.7,
                plane: 'horizontal',
                orientation: 'vertical'
            },
            formation: {
                type: 'ring',
                count: 8,
                startAngle: 22.5
            },
            count: 8,
            scale: 0.5,
            models: ['flame-wisp'],
            animation: {
                appearAt: 0.08,
                disappearAt: 0.75,
                stagger: 0.04,
                enter: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.4,
                        peak: 0.65,
                        end: 0.3,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.3,
                    rate: 10,
                    pattern: 'random'
                },
                emissive: {
                    min: 1.2,
                    max: 2.2,
                    frequency: 4,
                    pattern: 'sine'
                },
                // Rise upward dramatically
                drift: {
                    speed: 0.6,
                    distance: 1.0,
                    direction: { x: 0, y: 1, z: 0 },
                    easing: 'easeOutQuad'
                },
                scaleVariance: 0.25,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 12
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Base ember glow
        // Ground-level ambient heat
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: -0.4,               // At base
                radius: 1.3,
                plane: 'horizontal',
                orientation: 'camera'
            },
            formation: {
                type: 'ring',
                count: 8,
                startAngle: 0
            },
            count: 8,
            scale: 0.45,
            models: ['ember-cluster'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.90,
                stagger: 0.03,
                enter: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.1,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.35,
                        peak: 0.55,
                        end: 0.3,
                        curve: 'sine'
                    }
                },
                flicker: {
                    intensity: 0.2,
                    rate: 5,
                    pattern: 'random'
                },
                pulse: {
                    amplitude: 0.12,
                    frequency: 2,
                    easing: 'easeInOut',
                    perElement: true
                },
                emissive: {
                    min: 0.8,
                    max: 1.5,
                    frequency: 2,
                    pattern: 'sine'
                },
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 10
            }
        }
    ],

    // Mesh effects - powerful sustained glow
    flickerFrequency: 4,
    flickerAmplitude: 0.008,
    flickerDecay: 0.2,
    glowColor: [1.0, 0.55, 0.12],    // Hot orange
    glowIntensityMin: 1.5,
    glowIntensityMax: 3.0,
    glowFlickerRate: 5,
    scaleVibration: 0.015,
    scaleFrequency: 2,
    scalePulse: true,
    scaleGrowth: 0.03,
    hover: true,
    hoverAmount: 0.01
};

/**
 * Blaze gesture - flagship fire aura with pulsing flame star.
 *
 * Uses THREE SPAWN LAYERS:
 * - Layer 1: 5 flame-tongues in star pattern with varied sizes/speeds (hero)
 * - Layer 2: 8 rising flame-wisps from below
 * - Layer 3: 8 ember-clusters as base glow
 *
 * Creates dramatic power aura with clear visual hierarchy:
 * base embers → rising wisps → central varied flame star.
 */
export default buildFireEffectGesture(BLAZE_CONFIG);
