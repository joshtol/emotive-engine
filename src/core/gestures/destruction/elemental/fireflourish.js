/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fireflourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fireflourish gesture - expanding spiral flourish
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireflourish
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *              🔥
 *          🔥      🔥        ← Rings expand outward
 *        🔥    ★    🔥        in spiral pattern
 *          🔥      🔥        like drawing with fire
 *              🔥
 *
 * FEATURES:
 * - 5 camera-facing rings in kaleidoscope spiral
 * - Expand outward from center while rotating
 * - Like drawing a fire spiral in the air
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Theatrical fire displays
 * - Magic casting flourishes
 * - Celebration effects
 * - Artistic fire patterns
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Fireflourish gesture configuration
 * Expanding spiral flourish - rings bloom outward
 */
const FIREFLOURISH_CONFIG = {
    name: 'fireflourish',
    emoji: '🌀',
    type: 'blending',
    description: 'Expanding spiral flame flourish',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'radiating',
    temperature: 0.6,

    // 3D Element spawning - expanding spiral
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',              // Stay centered (expand via diameter)
            easing: 'easeOut',
            startScale: 0.3,            // Start small
            endScale: 1.2,              // Grow larger
            startDiameter: 0.5,         // Start tight
            endDiameter: 2.5,           // Expand outward
            orientation: 'camera'       // Always face camera
        },
        formation: {
            type: 'spiral',
            count: 5,
            spacing: 0,                 // All at same position (kaleidoscope)
            arcOffset: 72               // 72° between rings (360/5)
        },
        count: 5,
        scale: 0.9,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0.06,              // Sequential bloom
            enter: {
                type: 'scale',
                duration: 0.2,
                easing: 'easeOut'
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
                temperature: {
                    start: 0.5,
                    peak: 0.7,
                    end: 0.55,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.15,
                rate: 15,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.1,
                frequency: 6,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 2.5,
                frequency: 6,
                pattern: 'sine'
            },
            // Counter-rotating for flourish effect
            rotate: [
                { axis: 'z', rotations: 1.0, phase: 0 },
                { axis: 'z', rotations: -1.0, phase: 72 },
                { axis: 'z', rotations: 1.0, phase: 144 },
                { axis: 'z', rotations: -1.0, phase: 216 },
                { axis: 'z', rotations: 1.0, phase: 288 }
            ],
            scaleVariance: 0.1,
            lifetimeVariance: 0.08,
            blending: 'additive',
            renderOrder: 12,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.6,      // Partial arcs for flourish look
                        arcSpeed: 2.5,
                        arcCount: 2
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Mesh effects - warm fire glow
    flickerFrequency: 12,
    flickerAmplitude: 0.008,
    flickerDecay: 0.2,
    glowColor: [1.0, 0.6, 0.2],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.6,
    glowFlickerRate: 10,
    scaleVibration: 0.01,
    scaleFrequency: 5,
    scaleGrowth: 0.02,
    rotationEffect: false
};

/**
 * Fireflourish gesture - expanding spiral flourish.
 *
 * Uses axis-travel with camera-facing spiral:
 * - 5 flame-ring models in kaleidoscope formation
 * - Expand from center outward while rotating
 * - Counter-rotating pairs create flourish motion
 */
export default buildFireEffectGesture(FIREFLOURISH_CONFIG);
