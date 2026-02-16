/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterhelix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterhelix gesture - DNA-style double helix ascending water
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterhelix
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
 * - 6 splash elements in double helix formation (strands: 2)
 * - DNA-style interleaved spiral ascending
 * - SPIRAL + CELLULAR cutout for helix texture
 * - Graceful twisting water effect with trail dissolve
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Magical/mystical water effects
 * - Life/rebirth themes
 * - Intertwined energy visualization
 * - Elegant water choreography
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterhelix gesture configuration
 * DNA-style double helix - two interleaved water spirals
 */
const WATERHELIX_CONFIG = {
    name: 'waterhelix',
    emoji: '🧬',
    type: 'blending',
    description: 'DNA-style double helix ascending water',
    duration: 2000,         // Longer duration to appreciate the helix
    beats: 4,
    intensity: 1.2,
    category: 'ambient',
    turbulence: 0.35,

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
        models: ['splash-ring'],
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
                turbulence: {
                    start: 0.2,
                    peak: 0.4,
                    end: 0.25,
                    curve: 'bell'
                }
            },
            // SPIRAL cutout for DNA helix effect
            cutout: {
                strength: 0.5,
                primary: { pattern: 6, scale: 1.3, weight: 1.0 },    // SPIRAL - helix motion
                secondary: { pattern: 0, scale: 0.7, weight: 0.3 },  // CELLULAR - organic gaps
                blend: 'multiply',
                travel: 'vertical',
                travelSpeed: 1.2,
                strengthCurve: 'constant',
                trailDissolve: {
                    enabled: true,
                    offset: -0.4,
                    softness: 1.0
                }
            },
            // Grain: film grain for mystical water texture
            grain: {
                type: 3,              // FILM
                strength: 0.2,
                scale: 0.25,
                speed: 1.5,
                blend: 'multiply'
            },
            pulse: {
                amplitude: 0.08,
                frequency: 3,
                easing: 'easeInOut'
            },
            // Rotation to show the helix structure
            rotate: { axis: 'y', rotations: 2.5, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 16,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.6,
                        arcSpeed: 1.5,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            },
            // Sustained spray thrown off spiraling helix
            atmospherics: [{
                preset: 'spray',
                targets: null,
                anchor: 'above',
                intensity: 0.25,
                sizeScale: 0.8,
                progressCurve: 'sustain',
                velocityInheritance: 0.5,
                centrifugal: { speed: 0.8, tangentialBias: 0.4 },
            }],
        }
    },

    // Wobble - smooth for mystical effect
    wobbleFrequency: 2,
    wobbleAmplitude: 0.008,
    wobbleDecay: 0.2,
    // Scale - gentle breathing
    scaleWobble: 0.015,
    scaleFrequency: 3,
    scaleGrowth: 0.02,
    // Glow - mystical blue
    glowColor: [0.3, 0.55, 0.9],
    glowIntensityMin: 1.1,
    glowIntensityMax: 2.2,
    glowPulseRate: 4,
    // Helix-specific
    rotationFlow: 0.015
};

/**
 * Waterhelix gesture - DNA-style double helix ascending water.
 *
 * Uses axis-travel spawn mode with spiral formation and strands=2:
 * - 6 splash elements split into 2 interleaved strands
 * - Strand A: elements 0,2,4 at 0°, 120°, 240°
 * - Strand B: elements 1,3,5 at 180°, 300°, 60°
 * - Creates beautiful intertwined double helix effect
 */
export default buildWaterEffectGesture(WATERHELIX_CONFIG);
