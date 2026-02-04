/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Scorch Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Scorch gesture - core meltdown, internal heat escaping outward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/scorch
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *            ╲ 🔥 ╱
 *          🔥  💥  🔥        ← Fire emanating from center
 *            ╱ 🔥 ╲            like internal heat escaping
 *         ·  ·  ·  ·  ·      ← Surface embers
 *
 * FEATURES:
 * - FOUR SPAWN LAYERS for core meltdown effect
 * - Layer 1: Central fire-burst core (intense heat source)
 * - Layer 2: Flame-tongues radiating outward from center
 * - Layer 3: Flame-wisps escaping at surface
 * - Layer 4: Ember-clusters as ambient heat glow
 * - Mascot is VICTIM of fire (burning category)
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Intense heat exposure
 * - Being scorched/charred
 * - Internal combustion effect
 * - Core meltdown visualization
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Scorch gesture configuration
 * Core meltdown - internal heat escaping outward
 */
const SCORCH_CONFIG = {
    name: 'scorch',
    emoji: '🫠',
    type: 'blending',
    description: 'Core meltdown, internal heat escaping',
    duration: 1200,
    beats: 3,
    intensity: 1.3,
    category: 'burning',
    temperature: 0.8,

    // FOUR LAYERS for core meltdown effect
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Central fire-burst core (the heat source)
        // Intense bursts at center that pulse with energy
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.3 },      // Push forward to be visible
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.5,
                scaleEasing: 'easeOutExpo'
            },
            count: 3,
            scale: 1.2,
            models: ['fire-burst'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.70,
                stagger: 0.15,              // Pulsing core bursts
                enter: {
                    type: 'scale',
                    duration: 0.12,
                    easing: 'easeOutExpo'
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.3,
                    easing: 'easeInCubic',
                    burstScale: 1.4
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.85,
                        peak: 0.95,
                        end: 0.6,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.25,
                    rate: 10,
                    pattern: 'random'
                },
                pulse: {
                    amplitude: 0.2,
                    frequency: 4,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 3.0,
                    max: 5.0,
                    frequency: 5,
                    pattern: 'sine'
                },
                blending: 'additive',
                renderOrder: 16
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Flame-tongues radiating outward from center
        // Fire escaping in all directions
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 0,
                radius: 0.6,                    // Start closer to center
                plane: 'horizontal',
                orientation: 'radial'           // Point outward from center
            },
            formation: {
                type: 'ring',
                count: 8,
                startAngle: 0
            },
            count: 8,
            scale: 1.4,
            models: ['flame-tongue'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.80,
                stagger: 0.04,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeInCubic'
                },
                procedural: {
                    scaleSmoothing: 0.06,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.7,
                        peak: 0.85,
                        end: 0.5,
                        curve: 'sustained'
                    }
                },
                flicker: {
                    intensity: 0.2,
                    rate: 8,
                    pattern: 'sine'
                },
                pulse: {
                    amplitude: 0.12,
                    frequency: 3,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 2.0,
                    max: 3.5,
                    frequency: 4,
                    pattern: 'sine'
                },
                // Radiate outward from center
                drift: {
                    speed: 0.8,
                    distance: 1.2,
                    pattern: 'radial',
                    accelerate: true
                },
                rotate: [
                    { axis: 'z', rotations: 0.4, phase: 0 },
                    { axis: 'z', rotations: -0.4, phase: 45 },
                    { axis: 'z', rotations: 0.4, phase: 90 },
                    { axis: 'z', rotations: -0.4, phase: 135 },
                    { axis: 'z', rotations: 0.4, phase: 180 },
                    { axis: 'z', rotations: -0.4, phase: 225 },
                    { axis: 'z', rotations: 0.4, phase: 270 },
                    { axis: 'z', rotations: -0.4, phase: 315 }
                ],
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 14
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Flame-wisps escaping at surface
        // Smaller flames breaking through, rising upward
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'surface',
            pattern: 'shell',
            embedDepth: 0.1,
            cameraFacing: 0.3,
            clustering: 0.2,
            count: 10,
            scale: 0.9,
            models: ['flame-wisp'],
            minDistance: 0.15,
            animation: {
                appearAt: 0.10,
                disappearAt: 0.85,
                stagger: 0.03,
                enter: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.5,
                        peak: 0.7,
                        end: 0.4,
                        curve: 'sine'
                    }
                },
                flicker: {
                    intensity: 0.3,
                    rate: 12,
                    pattern: 'random'
                },
                emissive: {
                    min: 1.5,
                    max: 2.5,
                    frequency: 6,
                    pattern: 'sine'
                },
                // Rise upward like escaping heat
                drift: {
                    speed: 0.4,
                    distance: 0.4,
                    direction: { x: 0, y: 1, z: 0 },
                    easing: 'easeOutCubic'
                },
                scaleVariance: 0.25,
                lifetimeVariance: 0.2,
                blending: 'additive',
                renderOrder: 12
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 4: Ember-clusters as ambient heat glow
        // Surrounding heat shimmer effect
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 0,
                radius: 1.5,
                plane: 'horizontal',
                orientation: 'camera'
            },
            formation: {
                type: 'ring',
                count: 10,
                startAngle: 18
            },
            count: 10,
            scale: 0.5,
            models: ['ember-cluster'],
            animation: {
                appearAt: 0.08,
                disappearAt: 0.90,
                stagger: 0.02,
                enter: {
                    type: 'fade',
                    duration: 0.2,
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
                        start: 0.4,
                        peak: 0.6,
                        end: 0.35,
                        curve: 'sine'
                    }
                },
                flicker: {
                    intensity: 0.2,
                    rate: 8,
                    pattern: 'random'
                },
                pulse: {
                    amplitude: 0.15,
                    frequency: 3,
                    easing: 'easeInOut',
                    perElement: true
                },
                emissive: {
                    min: 1.0,
                    max: 1.8,
                    frequency: 4,
                    pattern: 'sine'
                },
                // Slow outward expansion
                drift: {
                    speed: 0.2,
                    distance: 0.3,
                    pattern: 'radial',
                    accelerate: false
                },
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 10
            }
        }
    ],

    // Mesh effects - intense yellow/white heat
    flickerFrequency: 6,
    flickerAmplitude: 0.008,
    flickerDecay: 0.25,
    glowColor: [1.0, 0.8, 0.3],     // Yellow-white
    glowIntensityMin: 1.5,
    glowIntensityMax: 3.5,
    glowFlickerRate: 8,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    heatExpansion: 0.03,
    shimmerEffect: true,
    shimmerIntensity: 0.02
};

/**
 * Scorch gesture - core meltdown effect.
 *
 * Uses FOUR SPAWN LAYERS:
 * - Layer 1: 3 fire-bursts as pulsing central core
 * - Layer 2: 8 flame-tongues radiating outward (larger, visible)
 * - Layer 3: 10 flame-wisps escaping at surface
 * - Layer 4: 10 ember-clusters as ambient heat glow
 *
 * Creates intense internal combustion effect with heat
 * emanating from the center outward.
 */
export default buildFireEffectGesture(SCORCH_CONFIG);
