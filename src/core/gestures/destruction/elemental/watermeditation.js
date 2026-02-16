/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watermeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watermeditation gesture - mandala rings with breathing pulse
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watermeditation
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *           ○
 *        ○     ○
 *           ●           ← Mandala: center + outer rings
 *        ○     ○          Breathing pulse in/out
 *           ○
 *
 * FEATURES:
 * - 3 splash rings in mandala formation (1 center + 2 outer)
 * - Anchored at center (no travel)
 * - Synchronized breathing pulse animation
 * - CELLULAR + STREAKS cutout with angular travel (like watercrown)
 * - Calm meditative water energy
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Meditation effects
 * - Calm water displays
 * - Focusing/centering effects
 * - Spiritual water themes
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watermeditation gesture configuration
 * Mandala rings with breathing pulse
 */
const WATERMEDITATION_CONFIG = {
    name: 'watermeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Meditative water rings with breathing pulse',
    duration: 4000,         // Longer for meditation feel
    beats: 4,
    intensity: 0.5,         // Calmer intensity (reduced to prevent white buildup)
    category: 'ambient',
    turbulence: 0.1,

    // 3D Element spawning - MANDALA: 3 rings (1 center + 2 outer)
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',              // No travel - fixed in place
            easing: 'easeInOut',
            startScale: 1.3,
            endScale: 1.3,              // No scale change
            startDiameter: 2.2,
            endDiameter: 2.2,           // Constant diameter
            orientation: 'camera'       // Billboard: always face camera
        },
        formation: {
            type: 'mandala',            // Rings positioned in circular pattern
            count: 3,                   // 1 center + 2 outer rings
            radius: 0.5,                // Distance of outer rings from center
            arcOffset: 60,              // 60° rotation between each ring
            // Mandala scale: center large, outer rings smaller
            scales: [1.0, 0.7, 0.7]
        },
        count: 3,
        scale: 1.8,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.8,
            stagger: 0,             // All appear together
            enter: {
                type: 'fade',
                duration: 0.5,      // Slow, gentle fade in
                easing: 'easeInOut'
            },
            exit: {
                type: 'fade',
                duration: 0.4,      // Slow, gentle fade out
                easing: 'easeInOut'
            },
            procedural: {
                scaleSmoothing: 0.15,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.05,
                    peak: 0.12,
                    end: 0.08,
                    curve: 'sine'   // Smooth breathing curve
                }
            },
            // Organic cellular holes with flow streaks (like watercrown)
            cutout: {
                strength: 0.6,
                primary: { pattern: 0, scale: 0.8, weight: 1.0 },   // CELLULAR - organic bubbles
                secondary: { pattern: 1, scale: 0.6, weight: 0.5 }, // STREAKS - subtle flow
                blend: 'multiply',
                travel: 'angular',                                   // Sweep around ring
                travelSpeed: 0.5,                                    // Slow meditative sweep
                strengthCurve: 'constant',                           // Always textured
                // Trail dissolve: organic fade at bottom of camera-facing rings
                trailDissolve: {
                    enabled: true,
                    offset: -0.5,        // Floor below ring center
                    softness: 1.8        // Wide soft gradient for ethereal look
                }
            },
            // Grain: subtle film grain for serene water texture
            grain: {
                type: 3,              // FILM
                strength: 0.15,       // Subtle for meditation calm
                scale: 0.3,
                speed: 0.8,           // Slow for meditative feel
                blend: 'multiply'
            },
            // Strong breathing pulse - the key feature
            pulse: {
                amplitude: 0.15,    // Noticeable breathing
                frequency: 1.5,     // Slow breath cycle
                easing: 'easeInOut'
            },
            // Gentle slow rotation around Z (spin while facing camera)
            // 3 rings with alternating directions for mandala harmony
            rotate: [
                { axis: 'z', rotations: 0.4, phase: 0 },      // Ring 0: clockwise
                { axis: 'z', rotations: -0.35, phase: 0 },    // Ring 1: counter-clockwise
                { axis: 'z', rotations: 0.3, phase: 0 }       // Ring 2: slow clockwise
            ],
            scaleVariance: 0,       // Uniform for meditation
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: -5,    // Render before mascot (behind)
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.9,    // Wide arcs for full rings
                        arcSpeed: 0.5,    // Slow internal animation
                        arcCount: 2
                    },
                    orientationOverride: 'camera'
                }
            },
            // No atmospherics — meditation is peaceful, no violent water motion
        }
    },

    // Wobble - minimal for calm
    wobbleFrequency: 1,
    wobbleAmplitude: 0.003,
    wobbleDecay: 0.5,
    // Scale - synchronized breathing
    scaleWobble: 0.004,
    scaleFrequency: 1.5,
    scaleGrowth: 0,                  // No growth for stable meditation
    // Glow - soft serene blue
    glowColor: [0.3, 0.6, 0.9],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.1,
    glowPulseRate: 1.5
};

/**
 * Watermeditation gesture - mandala rings with breathing pulse.
 *
 * Uses axis-travel with mandala formation:
 * - 3 splash-ring models in mandala pattern
 * - Synchronized breathing pulse (scale + emissive)
 * - CELLULAR + STREAKS cutout with angular travel for organic texture
 * - Calm meditative water energy
 */
export default buildWaterEffectGesture(WATERMEDITATION_CONFIG);
