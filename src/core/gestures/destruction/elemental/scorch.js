/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Scorch Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Scorch gesture - intense heat exposure, surface heating
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/scorch
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *       🔥🔥🔥🔥
 *      🔥  ★  🔥      ← Dense flame coverage
 *       🔥🔥🔥🔥        sustained high heat
 *
 * FEATURES:
 * - Full heat coverage (shell pattern)
 * - Sustained intense heat, less flicker
 * - Higher emissive glow, yellow-white color
 * - Mascot is VICTIM of fire (burning category)
 *
 * USED BY:
 * - Intense heat exposure
 * - Being scorched/charred
 * - Extreme fire damage
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Scorch gesture configuration
 * Intense heat exposure, surface heating
 */
const SCORCH_CONFIG = {
    name: 'scorch',
    emoji: '🫠',
    type: 'blending',
    description: 'Intense heat exposure, surface heating',
    duration: 3000,
    beats: 5,
    intensity: 1.3,
    category: 'burning',
    temperature: 0.8,

    // 3D Element spawning - intense flame coverage on surface
    spawnMode: {
        type: 'surface',
        pattern: 'shell',           // Full heat coverage
        embedDepth: 0.2,
        cameraFacing: 0.25,
        clustering: 0.15,
        count: 10,
        scale: 1.1,
        models: ['flame-tongue', 'flame-wisp', 'fire-burst'],
        minDistance: 0.1,
        animation: {
            appearAt: 0.03,
            disappearAt: 0.88,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeOutCubic'
            },
            exit: {
                type: 'fade',
                duration: 0.12,
                easing: 'easeInQuad'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.6,
                    peak: 0.85,
                    end: 0.7,
                    curve: 'sustained'
                }
            },
            flicker: {
                intensity: 0.2,
                rate: 6,
                pattern: 'sine'
            },
            pulse: {
                amplitude: 0.1,
                frequency: 3,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 3.0,
                frequency: 4,
                pattern: 'sine'
            },
            drift: {
                direction: 'up',
                distance: 0.08,
                noise: 0.01
            },
            scaleVariance: 0.25,
            lifetimeVariance: 0.2,
            blending: 'additive',
            renderOrder: 12,
            intensityScaling: {
                scale: 1.4,
                emissiveMax: 1.8,
                pulseAmplitude: 1.3
            },
            modelOverrides: {
                'flame-tongue': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.2, oscillate: true },
                            y: { expand: true, rate: 1.3 },
                            z: { expand: true, rate: 1.2, oscillate: true }
                        },
                        wobbleFrequency: 3, wobbleAmplitude: 0.1
                    },
                    drift: { direction: 'rising', speed: 0.02, noise: 0.1 }
                },
                'flame-wisp': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.8 },
                            y: { expand: true, rate: 1.8 },
                            z: { expand: false, rate: 0.8 }
                        }
                    },
                    drift: { direction: 'rising', speed: 0.02, buoyancy: true }
                },
                'fire-burst': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.2 },
                            y: { expand: true, rate: 1.3 },
                            z: { expand: true, rate: 1.2 }
                        }
                    },
                    drift: { direction: 'outward', speed: 0.02, noise: 0.05 },
                    opacityLink: 'inverse-scale'
                }
            }
        }
    },

    // Minimal flicker - more sustained heat
    flickerFrequency: 6,
    flickerAmplitude: 0.008,
    flickerDecay: 0.25,
    // Glow - intense yellow/white
    glowColor: [1.0, 0.8, 0.3],
    glowIntensityMin: 1.5,
    glowIntensityMax: 3.5,
    glowFlickerRate: 8,
    // Scale - slight expansion from heat
    scaleVibration: 0.01,
    scaleFrequency: 3,
    heatExpansion: 0.03,
    // Heat shimmer
    shimmerEffect: true,
    shimmerIntensity: 0.02
};

/**
 * Scorch gesture - intense heat exposure.
 *
 * Uses surface spawn mode with shell pattern:
 * - Dense flame coverage for intense heat
 * - Sustained high temperature, less chaotic than burn
 * - Yellow-white glow for extreme heat effect
 */
export default buildFireEffectGesture(SCORCH_CONFIG);
