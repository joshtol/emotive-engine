/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Blast Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightblast gesture - divine DETONATION with heavy screen distortion
 * @module gestures/destruction/elemental/lightblast
 *
 * VISUAL DIAGRAM:
 *  ✦↗ ✧↗ ✦↗ ✧↗ ✦↗ ✧↗ ✦↗ ✧↗   ← 8 prism shards exploding outward
 *      ╔═══════════════╗          ← Light-burst DETONATION (massive)
 *      ║  ═══════════  ║          ← Ring shockwave 1
 *      ║    ═══════    ║          ← Ring shockwave 2
 *      ╚═══════════════╝
 *  ✧↙ ✦↙ ✧↙ ✦↙ ✧↙ ✦↙ ✧↙ ✦↙   ← 4 sparkle-star debris
 *
 * CONCEPT: A divine detonation that WARPS THE SCREEN HARD. The light-burst
 * detonates, TWO expanding shockwaves ripple, 8 prism-shard arms fly in all
 * directions, sparkle debris fills the air. Distortion at 2.5 — reality bends.
 * Short, brutal, overwhelming.
 *
 * FEATURES:
 * - Light-burst detonation: 0.15 → 3.5 scale in 30ms
 * - 2 light-ring shockwaves with heavy stagger
 * - 8 prism-shard arms in radial-burst (shrapnel)
 * - 4 sparkle-star debris for extra violence
 * - distortionStrength: 2.5 — heavy screen warping
 * - 900ms duration — fast and brutal
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTBLAST_CONFIG = {
    name: 'lightblast',
    emoji: '💥',
    type: 'blending',
    description: 'Divine detonation with heavy screen-warping distortion — light bends reality',
    duration: 900,
    beats: 2,
    intensity: 1.8,
    category: 'manifestation',
    radiance: 1.0,
    distortionStrength: 2.5,            // Heavy screen distortion

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Light-burst DETONATION — the core explosion
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.15,
                endScale: 3.5,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 2.5, models: ['light-burst'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.35,
                enter: { type: 'flash', duration: 0.02, easing: 'linear' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                pulse: { amplitude: 0.15, frequency: 12, easing: 'easeOut' },
                emissive: { min: 2.5, max: 4.5, frequency: 10, pattern: 'sine' },
                atmospherics: [{
                    preset: 'firefly',
                    targets: null,
                    anchor: 'around',
                    intensity: 1.0,
                    sizeScale: 2.5,
                    progressCurve: 'pulse',
                }],
                blending: 'additive',
                renderOrder: 18,
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: Light-ring shockwave 1 — fast expanding ripple
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 4.0,
                scaleEasing: 'easeOutCubic'
            },
            count: 1, scale: 2.0, models: ['light-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.3,
                enter: { type: 'flash', duration: 0.02, easing: 'linear' },
                exit: { type: 'fade', duration: 0.1, easing: 'easeIn' },
                emissive: { min: 1.8, max: 3.5, frequency: 10, pattern: 'sine' },
                blending: 'additive',
                renderOrder: 16,
                modelOverrides: {
                    'light-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // Shockwave 2 — second ripple, slightly delayed
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.15,
                endScale: 3.5,
                scaleEasing: 'easeOutCubic'
            },
            count: 1, scale: 1.6, models: ['light-ring'],
            animation: {
                appearAt: 0.06,
                disappearAt: 0.35,
                enter: { type: 'flash', duration: 0.02, easing: 'linear' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                emissive: { min: 1.5, max: 3.0, frequency: 8, pattern: 'sine' },
                blending: 'additive',
                renderOrder: 15,
                modelOverrides: {
                    'light-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 8 prism-shard shrapnel — massive radial burst
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8,
                radius: 0.1,
                endRadius: 2.0,
                angleSpread: 360,
                startAngle: 22,
                orientation: 'camera',
                startScale: 0.2,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad'
            },
            count: 8, scale: 1.0, models: ['prism-shard'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.4,
                stagger: 0.005,
                enter: { type: 'scale', duration: 0.02, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.12, easing: 'easeIn', burstScale: 1.3 },
                emissive: { min: 1.5, max: 3.0, frequency: 10, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 2.0, phase: 0 },
                    { axis: 'z', rotations: -2.5, phase: 45 },
                    { axis: 'z', rotations: 3.0, phase: 90 },
                    { axis: 'z', rotations: -2.0, phase: 135 },
                    { axis: 'z', rotations: 2.5, phase: 180 },
                    { axis: 'z', rotations: -3.0, phase: 225 },
                    { axis: 'z', rotations: 2.0, phase: 270 },
                    { axis: 'z', rotations: -2.5, phase: 315 }
                ],
                scaleVariance: 0.3,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 19,
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 4: 4 sparkle-star debris — extra violence
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 4,
                radius: 0.2,
                endRadius: 1.5,
                angleSpread: 360,
                startAngle: 67,
                orientation: 'camera',
                startScale: 0.3,
                endScale: 0.6,
                scaleEasing: 'easeOutQuad'
            },
            count: 4, scale: 0.7, models: ['sparkle-star'],
            animation: {
                appearAt: 0.03,
                disappearAt: 0.45,
                stagger: 0.008,
                enter: { type: 'flash', duration: 0.02, easing: 'linear' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                emissive: { min: 1.3, max: 2.8, frequency: 8, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 1.5, phase: 0 },
                    { axis: 'z', rotations: -2.0, phase: 90 },
                    { axis: 'z', rotations: 1.5, phase: 180 },
                    { axis: 'z', rotations: -1.5, phase: 270 }
                ],
                scaleVariance: 0.25,
                blending: 'additive',
                renderOrder: 20,
            }
        }
    ],

    decayRate: 0.1,
    endFlash: true,
    glowColor: [1.0, 0.95, 0.60],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 12,
    scaleVibration: 0.05,
    scaleFrequency: 10,
    scalePulse: true,
    recoilAmount: 0.02,
    recoilSpeed: 4
};

export default buildLightEffectGesture(LIGHTBLAST_CONFIG);
