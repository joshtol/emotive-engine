/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firewaltz Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firewaltz gesture - elegant spinning dance partners
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firewaltz
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ║        ║
 *         ║   ★    ║       ← Vertical rings as dance partners
 *         ║        ║         spinning around mascot
 *
 *      ↺    ↻    ↺    ↻    ← Counter-rotating pairs
 *
 * FEATURES:
 * - 4 vertical flame rings positioned around mascot
 * - Counter-rotating pairs (elegant dance motion)
 * - 3/4 waltz timing with graceful pulse
 * - Standing rings like ballroom dancers
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
 * Elegant spinning dance partners in waltz formation
 */
const FIREWALTZ_CONFIG = {
    name: 'firewaltz',
    emoji: '💃',
    type: 'blending',
    description: 'Elegant flame dance partners',
    duration: 2500,
    beats: 3,                   // 3/4 time signature
    intensity: 1.0,
    category: 'radiating',
    temperature: 0.55,          // Warm romantic glow

    // 4 vertical rings around mascot
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 0.3,            // Slightly above center
            radius: 1.4,            // Close orbit for intimacy
            plane: 'horizontal',
            orientation: 'vertical' // Standing rings (dance partners)
        },
        formation: {
            type: 'ring',           // Evenly distributed
            count: 4,
            startAngle: 45          // Offset from cardinal directions
        },
        count: 4,
        scale: 0.85,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0.08,          // Slight delay between partners
            enter: {
                type: 'scale',
                duration: 0.25,
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
                    curve: 'sine'       // Smooth romantic curve
                }
            },
            flicker: {
                intensity: 0.1,
                rate: 6,
                pattern: 'sine'
            },
            // Waltz pulse - 3/4 time feel
            pulse: {
                amplitude: 0.08,
                frequency: 2,           // 2 pulses over gesture = waltz feel
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.0,
                max: 1.6,
                frequency: 2,
                pattern: 'sine'
            },
            // Counter-rotating dance partners
            // Partners 0,2 spin one way, 1,3 spin the other
            rotate: [
                { axis: 'y', rotations: 2.0, phase: 0 },     // Partner 0: fast CW
                { axis: 'y', rotations: -2.0, phase: 0 },    // Partner 1: fast CCW
                { axis: 'y', rotations: 2.0, phase: 0 },     // Partner 2: fast CW
                { axis: 'y', rotations: -2.0, phase: 0 }     // Partner 3: fast CCW
            ],
            scaleVariance: 0.05,
            lifetimeVariance: 0.05,
            blending: 'additive',
            renderOrder: 13,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.65,     // Partial arcs for dancer silhouette
                        arcSpeed: 1.5,
                        arcCount: 2
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Mesh effects - warm romantic glow
    flickerFrequency: 5,
    flickerAmplitude: 0.005,
    flickerDecay: 0.3,
    glowColor: [1.0, 0.55, 0.2],    // Warm amber-orange
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.4,
    glowFlickerRate: 4,
    scaleVibration: 0.006,
    scaleFrequency: 2,
    scaleGrowth: 0.008,
    rotationEffect: false
};

/**
 * Firewaltz gesture - elegant spinning dance partners.
 *
 * Uses orbit mode with ring formation:
 * - 4 vertical flame-ring models around mascot
 * - Counter-rotating pairs create dance motion
 * - 3/4 waltz timing for elegant ballroom feel
 * - Standing orientation like dancing partners
 */
export default buildFireEffectGesture(FIREWALTZ_CONFIG);
