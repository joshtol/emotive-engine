/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icedrill Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icedrill gesture - fast tight descending ice spiral
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icedrill
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *       ●              TOP (wide)
 *        ●
 *         ●           ← Fast tight spiral
 *          ●            drilling downward
 *           ●
 *            ●        BOTTOM (narrow)
 *
 * FEATURES:
 * - 6 ice-ring elements in tight spiral formation
 * - Fast descending helix (like an ice drill bit)
 * - VORONOI + CRACKS cutout for crystalline drilling motion
 * - High rotation speed for drilling effect
 * - Energetic intense ice
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Piercing ice effects
 * - Drill/bore attacks
 * - Intense frozen energy buildups
 * - Breaking through obstacles with ice
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icedrill gesture configuration
 * Fast tight descending helix - drilling ice spiral
 */
const ICEDRILL_CONFIG = {
    name: 'icedrill',
    emoji: '🔩',
    type: 'blending',
    description: 'Fast tight descending ice helix',
    duration: 1200,         // Quick intense burst
    beats: 2,
    intensity: 1.5,         // High intensity
    category: 'transform',
    frost: 0.7,

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
        scale: 1.4,
        models: ['ice-ring'],
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
                frost: {
                    start: 0.4,
                    peak: 0.8,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            // VORONOI cutout for crystalline drilling
            cutout: {
                strength: 0.55,
                primary: { pattern: 3, scale: 1.5, weight: 1.0 },    // VORONOI - crystalline
                secondary: { pattern: 8, scale: 0.8, weight: 0.35 }, // CRACKS - fracture lines
                blend: 'add',
                travel: 'vertical',
                travelSpeed: 3.0,           // Fast drilling travel
                strengthCurve: 'constant'
            },
            // Grain: film grain for drilling ice spray
            grain: {
                type: 3,              // FILM
                strength: 0.3,        // Stronger for intense effect
                scale: 0.2,
                speed: 4.0,           // Fast for drilling energy
                blend: 'multiply'
            },
            // Per-gesture atmospheric particles: cold mist from drilling
            atmospherics: [{
                preset: 'mist',
                targets: null,
                anchor: 'below',
                intensity: 0.3,
                sizeScale: 0.8,
                progressCurve: 'sustain',
            }],
            pulse: {
                amplitude: 0.08,
                frequency: 10,      // Fast pulse
                easing: 'linear'
            },
            // Fast unified rotation for drill effect
            rotate: { axis: 'y', rotations: 4, phase: 0 },  // 4 full rotations
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 16,
            modelOverrides: {
                'ice-ring': {
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

    // Glow - intense ice blue
    glowColor: [0.4, 0.75, 1.0],
    glowIntensityMin: 1.3,
    glowIntensityMax: 2.8,
    glowFlickerRate: 10,
    // Scale - tight control
    scaleVibration: 0.02,
    scaleFrequency: 8,
    scaleGrowth: 0.03,
    // Tremor - drilling energy
    tremor: 0.006,
    tremorFrequency: 8
};

/**
 * Icedrill gesture - fast tight descending helix.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 6 ice-ring elements in tight 60° spiral
 * - Fast travel from feet to below
 * - High rotation speed (4 full rotations)
 * - Drilling/piercing ice effect
 */
export default buildIceEffectGesture(ICEDRILL_CONFIG);
