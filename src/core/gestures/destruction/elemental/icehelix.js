/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icehelix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icehelix gesture - DNA-style double helix ascending ice
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icehelix
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ❄️   ○        TOP
 *       ○     ❄️
 *        ❄️   ○        ← Two interleaved
 *       ○     ❄️          spirals rising
 *        ❄️   ○
 *       ○     ❄️       BOTTOM
 *
 * FEATURES:
 * - 6 ice-ring elements in double helix formation (strands: 2)
 * - DNA-style interleaved spiral ascending
 * - Graceful twisting ice effect
 * - CRACKS + VORONOI cutout for fractured crystalline look
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Magical/mystical ice effects
 * - Intertwined energy visualization
 * - Elegant ice choreography
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icehelix gesture configuration
 * DNA-style double helix - two interleaved ice spirals
 */
const ICEHELIX_CONFIG = {
    name: 'icehelix',
    emoji: '🧬',
    type: 'blending',
    description: 'DNA-style double helix ascending ice',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'transform',
    frost: 0.75,

    // 3D Element spawning - double helix formation
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeInOut',
            startScale: 0.8,
            endScale: 1.1,
            startDiameter: 1.6,
            endDiameter: 1.8,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 6,               // 3 per strand
            strands: 2,             // Double helix
            spacing: 0.2,
            arcOffset: 120,
            phaseOffset: 0.05
        },
        count: 6,
        scale: 1.2,
        models: ['ice-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.06,
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                frost: {
                    start: 0.5,
                    peak: 0.85,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.06,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.9,
                max: 2.0,
                frequency: 6,
                pattern: 'smooth'
            },
            // Two-layer: CRACKS + VORONOI for DNA crystalline structure
            cutout: {
                strength: 0.7,
                primary: { pattern: 8, scale: 1.5, weight: 1.0 },    // CRACKS - fractures
                secondary: { pattern: 3, scale: 1.2, weight: 0.5 },  // VORONOI - cells
                blend: 'max',
                travel: 'angular',
                travelSpeed: 2.5,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.1,
                    tip: 0.25
                }
            },
            // Grain: FILM for frost texture
            grain: {
                type: 3,
                strength: 0.15,
                scale: 0.2,
                speed: 1.0,
                blend: 'multiply'
            },
            // Moderate rotation to show helix structure
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 16,
            modelOverrides: {
                'ice-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 1.2,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Glow - mystical ice
    glowColor: [0.6, 0.85, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 8,
    // Scale - helix breathing
    scaleVibration: 0.012,
    scaleFrequency: 5,
    scaleGrowth: 0.02,
    // Tremor - crystalline shimmer
    tremor: 0.003,
    tremorFrequency: 4
};

/**
 * Icehelix gesture - DNA-style double helix ascending ice.
 *
 * Uses axis-travel spawn mode with spiral formation and strands=2:
 * - 6 ice crystals split into 2 interleaved strands
 * - Strand A: elements 0,2,4 at 0°, 120°, 240°
 * - Strand B: elements 1,3,5 at 180°, 300°, 60°
 * - Creates beautiful intertwined double helix effect
 */
export default buildIceEffectGesture(ICEHELIX_CONFIG);
