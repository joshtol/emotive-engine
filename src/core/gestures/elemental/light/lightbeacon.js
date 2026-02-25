/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Beacon Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightbeacon gesture - brilliant signal beacon
 * @module gestures/destruction/elemental/lightbeacon
 *
 * VISUAL DIAGRAM:
 *
 *      ✧  ✧     ✧  ✧
 *    ✧   ╭─────────╮   ✧     ← Sparkle-stars in lazy orbit
 *        │ ◇  ▓▒░  │         ← Prism spikes + narrow arc sweep
 *    ✧   │ ◇  ★  ◇│   ✧       (beacon beam rotates through)
 *        │    ▓▒░◇ │
 *    ✧   ╰─────────╯   ✧     ← Soft base glow ring underneath
 *      ✧  ✧     ✧  ✧
 *
 * CONCEPT: A brilliant signal beacon. Layered construction:
 * 1. Soft wide-arc base glow (sun-ring, slow rotation)
 * 2. Narrow-arc searchlight beam (sun-ring, fast sweep)
 * 3. Prism-shard spikes radiating from center
 * 4. Orbiting sparkle-stars like moths drawn to the light
 *
 * UNIQUE: Four-layer beacon with narrow arc as PRIMARY visual mechanic.
 * The dark ring with a bright wedge sweeping through it, surrounded by
 * prismatic spikes and orbiting sparkles catching the beam as it passes.
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTBEACON_CONFIG = {
    name: 'lightbeacon',
    emoji: '🔦',
    type: 'blending',
    description: 'Brilliant signal beacon — layered rings, prism spikes, and orbiting sparkles',
    duration: 3000,
    beats: 4,
    intensity: 1.1,
    mascotGlow: 0.6,
    category: 'emanating',
    radiance: 0.8,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Soft base glow — wide arc sun-ring, slow gentle rotation
        // Background luminance that gives the beacon its "always lit" feel.
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                bob: { amplitude: 0.015, frequency: 0.25 }
            },
            count: 1, scale: 1.8, models: ['sun-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'fade', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                pulse: { amplitude: 0.05, frequency: 1.5, easing: 'easeInOut' },
                emissive: { min: 0.8, max: 1.5, frequency: 2, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.2, phase: 0 },
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: Beacon sweep — NARROW arc searchlight beam
        // The defining visual: only 35% of ring lit, sweeping continuously.
        // High emissive values make the beam cut through the base glow.
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                bob: { amplitude: 0.012, frequency: 0.3 }
            },
            count: 1, scale: 1.5, models: ['sun-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.80,
                enter: { type: 'fade', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                pulse: { amplitude: 0.08, frequency: 2, easing: 'easeInOut' },
                emissive: { min: 1.5, max: 3.0, frequency: 3, pattern: 'sine' },
                rotate: { axis: 'z', rotations: -0.5, phase: 0 },
                cutout: {
                    strength: 0.3,
                    primary: { pattern: 5, scale: 0.8, weight: 0.6 },    // EMBERS — sparkling texture in beam
                    secondary: { pattern: 0, scale: 1.2, weight: 0.3 },  // CELLULAR — organic breakup
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.0,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.1, scale: 0.25, speed: 0.5, blend: 'multiply' },
                atmospherics: [{
                    preset: 'firefly',
                    targets: ['sun-ring'],
                    anchor: 'around',
                    intensity: 0.6,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                }],
                blending: 'additive',
                renderOrder: 16,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.35, arcSpeed: 1.5, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 3 prism-shards — radiant spikes around the beacon core
        // Static anchor, pulsing in and out, catching the beam sweep.
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
            },
            formation: { type: 'ring', count: 3 },
            count: 3, scale: 0.6, models: ['prism-shard'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.75,
                stagger: 0.04,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                pulse: { amplitude: 0.15, frequency: 3, easing: 'easeInOut', perElement: true, phaseOffset: 120 },
                emissive: { min: 1.0, max: 2.5, frequency: 4, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 2, phase: 0 },
                    { axis: 'z', rotations: -2, phase: 120 },
                    { axis: 'z', rotations: 2, phase: 240 }
                ],
                scaleVariance: 0.2,
                blending: 'additive',
                renderOrder: 15,
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 4: 6 sparkle-stars — moths orbiting the lantern
        // Lazy orbit, small scale, catching the beam as it passes.
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 'center',
                endHeight: 'center',
                radius: 1.0,
                endRadius: 1.3,
                speed: 0.5,
                easing: 'linear',
                startScale: 0.8,
                endScale: 1.0,
                orientation: 'camera'
            },
            formation: { type: 'ring', count: 6 },
            count: 6, scale: 0.45, models: ['sparkle-star'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.75,
                stagger: 0.04,
                enter: { type: 'fade', duration: 0.12, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                pulse: { amplitude: 0.25, frequency: 5, easing: 'easeInOut', perElement: true, phaseOffset: 60 },
                emissive: { min: 0.8, max: 2.5, frequency: 6, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 1.5, phase: 0 },
                    { axis: 'z', rotations: -1.5, phase: 60 },
                    { axis: 'z', rotations: 1.5, phase: 120 },
                    { axis: 'z', rotations: -1.5, phase: 180 },
                    { axis: 'z', rotations: 1.5, phase: 240 },
                    { axis: 'z', rotations: -1.5, phase: 300 }
                ],
                scaleVariance: 0.3,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 14,
            }
        }
    ],

    decayRate: 0.2,
    glowColor: [1.0, 0.95, 0.75],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowFlickerRate: 4,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    scalePulse: true,
    hover: true,
    hoverAmount: 0.006
};

export default buildLightEffectGesture(LIGHTBEACON_CONFIG);
