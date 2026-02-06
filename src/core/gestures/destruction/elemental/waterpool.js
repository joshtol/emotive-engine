/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterpool Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterpool gesture - expanding pool rings with ripple texture
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterpool
 * @complexity ⭐ Basic
 *
 * VISUAL DIAGRAM:
 *
 *             ★             ← Mascot
 *            /|\
 *        ═══════════        ← Expanding pool rings
 *       ═════════════
 *      ═══════════════
 *
 * FEATURES:
 * - 4 horizontal rings expanding outward at feet
 * - WAVES cutout for ripple interference patterns
 * - Staggered expansion for wave effect
 * - SURFACE_SHIMMER shader for caustic patterns
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pool/puddle effects
 * - Water settling visuals
 * - Cascade reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterpool gesture configuration
 * Expanding pool rings at feet with ripple texture
 */
const WATERPOOL_CONFIG = {
    name: 'pool',
    emoji: '🫗',
    type: 'blending',
    description: 'Expanding pool rings with ripple texture',
    duration: 2500,
    beats: 4,
    intensity: 0.7,
    category: 'transform',
    turbulence: 0.15,

    // 3D Element spawning - expanding pool rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'bottom',
            startDiameter: 0.4,
            endDiameter: 3.5,
            orientation: 'horizontal',
            speedCurve: 'splash'        // Fast start, slow settle
        },
        formation: {
            type: 'ring',
            count: 4,
            phaseOffset: 0.18,
            meshRotationOffset: 90      // Rotates each ring for variety
        },
        count: 4,
        scale: 1.0,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.9,
            stagger: 0.15,
            enter: {
                type: 'scale',
                duration: 0.1,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.15,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            // WAVES cutout for ripple interference patterns
            cutout: {
                strength: 0.6,
                primary: { pattern: 4, scale: 1.4, weight: 1.0 },    // WAVES - interference ripples
                secondary: { pattern: 0, scale: 0.5, weight: 0.25 }, // CELLULAR - subtle gaps
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 1.2,
                strengthCurve: 'fadeOut'
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.25,
                    peak: 0.15,
                    end: 0.05,
                    curve: 'linear'
                }
            },
            pulse: {
                amplitude: 0.06,
                frequency: 1.5,
                easing: 'easeInOut',
                sync: 'staggered'
            },
            blending: 'normal',
            renderOrder: 5,
            modelOverrides: {
                'splash-ring': {
                    opacityLink: 'inverse-scale',
                    shaderAnimation: {
                        type: 5             // SURFACE_SHIMMER - caustic patterns
                    }
                }
            }
        }
    },

    // Wobble - settling ripples
    wobbleFrequency: 1.5,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.4,
    // Scale - subtle breathing
    scaleWobble: 0.008,
    scaleFrequency: 1.5,
    scaleSquash: 0.06,
    // Glow - calm water
    glowColor: [0.25, 0.5, 0.85],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.2,
    glowPulseRate: 1.5
};

/**
 * Waterpool gesture - expanding pool rings.
 *
 * Uses axis-travel spawn mode:
 * - 4 horizontal rings expanding at feet
 * - WAVES cutout for ripple interference
 * - Staggered appearance for wave effect
 */
export default buildWaterEffectGesture(WATERPOOL_CONFIG);
