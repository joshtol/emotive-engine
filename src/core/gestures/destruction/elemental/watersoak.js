/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watersoak Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watersoak gesture - contracting shockwave (reverse drench)
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watersoak
 * @complexity ⭐ Basic
 *
 * VISUAL DIAGRAM:
 *
 *      ╰─────────────╯       ← Ring starts large
 *       ╰───────────╯
 *        ╰─────────╯         ← Contracts inward
 *           ★                ← Mascot absorbs water
 *
 * FEATURES:
 * - Single camera-facing ring contracting to center
 * - Reverse of waterdrench - water being absorbed
 * - CELLULAR cutout for bubbly water texture
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water absorption effects
 * - Soaking/absorbing visuals
 * - Pulling water inward
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watersoak gesture configuration
 * Contracting shockwave (reverse drench)
 */
const WATERSOAK_CONFIG = {
    name: 'soak',
    emoji: '💧',
    type: 'blending',
    description: 'Contracting water shockwave (reverse drench)',
    duration: 1000,
    beats: 2,
    intensity: 1.0,
    category: 'impact',
    turbulence: 0.4,

    // 3D Element spawning - contracting shockwave
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'linear',
            startScale: 1.8,            // Start moderately large (not too big)
            endScale: 0.3,              // Contract to small
            startDiameter: 2.0,
            endDiameter: 0.4,
            orientation: 'camera'
        },
        formation: {
            type: 'stack',
            count: 1,
            spacing: 0
        },
        count: 1,
        scale: 1.2,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.85,
            stagger: 0,
            enter: {
                type: 'fade',
                duration: 0.08,
                easing: 'easeOut'
            },
            exit: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.06,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.1,
                    peak: 0.35,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            // CELLULAR cutout
            cutout: {
                strength: 0.5,
                primary: { pattern: 0, scale: 0.8, weight: 1.0 },
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 1.5,
                strengthCurve: 'fadeIn',
                trailDissolve: {
                    enabled: true,
                    offset: -0.3,
                    softness: 1.4
                }
            },
            pulse: {
                amplitude: 0.05,
                frequency: 2,
                easing: 'easeIn'
            },
            blending: 'additive',
            renderOrder: 10,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.95,
                        arcSpeed: 0.4,
                        arcCount: 1
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Wobble
    wobbleFrequency: 2,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.6,
    // Scale
    scaleWobble: 0.01,
    scaleFrequency: 2,
    scaleGrowth: 0,
    // Glow
    glowColor: [0.2, 0.5, 0.9],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.3,
    glowPulseRate: 2
};

/**
 * Watersoak gesture - contracting shockwave (reverse drench).
 *
 * Uses axis-travel spawn mode:
 * - Single camera-facing splash-ring at center
 * - Contracts from large (1.8) to small (0.3)
 * - CELLULAR cutout for bubbly texture
 * - Quick absorption feel
 */
export default buildWaterEffectGesture(WATERSOAK_CONFIG);
