/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterdrench Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterdrench gesture - expanding shockwave from center
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterdrench
 * @complexity ⭐ Basic
 *
 * VISUAL DIAGRAM:
 *
 *        ╭─────────╮
 *       ╭───────────╮        ← Ring expands outward from center
 *      ╭─────────────╮
 *           ★                ← Mascot at center
 *      ╰─────────────╯
 *       ╰───────────╯
 *        ╰─────────╯
 *
 * FEATURES:
 * - Single camera-facing ring expanding from center
 * - Quick shockwave/splash impact feel
 * - Two-layer cutout: CELLULAR + RIPPLES for bubbly expanding waves
 * - Film grain for spray texture
 * - FadeOut curve + trail dissolve creates umbrella silhouette
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water impact effects
 * - Splash reactions
 * - Getting drenched visuals
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterdrench gesture configuration
 * Expanding shockwave from center
 */
const WATERDRENCH_CONFIG = {
    name: 'drench',
    emoji: '🌊',
    type: 'blending',
    description: 'Expanding water shockwave',
    duration: 1000,
    beats: 2,
    intensity: 1.0,
    category: 'impact',
    turbulence: 0.4,

    // 3D Element spawning - expanding shockwave
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',              // Stay at center
            easing: 'linear',
            startScale: 0.2,
            endScale: 2.5,              // Dramatic expansion
            startDiameter: 0.3,
            endDiameter: 2.5,
            orientation: 'camera'       // Face camera
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
            disappearAt: 0.8,
            stagger: 0,
            enter: {
                type: 'scale',
                duration: 0.08,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.25,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.06,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.5,
                    peak: 0.3,
                    end: 0.1,
                    curve: 'bell'
                }
            },
            // Two-layer cutout: CELLULAR + VORONOI for chunky irregular edge
            cutout: {
                strength: 0.5,
                primary: { pattern: 0, scale: 1.3, weight: 1.0 },    // CELLULAR - larger bubbles
                secondary: { pattern: 3, scale: 0.6, weight: 0.7 },  // VORONOI - chunky edge bites
                blend: 'multiply',
                travel: 'radial',            // Expand outward (original)
                travelSpeed: 1.5,
                strengthCurve: 'fadeOut',    // Fade as it expands
                trailDissolve: {
                    enabled: true,
                    offset: -0.3,
                    softness: 1.4            // Original values that hid bottom
                }
            },
            // Grain: film grain for spray texture
            grain: {
                type: 3,              // FILM
                strength: 0.2,
                scale: 0.25,
                speed: 2.5,
                blend: 'multiply'
            },
            pulse: {
                amplitude: 0.05,
                frequency: 2,
                easing: 'easeOut'
            },
            blending: 'additive',
            renderOrder: 10,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.95,      // Nearly full ring
                        arcSpeed: 0.4,
                        arcCount: 1
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Wobble - impact
    wobbleFrequency: 2,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.6,
    // Scale
    scaleWobble: 0.01,
    scaleFrequency: 2,
    scaleGrowth: 0,
    // Glow - water blue
    glowColor: [0.2, 0.5, 0.9],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.3,
    glowPulseRate: 2
};

/**
 * Waterdrench gesture - expanding shockwave.
 *
 * Uses axis-travel spawn mode:
 * - Single camera-facing splash-ring at center
 * - Expands dramatically outward
 * - Two-layer cutout: CELLULAR + RIPPLES
 * - FadeOut + trail dissolve creates umbrella silhouette
 */
export default buildWaterEffectGesture(WATERDRENCH_CONFIG);
