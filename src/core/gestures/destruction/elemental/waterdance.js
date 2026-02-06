/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterdance Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterdance gesture - vertical splash rings dancing upward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterdance
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *         ╱│╲        TOP (expanding)
 *        ╱ │ ╲
 *       │  │  │      ← Vertical rings
 *       │  ★  │        dancing upward
 *       │  │  │      ← 120° apart
 *        ╲ │ ╱
 *         ╲│╱        BOTTOM (converging)
 *
 * FEATURES:
 * - 3 splash rings with vertical orientation
 * - Rings travel from bottom to top
 * - DANCING COINS rotation: all spin on Y axis, 120° phase offset
 * - Two-layer cutout: WAVES + CELLULAR with wave travel
 * - Bell strength curve peaks mid-gesture
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Celebratory water effects
 * - Dancing water auras
 * - Rhythmic water displays
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterdance gesture configuration
 * Vertical splash rings dancing and rising around the mascot
 */
const WATERDANCE_CONFIG = {
    name: 'waterdance',
    emoji: '💃',
    type: 'blending',
    description: 'Vertical splash rings dancing and rising',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'ambient',
    turbulence: 0.4,

    // 3D Element spawning - vertical dancing rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',            // Start at mascot's feet
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.4,
            endScale: 1.8,
            startDiameter: 1.3,
            endDiameter: 2.0,
            orientation: 'vertical'     // Standing rings for dance effect
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.0,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.02,
            disappearAt: 0.5,           // Start fading at halfway point
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.08,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.5,          // Fade over second half
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            // Cutout: CELLULAR + STREAKS for organic water texture (like watercrown)
            // Angular travel with slow sweep for flowing effect
            // fadeIn with short duration so cutout reaches full before rings fade out at 50%
            cutout: {
                strength: 0.7,
                primary: { pattern: 0, scale: 0.8, weight: 1.0 },   // CELLULAR - organic holes
                secondary: { pattern: 1, scale: 0.6, weight: 0.5 }, // STREAKS - subtle flow
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 0.3,        // Slow sweep like watercrown
                strengthCurve: 'fadeIn',
                fadeInDuration: 0.167,   // Reach full strength at 1/6 of gesture (very quick ramp)
                // Trail dissolve: bottoms of rings fade as they rise
                // Negative offset = floor below instance, softness must be large (threshold compresses gradient)
                // Binary threshold (0.5) compresses gradient - need softness ~2x wider than desired visual effect
                trailDissolve: {
                    enabled: true,
                    offset: -0.8,        // Floor 0.8 units below instance center (well below ring geometry)
                    softness: 2.0        // Very wide gradient to compensate for threshold compression
                }
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.2,
                    peak: 0.45,
                    end: 0.25,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.1,
                frequency: 5,
                easing: 'easeInOut'
            },
            // Dance partners: two mirror each other, one does a flourish
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },      // Lead: 2 rotations
                { axis: 'y', rotations: -2, phase: 60 },    // Partner: counter-rotation!
                { axis: 'y', rotations: 3, phase: 120 }     // Flourish: faster accent
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 11,
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
            }
        }
    },

    // Wobble - rhythmic for dance
    wobbleFrequency: 3,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.2,
    // Scale - dynamic breathing
    scaleWobble: 0.018,
    scaleFrequency: 4,
    scaleGrowth: 0.025,
    // Glow - vibrant blue
    glowColor: [0.25, 0.55, 0.95],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowPulseRate: 6,
    // Dance-specific
    rotationFlow: 0.02
};

/**
 * Waterdance gesture - vertical splash rings dancing upward.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 splash-ring models travel from bottom to top
 * - Rings are VERTICAL (orientation: 'vertical') for dance effect
 * - 120° arcOffset spreads rings around the mascot
 * - DANCING rotation: lead, partner (counter), flourish
 */
export default buildWaterEffectGesture(WATERDANCE_CONFIG);
