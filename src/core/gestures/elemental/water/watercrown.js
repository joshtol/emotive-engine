/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watercrown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watercrown gesture - majestic water crown above the head
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watercrown
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ╭───────╮
 *        (  💧💧💧  )    ← Horizontal ring spinning above head
 *         ╰───────╯
 *            ★           ← Mascot
 *           /|\
 *
 * FEATURES:
 * - Single horizontal splash ring anchored at head
 * - Slow majestic rotation (1 rotation per gesture)
 * - Gentle bob animation for floating effect
 * - Regal cool-blue color
 * - Two-layer cutout: CELLULAR + STREAKS for organic breaks
 * - Angular travel sweeps cutout around the ring
 * - Constant cutout strength (water always has texture)
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Royal/majestic water effects
 * - Achievement celebrations
 * - Water mastery indicators
 * - Blessed/divine states
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watercrown gesture configuration
 * Majestic water crown hovering above the head
 */
const WATERCROWN_CONFIG = {
    name: 'watercrown',
    emoji: '👑',
    type: 'blending',
    description: 'Majestic water crown above the head',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    mascotGlow: 0.3,
    category: 'ambient',
    turbulence: 0.2,

    // 3D Element spawning - anchored crown ring
    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'top',
            offset: { x: 0, y: 0.1, z: 0 }, // Higher hover for larger crown
            orientation: 'flat', // Horizontal ring
            bob: {
                amplitude: 0.025,
                frequency: 0.3, // Slow gentle bob
            },
        },
        count: 1,
        scale: 2.0,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0,
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut',
            },
            exit: {
                type: 'fade',
                duration: 0.25,
                easing: 'easeIn',
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true,
            },
            // No cutout — transparent refraction shows background through water
            // No grain — multiply grain on transparent refraction = dark speckles
            parameterAnimation: {
                turbulence: {
                    start: 0.1,
                    peak: 0.25,
                    end: 0.15,
                    curve: 'bell',
                },
            },
            pulse: {
                amplitude: 0.06,
                frequency: 2,
                easing: 'easeInOut',
            },
            // Slow majestic rotation (Z axis because ring is flat)
            rotate: { axis: 'z', rotations: 1, phase: 0 },
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 15,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.9, // Wide arcs for full crown
                        arcSpeed: 0.8, // Slow internal animation
                        arcCount: 3, // Multiple arcs for regal look
                    },
                },
            },
            // No atmospherics — crown floats serenely, no violent water motion
        },
    },

    // Wobble - minimal for regal effect
    wobbleFrequency: 1.5,
    wobbleAmplitude: 0.005,
    wobbleDecay: 0.3,
    // Scale - gentle breathing
    scaleWobble: 0.008,
    scaleFrequency: 2,
    scaleGrowth: 0.01,
    // Glow - cool regal blue
    glowColor: [0.3, 0.6, 1.0],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.4,
    glowPulseRate: 3,
};

/**
 * Watercrown gesture - majestic water crown.
 *
 * Uses anchor spawn mode at head landmark:
 * - Single splash-ring model hovering above head
 * - Horizontal orientation (flat crown)
 * - Slow Z-axis rotation for regal spinning
 * - Gentle bob for floating effect
 */
export default buildWaterEffectGesture(WATERCROWN_CONFIG);
