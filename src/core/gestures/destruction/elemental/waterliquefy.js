/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterliquefy Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterliquefy gesture - gravity drips with velocity stretch
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterliquefy
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *            ★              ← Mascot melting
 *           /|\
 *          💧 💧            ← Drips falling with velocity stretch
 *         ↓   ↓
 *        💧   💧
 *       ↓     ↓
 *      〰️ 〰️ 〰️            ← Chaotic dissolve effects
 *
 * FEATURES:
 * - Two-layer effect: falling drips + chaotic dissolve
 * - axis-travel with gravity easing (top to bottom)
 * - Velocity-stretch scaling for teardrop effect
 * - DRIP_FALL shader animation
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Melting/dissolution effects
 * - Liquefaction visuals
 * - Form loss reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterliquefy gesture configuration
 * Gravity drips with velocity stretch
 */
const WATERLIQUEFY_CONFIG = {
    name: 'liquefy',
    emoji: '💧',
    type: 'blending',
    description: 'Melting dissolution - gravity drips with velocity stretch',
    duration: 2500,
    beats: 4,
    intensity: 1.0,
    category: 'transform',
    turbulence: 0.8,              // High turbulence - chaotic melting

    // 3D Element spawning - TWO LAYERS: falling drips + chaotic dissolve
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Gravity-falling drips with velocity-stretch
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'top',         // Drips fall from top
                end: 'bottom',
                easing: 'easeInQuad', // Accelerating fall (gravity)
                startDiameter: 0.6,
                endDiameter: 0.9,     // Spread out as they fall
                startScale: 0.7,
                endScale: 1.0
            },
            formation: {
                type: 'ring',
                count: 5              // 5 drips falling around circumference
            },
            count: 5,
            scale: 0.9,
            models: ['droplet-large', 'droplet-small', 'droplet-large', 'droplet-small', 'droplet-large'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.75,
                stagger: 0.06,
                enter: {
                    type: 'grow',
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'shrink',
                    duration: 0.1,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.06,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.2,
                        peak: 0.9,
                        end: 0.7,
                        curve: 'sustained'
                    }
                },
                scaleVariance: 0.25,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 7,
                // Model-specific velocity-stretch for falling drips
                modelOverrides: {
                    'droplet-large': {
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 1.6,
                            minSpeed: 0.02,
                            maxStretch: 2.2
                        },
                        shaderAnimation: {
                            type: 3  // DRIP_FALL
                        }
                    },
                    'droplet-small': {
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 2.0,
                            minSpeed: 0.02,
                            maxStretch: 2.8
                        },
                        shaderAnimation: {
                            type: 3  // DRIP_FALL
                        }
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Chaotic dissolve wave-curls
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.15,
            cameraFacing: 0.4,
            clustering: 0.35,
            count: 4,
            scale: 0.8,
            models: ['wave-curl', 'bubble-cluster'],
            minDistance: 0.12,
            animation: {
                appearAt: 0.15,
                disappearAt: 0.9,
                stagger: 0.08,
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
                    turbulence: {
                        start: 0.3,
                        peak: 1.0,
                        end: 0.8,
                        curve: 'sustained'
                    },
                    transparency: {
                        start: 0.0,
                        peak: 0.7,
                        end: 0.9,
                        curve: 'linear'
                    }
                },
                pulse: {
                    amplitude: 0.12,
                    frequency: 2.5,
                    easing: 'easeInOut'
                },
                scaleVariance: 0.3,
                lifetimeVariance: 0.2,
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    'wave-curl': {
                        scaling: { mode: 'uniform-pulse', amplitude: 0.18, frequency: 2.5 },
                        drift: { direction: 'tangent', speed: 0.015, noise: 0.03 }
                    },
                    'bubble-cluster': {
                        enter: { type: 'pop', duration: 0.03 },
                        drift: { direction: 'rising', speed: 0.025, buoyancy: true, noise: 0.04 }
                    }
                }
            }
        }
    ],

    // Wobble - minimal for fluid motion
    wobbleFrequency: 2,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.2,
    // Scale - irregular wobbling
    scaleWobble: 0.04,
    scaleFrequency: 3,
    // Glow - becoming translucent
    glowColor: [0.3, 0.6, 0.95],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowPulseRate: 5,
    // Liquefy-specific
    meltDown: true,              // Slight downward drift
    formLoss: true,              // Increasing wobble amplitude
    stretchVertical: 0.03        // Vertical stretch (dripping)
};

/**
 * Waterliquefy gesture - gravity drips with velocity stretch.
 *
 * Uses multi-layer spawn mode:
 * - Layer 1: axis-travel falling drips with velocity-stretch
 * - Layer 2: surface chaotic dissolve effects
 */
export default buildWaterEffectGesture(WATERLIQUEFY_CONFIG);
