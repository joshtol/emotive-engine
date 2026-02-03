/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firecrown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firecrown gesture - majestic flame crown above the head
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firecrown
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ╭───────╮
 *        (  🔥🔥🔥  )    ← Horizontal ring spinning above head
 *         ╰───────╯
 *            ★           ← Mascot
 *           /|\
 *
 * FEATURES:
 * - Single horizontal flame ring anchored at head
 * - Slow majestic rotation (1 rotation per gesture)
 * - Gentle bob animation for floating effect
 * - Regal warm-gold color temperature
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Royal/majestic effects
 * - Achievement celebrations
 * - Power-up indicators
 * - Divine/blessed states
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firecrown gesture configuration
 * Majestic flame crown hovering above the head
 */
const FIRECROWN_CONFIG = {
    name: 'firecrown',
    emoji: '👑',
    type: 'blending',
    description: 'Majestic flame crown above the head',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'radiating',
    temperature: 0.65,  // Warm gold

    // 3D Element spawning - anchored crown ring
    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'top',
            offset: { x: 0, y: 0.05, z: 0 },  // Slight hover above mascot top
            orientation: 'flat',              // Horizontal ring
            bob: {
                amplitude: 0.02,
                frequency: 0.3                // Slow gentle bob
            }
        },
        count: 1,
        scale: 1.2,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0,
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.25,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.5,
                    peak: 0.7,
                    end: 0.6,
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
                frequency: 2,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 2.0,
                frequency: 3,
                pattern: 'sine'
            },
            // Slow majestic rotation (Z axis because ring is flat - local Z points up)
            rotate: { axis: 'z', rotations: 1, phase: 0 },
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.9,    // Wide arcs for full crown
                        arcSpeed: 0.8,    // Slow internal animation
                        arcCount: 3       // Multiple arcs for regal look
                    }
                }
            }
        }
    },

    // Mesh effects - warm golden glow
    flickerFrequency: 6,
    flickerAmplitude: 0.006,
    flickerDecay: 0.25,
    glowColor: [1.0, 0.7, 0.3],       // Warm gold
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.4,
    glowFlickerRate: 5,
    scaleVibration: 0.008,
    scaleFrequency: 3,
    scaleGrowth: 0.01,
    rotationEffect: false
};

/**
 * Firecrown gesture - majestic flame crown.
 *
 * Uses anchor spawn mode at head landmark:
 * - Single flame-ring model hovering above head
 * - Horizontal orientation (flat crown)
 * - Slow Y-axis rotation for regal spinning
 * - Gentle bob for floating effect
 */
export default buildFireEffectGesture(FIRECROWN_CONFIG);
