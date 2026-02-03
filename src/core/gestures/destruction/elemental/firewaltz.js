/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firewaltz Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firewaltz gesture - counter-rotating dance partners in 3/4 time
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firewaltz
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *       🔥  →  ←  🔥
 *           ★           ← Counter-rotating pairs
 *       🔥  ←  →  🔥      orbiting mascot
 *
 * FEATURES:
 * - 4 flame rings orbiting at fixed height
 * - Pairs counter-rotate (2 clockwise, 2 counter-clockwise)
 * - 3/4 waltz time signature feel
 * - Elegant ballroom dance motion
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Elegant fire effects
 * - Dance/waltz themes
 * - Romantic fire displays
 * - Ballroom celebrations
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firewaltz gesture configuration
 * Counter-rotating dance partners in orbital waltz
 */
const FIREWALTZ_CONFIG = {
    name: 'firewaltz',
    emoji: '💃',
    type: 'blending',
    description: 'Counter-rotating flame dance partners',
    duration: 2500,
    beats: 3,           // 3/4 time signature
    intensity: 1.0,
    category: 'radiating',
    temperature: 0.55,  // Warm romantic glow

    // 3D Element spawning - orbiting pairs
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 0.5,            // Mid-height around mascot
            radius: 1.6,            // Comfortable orbit distance
            plane: 'horizontal'
        },
        formation: {
            type: 'pairs',
            count: 4,
            pairSpacing: 180        // Pairs opposite each other
        },
        count: 4,
        scale: 0.9,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.05,
            enter: {
                type: 'scale',
                duration: 0.2,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.3,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.45,
                    peak: 0.6,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.15,
                rate: 8,
                pattern: 'sine'
            },
            pulse: {
                amplitude: 0.06,
                frequency: 3,       // 3/4 time feel
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.0,
                max: 1.8,
                frequency: 3,
                pattern: 'sine'
            },
            // Counter-rotating pairs for dance effect
            rotate: [
                { axis: 'y', rotations: 1.5, phase: 0 },      // Partner A1: clockwise
                { axis: 'y', rotations: -1.5, phase: 90 },    // Partner B1: counter
                { axis: 'y', rotations: 1.5, phase: 180 },    // Partner A2: clockwise
                { axis: 'y', rotations: -1.5, phase: 270 }    // Partner B2: counter
            ],
            // Orbit rotation for the whole formation
            orbitRotation: {
                rotations: 1,
                direction: 1
            },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 13,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 1.0,
                        arcCount: 2
                    },
                    orientationOverride: 'vertical'  // Standing rings for dance partners
                }
            }
        }
    },

    // Mesh effects - warm romantic glow
    flickerFrequency: 6,
    flickerAmplitude: 0.006,
    flickerDecay: 0.3,
    glowColor: [1.0, 0.6, 0.25],     // Warm amber
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.3,
    glowFlickerRate: 6,
    scaleVibration: 0.008,
    scaleFrequency: 3,
    scaleGrowth: 0.01,
    rotationEffect: false
};

/**
 * Firewaltz gesture - counter-rotating dance partners.
 *
 * Uses orbit spawn mode with pairs formation:
 * - 4 flame-ring models orbit at fixed height
 * - Pairs counter-rotate (clockwise vs counter-clockwise)
 * - 3/4 waltz timing creates elegant ballroom feel
 */
export default buildFireEffectGesture(FIREWALTZ_CONFIG);
