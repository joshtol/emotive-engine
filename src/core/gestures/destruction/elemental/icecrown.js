/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icecrown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icecrown gesture - majestic ice crown above the head
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icecrown
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ╭───────╮
 *        (  ❄️❄️❄️  )    ← Crystal cluster spinning above head
 *         ╰───────╯
 *            ★           ← Mascot
 *           /|\
 *
 * FEATURES:
 * - Single ice-ring anchored at head
 * - Slow majestic rotation (1 rotation per gesture)
 * - Gentle bob animation for floating effect
 * - Smooth glossy ice material (Beer's Law absorption + specular)
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Royal/majestic ice effects
 * - Ice mastery indicators
 * - Frozen crown/blessed states
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icecrown gesture configuration
 * Majestic ice crown hovering above the head
 */
const ICECROWN_CONFIG = {
    name: 'icecrown',
    emoji: '👑',
    type: 'blending',
    description: 'Majestic ice crown above the head',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'transform',
    frost: 0.65,

    // 3D Element spawning - just the ice-ring model rotating
    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'top',
            offset: { x: 0, y: 0.05, z: 0 },
            orientation: 'flat',
            bob: {
                amplitude: 0.02,
                frequency: 0.3
            }
        },
        count: 1,
        scale: 2.2,
        models: ['ice-ring'],
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
            pulse: {
                amplitude: 0.02,
                frequency: 2,
                easing: 'easeInOut'
            },
            // Per-gesture atmospheric particles: cold mist below crown
            atmospherics: [{
                preset: 'mist',
                targets: ['ice-ring'],
                anchor: 'below',
                intensity: 0.3,
                sizeScale: 1.0,
                progressCurve: 'sustain',
            }],
            rotate: { axis: 'z', rotations: 1, phase: 0 },
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 15
        }
    },

    // Glow - constant, no flicker
    glowColor: [0.6, 0.85, 1.0],
    glowIntensityMin: 0.8,
    glowIntensityMax: 0.8,
    glowFlickerRate: 0,
    // Subtle scale dynamics (min/max stay close)
    scaleVibration: 0.003,
    scaleFrequency: 3,
    scaleGrowth: 0.005,
    // No tremor
    tremor: 0,
    tremorFrequency: 0,
    tremorDecay: 0
};

/**
 * Icecrown gesture - majestic ice crown.
 *
 * Uses anchor spawn mode at head landmark:
 * - Single crystal-cluster model hovering above head
 * - Horizontal orientation (flat crown)
 * - Slow Z-axis rotation for regal spinning
 * - Gentle bob for floating effect
 */
export default buildIceEffectGesture(ICECROWN_CONFIG);
