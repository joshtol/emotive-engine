/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firedrill Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firedrill gesture - fast tight ascending helix
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firedrill
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *            ●         TOP
 *           ●
 *          ●           ← Fast tight spiral
 *         ●              drilling upward
 *        ●
 *       ●              BOTTOM
 *
 * FEATURES:
 * - 6 flame elements in tight spiral formation
 * - Fast ascending helix (like a drill bit)
 * - High rotation speed for drilling effect
 * - Energetic intense fire
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Piercing fire effects
 * - Drill/bore attacks
 * - Intense energy buildups
 * - Breaking through obstacles
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firedrill gesture configuration
 * Fast tight ascending helix - drilling flame spiral
 */
const FIREDRILL_CONFIG = {
    name: 'firedrill',
    emoji: '🔩',
    type: 'blending',
    description: 'Fast tight ascending flame helix',
    duration: 1200,         // Quick intense burst
    beats: 2,
    intensity: 1.5,         // High intensity
    category: 'radiating',
    temperature: 0.8,       // Hot intense fire

    // 3D Element spawning - tight spiral helix
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'feet',
            end: 'below',
            easing: 'easeIn',       // Accelerating downward
            startScale: 1.0,
            endScale: 0.8,
            startDiameter: 1.8,     // Wide at top
            endDiameter: 1.4,       // Narrower at drill point
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 6,
            spacing: 0.1,           // Tight spacing
            arcOffset: 60,          // 60° between each (6 * 60 = 360)
            phaseOffset: 0
        },
        count: 6,
        scale: 0.8,                 // Slightly larger elements
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.03,          // Fast sequential spawn
            enter: {
                type: 'fade',
                duration: 0.05,
                easing: 'linear'
            },
            exit: {
                type: 'fade',
                duration: 0.4,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.05,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.6,
                    peak: 0.9,
                    end: 0.7,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.4,     // High flicker for intensity
                rate: 25,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.08,
                frequency: 10,      // Fast pulse
                easing: 'linear'
            },
            emissive: {
                min: 1.5,
                max: 3.5,
                frequency: 12,
                pattern: 'random'
            },
            // Two-layer: CRACKS + VORONOI for drilling/breaking effect
            cutout: {
                strength: 0.85,
                primary: { pattern: 8, scale: 2.5, weight: 1.0 },    // CRACKS - fracture lines
                secondary: { pattern: 3, scale: 3.0, weight: 0.7 },  // VORONOI - shattered cells
                blend: 'multiply',        // More holes where patterns overlap
                travel: 'oscillate',
                travelSpeed: 5.0,         // Fast pulsing
                // Geometric mask: focus at ring edges
                geometricMask: {
                    type: 'distance',
                    core: 0.08,
                    tip: 0.2
                },
                // Trail dissolve: leading edge dissolves as drill advances
                trailDissolve: {
                    offset: 0.1,          // Positive - dissolve at leading edge
                    softness: 0.25
                }
            },
            // Grain: white noise for sharp drilling texture
            grain: {
                type: 2,              // WHITE - sharp granular
                strength: 0.1,
                scale: 0.1,
                speed: 3.0,           // Fast for intense drilling
                blend: 'multiply'
            },
            // Fast unified rotation for drill effect
            rotate: { axis: 'y', rotations: 4, phase: 0 },  // 4 full rotations
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 16,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,    // Narrow arcs for drill bits
                        arcSpeed: 3.0,    // Fast internal animation
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Mesh effects - intense hot fire
    flickerFrequency: 20,
    flickerAmplitude: 0.015,
    flickerDecay: 0.1,
    glowColor: [1.0, 0.4, 0.1],     // Hot orange-red
    glowIntensityMin: 1.3,
    glowIntensityMax: 2.8,
    glowFlickerRate: 18,
    scaleVibration: 0.02,
    scaleFrequency: 8,
    scaleGrowth: 0.03,
    rotationEffect: true,
    rotationSpeed: 0.8
};

/**
 * Firedrill gesture - fast tight ascending helix.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 6 flame elements in tight 60° spiral
 * - Fast travel from bottom to above
 * - High rotation speed (4 full rotations)
 * - Drilling/piercing fire effect
 */
export default buildFireEffectGesture(FIREDRILL_CONFIG);
