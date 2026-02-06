/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watertide Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watertide gesture - orbiting wave rings with tidal rhythm
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watertide
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ○      ○
 *       ↻          ↺       ← Orbiting splash rings
 *     ○      ★      ○
 *           /|\
 *         ○      ○
 *
 * FEATURES:
 * - orbit mode with 6 camera-facing splash-rings
 * - WAVES + CELLULAR cutout for tidal texture
 * - Tidal rhythm pulsing and bobbing
 * - Angular cutout travel
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Ocean/sea effects
 * - Tidal wave visuals
 * - Surge reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watertide gesture configuration
 * Orbiting wave rings with tidal rhythm
 */
const WATERTIDE_CONFIG = {
    name: 'tide',
    emoji: '🌊',
    type: 'blending',
    description: 'Orbiting wave rings with tidal rhythm',
    duration: 3000,
    beats: 4,
    intensity: 0.9,
    category: 'ambient',
    turbulence: 0.4,

    // 3D Element spawning - orbiting waves
    spawnMode: {
        type: 'orbit',
        orbit: {
            radius: 1.4,
            height: 0,
            speed: 0.4,
            direction: 'cw'
        },
        formation: { type: 'ring', count: 6 },
        count: 6,
        scale: 0.9,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.06,
            enter: {
                type: 'scale',
                duration: 0.12,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.15,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.25,
                    peak: 0.45,
                    end: 0.2,
                    curve: 'bell'
                }
            },
            // WAVES cutout for tidal texture
            cutout: {
                strength: 0.5,
                primary: { pattern: 4, scale: 1.2, weight: 1.0 },    // WAVES - tidal texture
                secondary: { pattern: 0, scale: 0.6, weight: 0.3 },  // CELLULAR - organic gaps
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 0.6,
                strengthCurve: 'constant'
            },
            pulse: {
                amplitude: 0.15,
                frequency: 1.0,
                easing: 'easeInOut',
                sync: 'global'
            },
            // Elements bob up and down with tidal rhythm
            bob: {
                amplitude: 0.08,
                frequency: 0.8,
                sync: 'wave'            // Wave pattern around the ring
            },
            blending: 'additive',
            renderOrder: 6,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.75,
                        arcSpeed: 0.8,
                        arcCount: 2
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Tide motion - slow sway
    flowFrequency: 0.5,
    flowAmplitude: 0.025,
    flowPhaseOffset: 0,
    // Scale - gentle breathing
    scaleWobble: 0.018,
    scaleFrequency: 1.0,
    // Glow - ocean blue
    glowColor: [0.15, 0.45, 0.85],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.5,
    glowPulseRate: 1.0
};

/**
 * Watertide gesture - orbiting wave rings with tidal rhythm.
 *
 * Uses orbit spawn mode:
 * - 6 camera-facing splash-rings orbiting clockwise
 * - WAVES cutout for tidal texture
 * - Bobbing animation for tidal feel
 */
export default buildWaterEffectGesture(WATERTIDE_CONFIG);
