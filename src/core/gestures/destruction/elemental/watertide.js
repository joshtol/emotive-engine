/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watertide Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watertide gesture - orbiting wave elements with tidal rhythm
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watertide
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         🌊    🌊
 *       ↻          ↺       ← Orbiting wave elements
 *     🌊    ★      🌊
 *           /|\
 *       🌊    🌊
 *
 * FEATURES:
 * - orbit mode with medium speed (0.35 rotation per gesture)
 * - Ring formation of 8 alternating wave/ring elements
 * - Tangent rotation for wave alignment
 * - Tidal rhythm pulsing
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
 * Orbiting wave elements with tidal rhythm
 */
const WATERTIDE_CONFIG = {
    name: 'tide',
    emoji: '🌊',
    type: 'blending',
    description: 'Surge - orbiting wave elements with tidal rhythm',
    duration: 3500,
    beats: 4,
    intensity: 0.9,
    category: 'ambient',
    turbulence: 0.5,

    // 3D Element spawning - orbiting waves
    spawnMode: {
        type: 'orbit',
        orbit: {
            radius: 1.3,
            height: 0,
            speed: 0.35,
            direction: 'cw'
        },
        formation: { type: 'ring', count: 8 },
        count: 8,
        models: ['wave-curl', 'splash-ring', 'wave-curl', 'splash-ring', 'wave-curl', 'splash-ring', 'wave-curl', 'splash-ring'],
        animation: {
            appearAt: 0.08,
            disappearAt: 0.88,
            stagger: 0.04,
            enter: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.12,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.2,
                    peak: 0.5,
                    end: 0.3,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.12,
                frequency: 0.8,
                easing: 'easeInOut',
                sync: 'global'
            },
            blending: 'normal',
            renderOrder: 6,
            modelOverrides: {
                'wave-curl': {
                    rotate: { axis: 'tangent', speed: 0.02, oscillate: true, range: Math.PI / 4 }
                }
            }
        }
    },

    // Tide motion - slow lateral sway
    flowFrequency: 0.4,          // Very slow
    flowAmplitude: 0.03,         // Broader movement
    flowPhaseOffset: 0,          // Simple side-to-side
    // Scale - gentle breathing
    scaleWobble: 0.02,
    scaleFrequency: 0.8,
    // Glow - ocean blue
    glowColor: [0.15, 0.45, 0.85],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.4,
    glowPulseRate: 0.8,
    // Tide-specific
    rotationFlow: 0.008,
    rotationSway: 0.03
};

/**
 * Watertide gesture - orbiting wave elements with tidal rhythm.
 *
 * Uses orbit spawn mode:
 * - Clockwise rotation at 0.35 speed
 * - Ring formation of 8 alternating elements
 * - Tangent rotation for wave alignment
 */
export default buildWaterEffectGesture(WATERTIDE_CONFIG);
