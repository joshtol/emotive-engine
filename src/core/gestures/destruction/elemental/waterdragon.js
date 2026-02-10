/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterdragon Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterdragon gesture - ascending water serpent with mixed elements
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterdragon
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *          ╭═══════════╮        ← Large ring at top
 *           ╭═══════╮           ← Medium rings middle
 *            ╭═══╮              ← Small ring at bottom
 *             ★                 ← Mascot at center
 *              ↑                ← All ascending
 *
 * FEATURES:
 * - 5 splash-rings in ascending stack (water tower)
 * - Funnel shape: narrow at bottom → wide at top
 * - axis-travel from below to above
 * - Gentle Y-axis rotation (0.5 rotations)
 * - Turbulence gradient: calm bottom → churning middle → settling top
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water summon effects
 * - Power-up transformations
 * - Dramatic water aura reveals
 * - Victory celebrations
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterdragon gesture configuration
 * Mixed ascending spiral - water elements rise in unified serpent
 */
const WATERDRAGON_CONFIG = {
    name: 'waterdragon',
    emoji: '🐉',
    type: 'blending',
    description: 'Ascending water serpent - mixed water elements spiral upward',
    duration: 4000,
    beats: 4,
    intensity: 1.7,
    category: 'transform',
    turbulence: 0.75,

    // 3D Element spawning - ascending tower of splash rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'below',
            end: 'above',
            easing: 'easeOut',
            startScale: 0.8,
            endScale: 1.3,
            startDiameter: 1.5,
            endDiameter: 2.2,
            orientation: 'camera'
        },
        formation: {
            type: 'stack',
            count: 5,
            spacing: 0.3
        },
        count: 5,
        scale: 1.3,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0.1,
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.35,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.3,
                    peak: 0.85,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.12,
                frequency: 3,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 3.5,
                frequency: 4,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.6,
                primary: { pattern: 7, scale: 1.5, weight: 1.0 },    // DISSOLVE - flowing erosion
                secondary: { pattern: 0, scale: 2.0, weight: 0.5 },  // CELLULAR - water bubbles
                blend: 'add',
                travel: 'angular',
                travelSpeed: 1.5,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 0.5,
                trailDissolve: {
                    enabled: true,
                    offset: -0.25,
                    softness: 1.3
                }
            },
            grain: {
                type: 3,
                strength: 0.1,
                scale: 0.25,
                speed: 1.5,
                blend: 'multiply'
            },
            rotate: { axis: 'y', rotations: 0.5, phase: 0 },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 14,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0.3, arcCount: 1 },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Dragon glow - deep blue ascending
    wobbleFrequency: 8,
    wobbleAmplitude: 0.012,
    glowColor: [0.2, 0.5, 1.0],
    glowIntensityMin: 1.4,
    glowIntensityMax: 3.5,
    glowPulseRate: 8,
    scaleWobble: 0.02,
    scaleFrequency: 3,
    scaleGrowth: 0.04,
    rotationEffect: true,
    rotationSpeed: 0.35
};

/**
 * Waterdragon gesture - ascending water tower.
 *
 * Uses axis-travel spawn mode with stack formation:
 * - 5 splash-rings stacked vertically
 * - Funnel shape: narrow at bottom, wide at top
 * - Gentle rotation (0.5 turns) for flowing feel
 * - DISSOLVE + CELLULAR cutout with trail dissolve
 */
export default buildWaterEffectGesture(WATERDRAGON_CONFIG);
