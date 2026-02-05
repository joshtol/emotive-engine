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
 * - 5 splash rings in mandala formation (1 center + 4 outer)
 * - Anchored at center (no travel)
 * - Synchronized breathing pulse animation
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
    intensity: 0.7,         // Calmer intensity
    category: 'ambient',
    turbulence: 0.1,

    // 3D Element spawning - MANDALA: 5 rings at different heights and sizes
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',              // No travel - fixed in place
            easing: 'easeInOut',
            startScale: 1.0,
            endScale: 1.0,              // No scale change
            startDiameter: 1.8,
            endDiameter: 1.8,           // Constant diameter
            orientation: 'camera'       // Billboard: always face camera
        },
        formation: {
            type: 'mandala',            // Rings positioned in circular pattern
            count: 5,                   // 1 center + 4 outer rings
            radius: 0.5,                // Distance of outer rings from center
            arcOffset: 45,              // 45° rotation between each ring
            // Mandala scale: center large, outer rings smaller
            scales: [1.0, 0.6, 0.6, 0.6, 0.6]
        },
        count: 5,
        scale: 1.5,
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
            // Strong breathing pulse - the key feature
            pulse: {
                amplitude: 0.15,    // Noticeable breathing
                frequency: 1.5,     // Slow breath cycle
                easing: 'easeInOut'
            },
            // Gentle slow rotation around Z (spin while facing camera)
            // 5 rings with alternating directions for mandala harmony
            rotate: [
                { axis: 'z', rotations: 0.4, phase: 0 },      // Ring 0: clockwise
                { axis: 'z', rotations: -0.35, phase: 0 },    // Ring 1: counter-clockwise
                { axis: 'z', rotations: 0.25, phase: 0 },     // Ring 2: slow clockwise
                { axis: 'z', rotations: -0.35, phase: 0 },    // Ring 3: counter-clockwise
                { axis: 'z', rotations: 0.4, phase: 0 }       // Ring 4: clockwise
            ],
            scaleVariance: 0,       // Uniform for meditation
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 14,
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
            }
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
 * - 5 splash-ring models in mandala pattern
 * - Synchronized breathing pulse (scale + emissive)
 * - Calm meditative water energy
 */
export default buildWaterEffectGesture(WATERMEDITATION_CONFIG);
