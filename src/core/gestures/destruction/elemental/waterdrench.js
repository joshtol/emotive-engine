/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterdrench Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterdrench gesture - combust-style 60/40 buildup/burst
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterdrench
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM (COMBUST-STYLE):
 *
 *    BUILDUP (60%)          BURST (40%)
 *        💧                  💧 💧 💧
 *       💧💧          →     💧 BOOM 💧
 *      💧💧💧                💧 💧 💧
 *
 * FEATURES:
 * - TWO-PHASE: 60% buildup + 40% explosive burst
 * - Layer 1: Orbiting droplets gathering (buildup phase)
 * - Layer 2: Radial burst explosion (release phase)
 * - Combust-style timing with dramatic payoff
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water explosion effects
 * - Dramatic deluge visuals
 * - Water bomb reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterdrench gesture configuration
 * Combust-style 60/40 buildup/burst water explosion
 */
const WATERDRENCH_CONFIG = {
    name: 'drench',
    emoji: '🌊',
    type: 'blending',
    description: 'Combust-style 60/40 buildup/burst water explosion',
    duration: 2000,
    beats: 3,
    intensity: 1.4,
    category: 'impact',
    turbulence: 0.7,

    // 3D Element spawning - COMBUST-STYLE: 60% buildup, 40% burst
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Orbiting droplets gathering (BUILDUP PHASE - 60%)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                radius: 1.2,            // Start wide
                height: 0,
                speed: 0.8,             // Moderate orbit speed
                direction: 'cw',
                shrink: {
                    enabled: true,
                    startRadius: 1.5,
                    endRadius: 0.3,     // Compress inward during buildup
                    easing: 'easeInQuad'
                }
            },
            formation: {
                type: 'ring',
                count: 6
            },
            count: 6,
            scale: 0.8,
            models: ['droplet-large', 'droplet-small', 'droplet-large', 'droplet-small', 'droplet-large', 'droplet-small'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.58,      // Disappear just before burst (60% mark)
                stagger: 0.08,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'implode',     // Collapse inward before burst
                    duration: 0.1,
                    easing: 'easeInQuad'
                },
                procedural: {
                    scaleSmoothing: 0.1,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.3,
                        peak: 0.7,       // Build tension
                        end: 0.9,        // Maximum at burst
                        curve: 'exponential'
                    }
                },
                // Accelerating pulse as tension builds
                pulse: {
                    amplitude: 0.15,
                    frequency: 4,        // Gets faster feeling with orbit
                    easing: 'easeInOut'
                },
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    'droplet-large': {
                        scaling: {
                            mode: 'uniform-pulse',
                            amplitude: 0.12,
                            frequency: 5
                        }
                    },
                    'droplet-small': {
                        scaling: {
                            mode: 'uniform-pulse',
                            amplitude: 0.08,
                            frequency: 6
                        }
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Radial burst explosion (BURST PHASE - 40%)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                startRadius: 0.2,       // Explode from center
                endRadius: 2.5,         // Expand dramatically
                height: 0,
                easing: 'easeOutExpo'   // Fast initial burst, slowing
            },
            formation: {
                type: 'ring',
                count: 10               // Dense ring of droplets
            },
            count: 10,
            scale: 1.2,
            models: ['droplet-large', 'droplet-small', 'splash-ring', 'droplet-large', 'droplet-small', 'splash-ring', 'droplet-large', 'droplet-small', 'splash-ring', 'droplet-large'],
            animation: {
                appearAt: 0.58,         // Start at 60% mark (burst phase)
                disappearAt: 0.95,
                stagger: 0.02,          // Rapid cascade
                enter: {
                    type: 'explode',
                    duration: 0.08,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 1.0,      // Maximum at burst
                        peak: 0.8,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                pulse: {
                    amplitude: 0.1,
                    frequency: 8,        // Rapid post-burst vibration
                    easing: 'easeOut'
                },
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'droplet-large': {
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 1.8,
                            maxStretch: 2.2
                        }
                    },
                    'splash-ring': {
                        opacityLink: 'inverse-scale',
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.6,
                            arcSpeed: 2.0,
                            arcCount: 2
                        }
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Expanding shockwave ring (BURST ACCENT)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                startDiameter: 0.3,
                endDiameter: 3.0,        // Expand dramatically
                orientation: 'flat'
            },
            count: 1,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.58,          // Sync with burst
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.05,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,
                    easing: 'easeIn'
                },
                blending: 'normal',
                renderOrder: 6,
                modelOverrides: {
                    'splash-ring': {
                        opacityLink: 'inverse-scale',
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.95,
                            arcSpeed: 0.5,
                            arcCount: 1
                        }
                    }
                }
            }
        }
    ],

    // Wobble - dramatic for explosion
    wobbleFrequency: 3,
    wobbleAmplitude: 0.02,
    wobbleDecay: 0.4,
    // Scale - compression then expansion
    scaleWobble: 0.05,
    scaleFrequency: 4,
    scaleGrowth: 0.02,
    // Glow - intense burst
    glowColor: [0.2, 0.5, 0.95],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.5,
    glowPulseRate: 5,
    // Drench-specific
    burstPhase: 0.6,                    // 60% buildup, 40% burst
    explosionIntensity: 1.5
};

/**
 * Waterdrench gesture - combust-style 60/40 buildup/burst.
 *
 * Uses multi-layer spawn mode:
 * - Layer 1: Orbiting droplets compressing inward (buildup)
 * - Layer 2: Radial burst explosion (release)
 * - Layer 3: Expanding shockwave ring (accent)
 */
export default buildWaterEffectGesture(WATERDRENCH_CONFIG);
