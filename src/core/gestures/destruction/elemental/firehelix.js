/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firehelix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firehelix gesture - DNA-style double helix ascending flame
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firehelix
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ●   ○        TOP
 *       ○     ●
 *        ●   ○        ← Two interleaved
 *       ○     ●          spirals rising
 *        ●   ○
 *       ○     ●       BOTTOM
 *
 * FEATURES:
 * - 6 flame elements in double helix formation (strands: 2)
 * - DNA-style interleaved spiral ascending
 * - Graceful twisting fire effect
 * - Medium pace for visual clarity
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Magical/mystical fire effects
 * - Life/rebirth themes
 * - Intertwined energy visualization
 * - Elegant fire choreography
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firehelix gesture configuration
 * DNA-style double helix - two interleaved flame spirals
 */
const FIREHELIX_CONFIG = {
    name: 'firehelix',
    emoji: '🧬',
    type: 'blending',
    description: 'DNA-style double helix ascending flame',
    duration: 2000,         // Longer duration to appreciate the helix
    beats: 4,
    intensity: 1.2,
    category: 'radiating',
    temperature: 0.7,

    // 3D Element spawning - double helix formation
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeInOut',
            startScale: 0.9,
            endScale: 1.1,
            startDiameter: 1.8,
            endDiameter: 2.0,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 6,               // 3 per strand
            strands: 2,             // Double helix!
            spacing: 0.2,           // Spacing within each strand
            arcOffset: 120,         // 120° between elements in same strand
            phaseOffset: 0.05
        },
        count: 6,
        scale: 0.7,
        models: ['flame-ring'],
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
                temperature: {
                    start: 0.5,
                    peak: 0.8,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.25,
                rate: 12,
                pattern: 'smooth'
            },
            pulse: {
                amplitude: 0.06,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 2.5,
                frequency: 6,
                pattern: 'smooth'
            },
            // Two-layer: WAVES + SPIRAL for DNA energy flow
            cutout: {
                strength: 0.8,
                primary: { pattern: 4, scale: 2.0, weight: 1.0 },    // WAVES - energy flow
                secondary: { pattern: 6, scale: 1.8, weight: 0.6 },  // SPIRAL - helix arms
                blend: 'max',             // Smoother blend
                travel: 'angular',
                travelSpeed: 3.0,
                strengthCurve: 'bell',    // Fade in and out
                bellPeakAt: 0.5,
                // Geometric mask: cutouts at ring edges
                geometricMask: {
                    type: 'distance',
                    core: 0.1,
                    tip: 0.25
                }
            },
            // Grain: subtle perlin for DNA energy texture
            grain: {
                type: 0,              // PERLIN - smooth flowing
                strength: 0.08,
                scale: 0.2,
                speed: 1.5,
                blend: 'multiply'
            },
            // Moderate rotation to show the helix structure
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 16,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.6,
                        arcSpeed: 1.5,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Mesh effects - warm mystical fire
    flickerFrequency: 10,
    flickerAmplitude: 0.012,
    flickerDecay: 0.15,
    glowColor: [1.0, 0.5, 0.2],     // Warm orange
    glowIntensityMin: 1.1,
    glowIntensityMax: 2.2,
    glowFlickerRate: 8,
    scaleVibration: 0.015,
    scaleFrequency: 5,
    scaleGrowth: 0.02,
    rotationEffect: true,
    rotationSpeed: 0.4
};

/**
 * Firehelix gesture - DNA-style double helix ascending flame.
 *
 * Uses axis-travel spawn mode with spiral formation and strands=2:
 * - 6 flame elements split into 2 interleaved strands
 * - Strand A: elements 0,2,4 at 0°, 120°, 240°
 * - Strand B: elements 1,3,5 at 180°, 300°, 60°
 * - Creates beautiful intertwined double helix effect
 */
export default buildFireEffectGesture(FIREHELIX_CONFIG);
