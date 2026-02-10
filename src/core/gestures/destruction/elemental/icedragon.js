/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icedragon Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icedragon gesture - ascending ice serpent with mixed elements
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icedragon
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
 * - 5 ice-rings in ascending stack (crystalline tower)
 * - Funnel shape: narrow at bottom → wide at top
 * - axis-travel from below to above
 * - Gentle Y-axis rotation (0.5 rotations)
 * - Frost gradient: light bottom → intense middle → moderate top
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Ice summon effects
 * - Power-up transformations
 * - Dramatic ice aura reveals
 * - Victory celebrations
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icedragon gesture configuration
 * Mixed ascending spiral - ice elements rise in unified serpent
 */
const ICEDRAGON_CONFIG = {
    name: 'icedragon',
    emoji: '🐉',
    type: 'blending',
    description: 'Ascending ice serpent - mixed crystals spiral upward',
    duration: 4000,
    beats: 4,
    intensity: 1.7,
    category: 'transform',
    frost: 0.8,

    // 3D Element spawning - ascending tower of ice rings
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
        models: ['ice-ring'],
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
                frost: {
                    start: 0.3,
                    peak: 0.9,
                    end: 0.6,
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
                max: 4.0,
                frequency: 4,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.6,
                primary: { pattern: 3, scale: 1.5, weight: 1.0 },    // VORONOI - crystalline structure
                secondary: { pattern: 8, scale: 2.0, weight: 0.5 },  // CRACKS - ice fractures
                blend: 'add',
                travel: 'angular',
                travelSpeed: 0.8,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 0.5,
                trailDissolve: {
                    enabled: true,
                    offset: -0.25,
                    softness: 1.2
                }
            },
            grain: {
                type: 3,
                strength: 0.1,
                scale: 0.25,
                speed: 0.8,
                blend: 'multiply'
            },
            rotate: { axis: 'y', rotations: 0.5, phase: 0 },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 14,
            modelOverrides: {
                'ice-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0.3, arcCount: 1 },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Dragon glow - bright crystalline blue
    glowColor: [0.45, 0.75, 1.0],
    glowIntensityMin: 1.4,
    glowIntensityMax: 3.5,
    glowFlickerRate: 8,
    // Scale - ascending growth
    scaleVibration: 0.02,
    scaleFrequency: 3,
    scaleGrowth: 0.04,
    rotationEffect: true,
    rotationSpeed: 0.35
};

/**
 * Icedragon gesture - ascending crystalline tower.
 *
 * Uses axis-travel spawn mode with stack formation:
 * - 5 ice-rings stacked vertically
 * - Funnel shape: narrow at bottom, wide at top
 * - Gentle rotation (0.5 turns) for geometric crystalline feel
 * - VORONOI + CRACKS cutout with trail dissolve
 */
export default buildIceEffectGesture(ICEDRAGON_CONFIG);
