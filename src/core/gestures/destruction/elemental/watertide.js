/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watertide Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watertide gesture - single large wave with animated cutout texture
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watertide
 * @complexity ⭐ Simple
 *
 * VISUAL DIAGRAM:
 *
 *        ╭─────────╮
 *        │  〰️〰️〰️  │         <- Single wave-curl
 *        │    ★    │            Camera-locked
 *        │  〰️〰️〰️  │            Cutout animated
 *        ╰─────────╯
 *
 * FEATURES:
 * - Single large wave-curl locked to camera
 * - Fast-moving WAVES cutout creates tidal motion
 * - Breathing pulse for scale rhythm
 * - Clean, focused, minimal GPU
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Ocean/sea effects
 * - Tidal rhythm visuals
 * - Simple water ambiance
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watertide gesture configuration
 * Single large wave with animated cutout texture
 */
const WATERTIDE_CONFIG = {
    name: 'tide',
    emoji: '🌊',
    type: 'blending',
    description: 'Single wave with animated tidal cutout',
    duration: 1500,
    beats: 2,
    intensity: 0.8,
    category: 'ambient',
    turbulence: 0.3,

    // 3D Element spawning - single large wave-curl using axis-travel (stationary)
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            startOffset: 0,
            endOffset: 0,
            easing: 'linear',
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.0,
            endDiameter: 1.0,
            orientation: 'camera'
        },
        formation: { type: 'ring', count: 1, phaseOffset: 0 },
        count: 1,
        scale: 4.4,
        models: ['wave-curl'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.9,
            stagger: 0,
            enter: { type: 'grow', duration: 0.3, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.35, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.15, geometryStability: true },
            // Rotating wave cutout - angular sweep creates swirling tide
            cutout: {
                strength: 0.55,
                primary: { pattern: 4, scale: 1.2, weight: 1.0 },    // WAVES
                secondary: { pattern: 0, scale: 0.6, weight: 0.25 }, // CELLULAR - organic texture
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: -1.5,          // Clockwise rotating sweep
                strengthCurve: 'constant'
            },
            grain: { type: 3, strength: 0.2, scale: 0.25, speed: 1.0, blend: 'multiply' },
            rotate: { axis: 'z', rotations: -0.25, phase: 0 },  // Clockwise rotation
            // Breathing pulse for tidal rhythm
            pulse: { amplitude: 0.15, frequency: 0.6, easing: 'easeInOut' },
            blending: 'additive',
            renderOrder: 6,
            modelOverrides: {
                'wave-curl': {
                    // Slower, wider arc sweep for flowing wave motion
                    shaderAnimation: { type: 1, arcWidth: 0.7, arcSpeed: 0.8, arcCount: 2 },
                    orientationOverride: 'camera'
                }
            },
            // No atmospherics — tidal motion is smooth, no violent splash
        }
    },

    // Wobble - gentle sway
    wobbleFrequency: 0.8,
    wobbleAmplitude: 0.005,
    wobbleDecay: 0.4,
    // Scale - tidal breathing
    scaleWobble: 0.008,
    scaleFrequency: 0.8,
    // Glow - ocean blue
    glowColor: [0.15, 0.45, 0.85],
    glowIntensityMin: 0.85,
    glowIntensityMax: 1.4,
    glowPulseRate: 0.8
};

/**
 * Watertide gesture - single wave with animated cutout.
 *
 * Uses axis-travel mode (stationary) with single element:
 * - 1 large wave-curl locked to camera
 * - Fast horizontal WAVES cutout travel creates tidal motion
 * - Breathing pulse for rhythm
 * - Clean, focused, minimal GPU overhead
 */
export default buildWaterEffectGesture(WATERTIDE_CONFIG);
