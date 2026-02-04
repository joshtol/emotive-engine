/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Radiate Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Radiate gesture - expanding flame rings radiating outward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/radiate
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *         ═══════            ← Layer 1: Rings at feet level
 *        ╱       ╲
 *       │    ✦    │          ← Layer 2: Fire-burst from center (at 50%)
 *        ╲       ╱
 *         ═══════            ← 3 vertical rings at 120° apart
 *
 * FEATURES:
 * - TWO SPAWN LAYERS (first gesture to use spawn layers!)
 * - Layer 1: 3 flame rings at feet, expanding diameter
 * - Layer 2: 5 fire-bursts from center at mid-gesture
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Warmth/comfort effects
 * - Ambient fire aura
 * - Heat wave emanation
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Radiate gesture configuration
 * Expanding flame rings radiating outward
 */
const RADIATE_CONFIG = {
    name: 'radiate',
    emoji: '☀️',
    type: 'blending',
    description: 'Expanding flame rings radiating outward',
    duration: 1500,
    beats: 4,
    intensity: 0.8,
    category: 'radiating',
    temperature: 0.4,

    // 3D Element spawning - TWO LAYERS using spawn layers feature
    // Layer 1: Flaming coins circling at mascot's feet, expanding outward
    // Layer 2: Fire-burst from center at mid-gesture
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Flame rings at feet (gyroscope shield)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',              // Spawn at feet
                end: 'bottom',                // STAY at feet (no vertical travel)
                easing: 'linear',
                startScale: 1.2,
                endScale: 1.8,                // Grow slightly as they radiate
                startDiameter: 1.2,           // Start circling close to mascot
                endDiameter: 3.5,             // Expand outward dramatically
                orientation: 'vertical'       // Standing rings (coins)
            },
            formation: {
                type: 'spiral',
                count: 3,
                spacing: 0,
                arcOffset: 120,               // 3 rings at 120° apart
                phaseOffset: 0
            },
            count: 3,
            scale: 1.0,
            models: ['flame-ring'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.85,            // Start fading near end
                stagger: 0.03,                // Near-simultaneous spawn
                enter: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.13,           // Quick fade at end
                    easing: 'easeOutQuad'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.7,
                        peak: 0.6,
                        end: 0.35,
                        curve: 'linear'
                    }
                },
                flicker: {
                    intensity: 0.25,
                    rate: 10,
                    pattern: 'smooth'
                },
                pulse: {
                    amplitude: 0.12,
                    frequency: 3,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 1.2,
                    max: 2.8,
                    frequency: 4,
                    pattern: 'sine'
                },
                rotate: [
                    { axis: 'y', rotations: 1.5, phase: 0 },
                    { axis: 'y', rotations: 1.5, phase: 120 },
                    { axis: 'y', rotations: 1.5, phase: 240 }
                ],
                scaleVariance: 0.1,
                lifetimeVariance: 0.05,
                blending: 'additive',
                renderOrder: 8,
                modelOverrides: {
                    'flame-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.8,
                            arcSpeed: 0.8,
                            arcCount: 1
                        },
                        orientationOverride: 'vertical'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Single fire-burst from center (combust-style explosion)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.1,
                endScale: 5.0,
                scaleEasing: 'burstImplode'
            },
            count: 1,
            scale: 1.2,
            models: ['fire-burst'],
            animation: {
                appearAt: 0.50,
                disappearAt: 0.75,            // Start fade at implosion phase (50% of element lifetime)
                enter: {
                    type: 'fade',
                    duration: 0.02,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,           // Fade during implosion (50-100% of element lifetime)
                    easing: 'easeInCubic'     // Slow fade at first, accelerate at end
                },
                procedural: {
                    scaleSmoothing: 0.06,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.6,
                        peak: 0.95,
                        end: 0.5,
                        curve: 'spike'
                    }
                },
                flicker: {
                    intensity: 0.5,
                    rate: 25,
                    pattern: 'random'
                },
                pulse: {
                    amplitude: 0.2,
                    frequency: 12,
                    easing: 'easeOut'
                },
                emissive: {
                    min: 2.0,
                    max: 4.5,
                    frequency: 15,
                    pattern: 'sine'
                },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'fire-burst': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.8 },
                                y: { expand: true, rate: 2.0 },
                                z: { expand: true, rate: 1.8 }
                            }
                        }
                    }
                }
            }
        }
    ],

    // Mesh effects
    flickerFrequency: 8,
    flickerAmplitude: 0.01,
    flickerDecay: 0.2,
    glowColor: [1.0, 0.7, 0.3],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    scaleVibration: 0.015,
    scaleFrequency: 3,
    scaleGrowth: 0.02,
    rotationEffect: true,
    rotationSpeed: 0.3
};

/**
 * Radiate gesture - expanding flame rings radiating outward.
 *
 * Uses SPAWN LAYERS (first gesture to use this feature!):
 * - Layer 1: axis-travel with 3 flame-rings at feet, expanding outward
 * - Layer 2: radial-burst with 5 fire-bursts from center at 40% progress
 *
 * The two layers create a gyroscope shield effect with a mid-gesture pulse.
 */
export default buildFireEffectGesture(RADIATE_CONFIG);
