/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Flame Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Flame Vortex gesture - spiraling fire tornado around mascot
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/flameVortex
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ╱│╲           TOP (wider)
 *       │ │ │
 *      │  ★  │         ← Vertical ring walls
 *       │ │ │            spinning around
 *        ╲│╱           ← 3 rings at 120° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 3 flame rings in spiral formation (120° apart)
 * - Rings travel from bottom to top of mascot
 * - Rings oriented VERTICAL (standing walls for tornado cage effect)
 * - Funnel shape: narrower at bottom, wider at top
 * - Arc visibility: only portion of ring visible, sweeps around
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Fire tornado/vortex effects
 * - Intense fire power-ups
 * - Dramatic flame aura
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Flame Vortex gesture configuration
 * Fire tornado with vertical ring walls spinning around mascot
 */
const FLAME_VORTEX_CONFIG = {
    name: 'flame-vortex',
    emoji: '🌀',
    type: 'blending',
    description: 'Fire tornado spiraling around mascot',
    duration: 1500,
    beats: 5,
    intensity: 1.4,
    category: 'burning',
    temperature: 0.75,             // Hot swirling flames

    // 3D Element spawning - spiraling flame rings
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
            endDiameter: 1.2,       // Reduced top diameter
            orientation: 'flat' // Horizontal rings stacking upward
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
            // Procedural shader config
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            // Temperature: rises with the vortex
            parameterAnimation: {
                temperature: {
                    start: 0.5,
                    peak: 0.8,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            // Intense swirling flicker
            flicker: {
                intensity: 0.4,
                rate: 18,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.12,
                frequency: 6,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.0,
                max: 2.5,
                frequency: 8,
                pattern: 'sine'
            },
            // Arc animation handles visual rotation - no mesh rotation needed
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 12,
            intensityScaling: {
                scale: 1.4,
                emissiveMax: 1.6,
                pulseAmplitude: 1.3
            },
            // Model-specific behavior overrides
            modelOverrides: {
                'flame-ring': {
                    // Arc visibility - shows portion of ring that sweeps around
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC (if supported)
                        arcWidth: 0.5,      // ~29% of ring visible at a time
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
            }
        }
    },

    // Continuous swirl - no distinct buildup
    flickerFrequency: 15,
    flickerAmplitude: 0.01,
    flickerDecay: 0.15,
    // Glow - bright swirling flames
    glowColor: [1.0, 0.55, 0.15],   // Orange-yellow
    glowIntensityMin: 1.3,
    glowIntensityMax: 2.8,
    glowFlickerRate: 12,
    // Scale - slight expansion with vortex
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scaleGrowth: 0.03,
    // Rotation effect
    rotationEffect: true,
    rotationSpeed: 0.5              // Slow mesh rotation to enhance vortex
};

/**
 * Flame Vortex gesture - fire tornado with vertical walls.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 flame-ring models travel from bottom to top
 * - Rings are VERTICAL (orientation: 'vertical') for tornado wall effect
 * - 120° arcOffset creates cage of fire around the mascot
 * - Funnel shape expands as rings travel upward
 */
export default buildFireEffectGesture(FLAME_VORTEX_CONFIG);
