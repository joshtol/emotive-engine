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

    // 3D Element spawning - stacked rings with minimal travel (stationary feel)
    // Using axis-travel because anchor mode doesn't support stack formation
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'center',              // Short travel - stays low
            easing: 'easeInOut',
            startScale: 1.0,
            endScale: 1.0,              // No scale change
            startDiameter: 1.8,
            endDiameter: 1.8,           // Constant diameter
            orientation: 'flat'
        },
        formation: {
            type: 'stack',
            count: 3,
            spacing: 0.25              // Vertical spacing between rings
        },
        count: 3,
        scale: 1.2,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0.1,
            enter: {
                type: 'scale',
                duration: 0.3,      // Slow, calm entrance
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.25,
                easing: 'easeIn'
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
            // Gentle slow rotation
            rotate: { axis: 'z', rotations: 0.5, phase: 0 },
            scaleVariance: 0,       // Uniform for meditation
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: 14,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.9,    // Wide arcs for full rings
                        arcSpeed: 0.5,    // Slow internal animation
                        arcCount: 2
                    }
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
