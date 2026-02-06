/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firemeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firemeditation gesture - static rings with breathing pulse
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firemeditation
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ═══════
 *         ═══════        ← Stacked horizontal rings
 *           ★            ← Breathing pulse in/out
 *         ═══════
 *         ═══════
 *
 * FEATURES:
 * - 3 horizontal flame rings stacked vertically
 * - Anchored at center (no travel)
 * - Synchronized breathing pulse animation
 * - Calm meditative fire energy
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Meditation effects
 * - Calm fire displays
 * - Focusing/centering effects
 * - Spiritual fire themes
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firemeditation gesture configuration
 * Static stacked rings with breathing pulse
 */
const FIREMEDITATION_CONFIG = {
    name: 'firemeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Meditative flame rings with breathing pulse',
    duration: 4000,         // Longer for meditation feel
    beats: 4,
    intensity: 0.7,         // Calmer intensity
    category: 'radiating',
    temperature: 0.5,       // Balanced warm

    // 3D Element spawning - MANDALA: 5 rings at different heights and sizes
    // Creates a lotus/chakra-like meditation pattern
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
        scale: 1.2,
        models: ['flame-ring'],
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
                temperature: {
                    start: 0.4,
                    peak: 0.55,
                    end: 0.45,
                    curve: 'sine'   // Smooth breathing curve
                }
            },
            flicker: {
                intensity: 0.08,    // Minimal flicker for calm
                rate: 4,
                pattern: 'sine'
            },
            // Strong breathing pulse - the key feature
            pulse: {
                amplitude: 0.15,    // Noticeable breathing
                frequency: 1.5,     // Slow breath cycle
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.9,
                max: 1.5,
                frequency: 1.5,     // Synced with breath
                pattern: 'sine'
            },
            // Grain: WHITE noise for sharp, granular texture
            grain: {
                type: 2,              // WHITE - sharp granular noise
                strength: 0.5,        // Moderate - not too many holes
                scale: 0.5,           // Medium grain size
                speed: 0.5,           // Moderate animation
                blend: 'multiply'     // Creates holes for gritty texture
            },
            // Gentle slow rotation around Z (spin while facing camera)
            // 5 rings with alternating directions for mandala harmony
            rotate: [
                { axis: 'z', rotations: 0.4, phase: 0 },     // Ring 0 (top, small): clockwise
                { axis: 'z', rotations: -0.35, phase: 0 },   // Ring 1 (upper-mid): counter-clockwise
                { axis: 'z', rotations: 0.25, phase: 0 },    // Ring 2 (center, large): slow clockwise
                { axis: 'z', rotations: -0.35, phase: 0 },   // Ring 3 (lower-mid): counter-clockwise
                { axis: 'z', rotations: 0.4, phase: 0 }      // Ring 4 (bottom, small): clockwise
            ],
            scaleVariance: 0,       // Uniform for meditation
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: -5,    // Render before mascot (behind)
            modelOverrides: {
                'flame-ring': {
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

    // Mesh effects - calm warm glow
    flickerFrequency: 4,
    flickerAmplitude: 0.004,
    flickerDecay: 0.4,
    glowColor: [1.0, 0.65, 0.3],    // Soft warm gold
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.1,
    glowFlickerRate: 3,
    scaleVibration: 0.004,
    scaleFrequency: 1.5,
    scaleGrowth: 0,                  // No growth for stable meditation
    rotationEffect: false
};

/**
 * Firemeditation gesture - static rings with breathing pulse.
 *
 * Uses anchor spawn mode with stack formation:
 * - 3 flame-ring models stacked vertically at center
 * - Synchronized breathing pulse (scale + emissive)
 * - Calm meditative fire energy
 */
export default buildFireEffectGesture(FIREMEDITATION_CONFIG);
