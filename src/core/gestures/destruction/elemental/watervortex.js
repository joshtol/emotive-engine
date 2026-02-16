/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Water Vortex gesture - spiraling water tornado around mascot
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watervortex
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ╱│╲           TOP (wider)
 *       │ │ │
 *      │  ★  │         ← Horizontal splash ring walls
 *       │ │ │            spinning around in funnel
 *        ╲│╱           ← 3 rings at 120° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 3 splash rings in spiral formation (120° apart)
 * - Rings travel from bottom to top of mascot
 * - Rings oriented FLAT (horizontal tornado funnel)
 * - Funnel shape: narrower at bottom, wider at top
 * - Arc visibility: portion of ring visible, sweeps around
 * - No cutout — transparent refraction shows background through water
 * - Trail dissolve: organic fade at ring bottoms as they rise
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water tornado/waterspout effects
 * - Intense water power-ups
 * - Dramatic aquatic aura
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Water Vortex gesture configuration
 * Water tornado with horizontal ring walls spinning around mascot
 */
const WATER_VORTEX_CONFIG = {
    name: 'watervortex',
    emoji: '🌀',
    type: 'blending',
    description: 'Water tornado spiraling around mascot',
    duration: 1500,
    beats: 5,
    intensity: 1.4,
    category: 'transform',
    turbulence: 0.75,

    // 3D Element spawning - spiraling splash rings
    spawnMode: {
        type: 'axis-travel',
        // Axis travel: rings travel from bottom to top
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.4,
            endScale: 1.7,
            startDiameter: 0.6,     // Narrow at bottom for pronounced cone
            endDiameter: 2.0,       // Wider at top for dramatic funnel
            orientation: 'flat'     // Horizontal rings stacking upward
        },
        // Formation: 3 rings at SAME position, offset by 120 degrees rotation
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,             // All rings at same vertical position (tornado)
            arcOffset: 120,         // 120 degrees between each ring
            phaseOffset: 0          // All travel together
        },
        count: 3,
        scale: 1.0,
        models: ['splash-ring'],
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
                type: 'burst-fade',
                duration: 0.15,
                easing: 'easeIn',
                burstScale: 1.1
            },
            // Procedural shader config
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            // Turbulence: rises with the tornado
            parameterAnimation: {
                turbulence: {
                    start: 0.4,
                    peak: 0.85,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            // No grain — multiply grain on transparent refraction = dark speckles
            pulse: {
                amplitude: 0.12,
                frequency: 6,
                easing: 'easeInOut'
            },
            // Arc animation handles visual rotation
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 12,
            intensityScaling: {
                scale: 1.4,
                pulseAmplitude: 1.3
            },
            // Model-specific behavior overrides
            modelOverrides: {
                'splash-ring': {
                    // Arc visibility - shows portion of ring that sweeps around
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC
                        arcWidth: 0.5,      // ~50% of ring visible at a time
                        arcSpeed: 6.0,      // 6 rotations over gesture duration
                        arcCount: 1         // Single arc per ring
                    },
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.1 },
                            y: { expand: false, rate: 0.3 },  // Flatten slightly
                            z: { expand: true, rate: 1.1 }
                        }
                    },
                    orientationOverride: 'flat'  // Horizontal rings
                }
            },
            // Sustained spray flung outward by spinning tornado
            atmospherics: [{
                preset: 'spray',
                targets: null,
                anchor: 'around',
                intensity: 0.3,
                sizeScale: 1.0,
                progressCurve: 'sustain',
                velocityInheritance: 0.6,
                centrifugal: { speed: 1.2, tangentialBias: 0.3 },
            }],
        }
    },

    // Wobble - swirling water
    wobbleFrequency: 4,
    wobbleAmplitude: 0.015,
    wobbleDecay: 0.2,
    // Glow - cool blue swirling water
    glowColor: [0.2, 0.55, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.2,
    glowPulseRate: 6,
    // Scale - slight expansion with tornado
    scaleWobble: 0.02,
    scaleFrequency: 4,
    scaleGrowth: 0.03
};

/**
 * Water Vortex gesture - water tornado with horizontal walls.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 splash-ring models travel from bottom to top
 * - Rings are FLAT (orientation: 'flat') for tornado funnel effect
 * - 120° arcOffset creates cage of water around the mascot
 * - Funnel shape expands as rings travel upward
 * - No cutout — transparent refraction for liquid look
 */
export default buildWaterEffectGesture(WATER_VORTEX_CONFIG);
