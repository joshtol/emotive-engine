/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterflow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterflow gesture - gentle river current drifting across
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterflow
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *
 *       〰️  →  〰️  →            <- Upper current
 *              ★
 *         〰️  →  〰️  →          <- Lower current (staggered)
 *
 * FEATURES:
 * - Mixed splash-rings and wave-curls drifting horizontally
 * - Two vertical levels for depth
 * - Camera-facing elements with horizontal drift
 * - WAVES + STREAKS cutout for flowing water texture
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Peaceful water effects
 * - Flowing river visuals
 * - Calm current reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterflow gesture configuration
 * Gentle river current - elements drifting across at two heights
 */
const WATERFLOW_CONFIG = {
    name: 'flow',
    emoji: '〰️',
    type: 'blending',
    description: 'Gentle river current drifting across',
    duration: 3000,
    beats: 4,
    intensity: 0.7,
    category: 'ambient',
    turbulence: 0.2,

    // 3D Element spawning - two layers at different heights
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Upper current - splash-rings
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                startOffset: 0.25,          // Upper position
                endOffset: 0.25,
                easing: 'linear',
                startScale: 0.7,
                endScale: 1.1,
                startDiameter: 1.0,
                endDiameter: 1.3,
                orientation: 'camera'
            },
            formation: {
                type: 'ring',
                count: 3,
                phaseOffset: 0.2
            },
            count: 3,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                stagger: 0.18,
                enter: { type: 'fade', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                // Horizontal drift - left to right
                drift: {
                    speed: 0.45,
                    distance: 2.2,
                    direction: { x: 1.0, y: 0.05, z: 0 },  // Slight upward arc
                    easing: 'easeInOut'
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 1.3, weight: 1.0 },    // WAVES
                    secondary: { pattern: 1, scale: 0.6, weight: 0.35 }, // STREAKS
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.2,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.2, scale: 0.25, speed: 1.5, blend: 'multiply' },
                rotate: [
                    { axis: 'z', rotations: 0.25, phase: 0 },
                    { axis: 'z', rotations: -0.2, phase: 120 },
                    { axis: 'z', rotations: 0.3, phase: 240 }
                ],
                pulse: { amplitude: 0.07, frequency: 2, easing: 'easeInOut' },
                blending: 'additive',
                renderOrder: 8,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.75, arcSpeed: 0.8, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                },
                // No atmospherics — gentle flow, no violent water motion
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Lower current - wave-curls (slightly behind)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                startOffset: -0.2,          // Lower position
                endOffset: -0.2,
                easing: 'linear',
                startScale: 0.6,
                endScale: 1.0,
                startDiameter: 0.9,
                endDiameter: 1.2,
                orientation: 'camera'
            },
            formation: {
                type: 'ring',
                count: 2,
                phaseOffset: 0.25
            },
            count: 2,
            scale: 0.9,
            models: ['wave-curl'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.9,
                stagger: 0.2,
                enter: { type: 'fade', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                // Same direction, slightly slower
                drift: {
                    speed: 0.4,
                    distance: 2.0,
                    direction: { x: 1.0, y: -0.03, z: 0 },  // Slight downward drift
                    easing: 'easeInOut'
                },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 4, scale: 1.4, weight: 1.0 },
                    secondary: { pattern: 1, scale: 0.7, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.0,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.2, scale: 0.25, speed: 1.5, blend: 'multiply' },
                rotate: [
                    { axis: 'z', rotations: -0.3, phase: 45 },
                    { axis: 'z', rotations: 0.25, phase: 225 }
                ],
                pulse: { amplitude: 0.06, frequency: 2.5, easing: 'easeInOut' },
                blending: 'additive',
                renderOrder: 6,
                modelOverrides: {
                    'wave-curl': {
                        shaderAnimation: { type: 1, arcWidth: 0.7, arcSpeed: 1.2, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    // Wobble - smooth flowing motion
    wobbleFrequency: 1.5,
    wobbleAmplitude: 0.008,
    wobbleDecay: 0.3,
    // Scale - gentle breathing
    scaleWobble: 0.01,
    scaleFrequency: 2,
    scaleGrowth: 0.008,
    // Glow - cool flowing water
    glowColor: [0.3, 0.55, 0.9],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.4,
    glowPulseRate: 2
};

/**
 * Waterflow gesture - gentle river current.
 *
 * Uses two-layer axis-travel with horizontal drift:
 * - Layer 1: 3 splash-rings in upper current
 * - Layer 2: 2 wave-curls in lower current
 * - Both drift left-to-right with slight vertical offset
 * - WAVES+STREAKS cutout for flowing texture
 */
export default buildWaterEffectGesture(WATERFLOW_CONFIG);
