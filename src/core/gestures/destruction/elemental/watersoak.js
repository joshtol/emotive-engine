/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watersoak Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watersoak gesture - pulsing 5-point water star with upward drift
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watersoak
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM (BLAZE-STYLE):
 *             💧
 *           ↑   ↑
 *        💧   ★   💧       ← 5-point star formation
 *           ↑   ↑            with upward drift
 *          💧   💧
 *
 * FEATURES:
 * - 5 large droplets in star formation (like fire blaze)
 * - Strong synchronized pulsing (breathing)
 * - Gentle upward drift over lifetime
 * - Orbit mode anchored below center
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water absorption effects
 * - Gradual saturation visuals
 * - Calm water aura effects
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watersoak gesture configuration
 * Blaze-style pulsing 5-point water star with upward drift
 */
const WATERSOAK_CONFIG = {
    name: 'soak',
    emoji: '💧',
    type: 'blending',
    description: 'Pulsing 5-point water star with upward drift',
    duration: 2500,
    beats: 4,
    intensity: 0.9,
    category: 'ambient',
    turbulence: 0.2,

    // 3D Element spawning - BLAZE-STYLE: 5-point star with upward drift
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: -0.35,              // Start below mascot center
            radius: 0.25,               // Tight star formation
            plane: 'horizontal',
            orientation: 'radial'       // Point outward from center
        },
        formation: {
            type: 'ring',
            count: 5,                   // 5-point star
            startAngle: 0
        },
        count: 5,
        scale: 2.0,                     // Large droplets for presence
        models: ['droplet-large'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0.04,              // Quick cascade appearance
            enter: {
                type: 'scale',
                duration: 0.2,
                easing: 'easeOutBack'
            },
            exit: {
                type: 'fade',
                duration: 0.25,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.12,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.1,
                    peak: 0.25,
                    end: 0.15,
                    curve: 'bell'
                }
            },
            // Strong synchronized pulsing - key blaze feature
            pulse: {
                amplitude: 0.35,        // Very noticeable pulse
                frequency: 3,           // Rhythmic breathing
                easing: 'easeInOut',
                perElement: true        // Each element pulses
            },
            // Upward drift over lifetime
            drift: {
                direction: 'up',
                distance: 0.8,          // Significant upward travel
                easing: 'easeOut'
            },
            scaleVariance: 0.1,
            lifetimeVariance: 0.05,
            blending: 'normal',
            renderOrder: 8,
            modelOverrides: {
                'droplet-large': {
                    scaling: {
                        mode: 'uniform-pulse',
                        amplitude: 0.1,
                        frequency: 3
                    }
                }
            }
        }
    },

    // Wobble - gentle for calm absorption
    wobbleFrequency: 2,
    wobbleAmplitude: 0.008,
    wobbleDecay: 0.3,
    // Scale - breathing expansion
    scaleWobble: 0.015,
    scaleFrequency: 3,
    scaleGrowth: 0.03,
    // Glow - soft blue absorption
    glowColor: [0.3, 0.55, 0.85],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowPulseRate: 3
};

/**
 * Watersoak gesture - blaze-style pulsing 5-point water star.
 *
 * Uses orbit spawn mode:
 * - 5 droplet-large in star formation
 * - Strong synchronized pulsing
 * - Gentle upward drift
 */
export default buildWaterEffectGesture(WATERSOAK_CONFIG);
