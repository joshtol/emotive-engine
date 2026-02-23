/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Illuminate Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightilluminate gesture - a divine lantern blooming outward
 * @module gestures/destruction/elemental/lightilluminate
 *
 * VISUAL DIAGRAM:
 *      ✦         ✦            ← Prism-shards orbiting slowly (refracting light)
 *    ════════════════          ← Sun-ring 3 (outermost ripple)
 *      ══════════              ← Sun-ring 2 (middle ripple)
 *        ══════  ★             ← Sun-ring 1 (inner ripple)
 *      ══════════
 *    ════════════════
 *      ✦         ✦
 *
 * CONCEPT: A divine lantern blooming to life. Three concentric sun-rings
 * expand outward like ripples of light — the illumination spreading from
 * the mascot in waves. Four prism-shards orbit around the center, catching
 * and refracting the expanding light like a crystal chandelier.
 *
 * UNIQUE: The concentric expanding rings create a "light ripple" effect
 * that's visually distinct from pillar (vertical) or glow (gentle orbit).
 *
 * FEATURES:
 * - 3 sun-rings expanding from center (concentric light ripples)
 * - 4 prism-shards in slow orbit (chandelier crystals catching light)
 * - Staggered ring appearance for ripple effect
 * - Clean white-gold illumination building to full brightness
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTILLUMINATE_CONFIG = {
    name: 'lightilluminate',
    emoji: '🔆',
    type: 'blending',
    description: 'Divine lantern blooming outward — concentric waves of illumination',
    duration: 2500,
    beats: 4,
    intensity: 1.0,
    category: 'emanating',
    radiance: 0.65,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: 3 sun-rings — concentric expanding light ripples
        // Each starts small at center and expands. Staggered for ripple effect.
        // Camera-facing — like a shockwave of illumination.
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 2.0,
                scaleEasing: 'easeOutCubic'
            },
            count: 1, scale: 1.6, models: ['sun-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.6,
                enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.06, frequency: 2.5, easing: 'easeInOut' },
                emissive: { min: 1.2, max: 2.2, frequency: 2.5, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.3, phase: 0 },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 2.0, weight: 1.0 },     // WAVES
                    secondary: { pattern: 6, scale: 1.5, weight: 0.4 },   // SPIRAL
                    blend: 'add',
                    travel: 'radial',
                    travelSpeed: 0.8,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                },
                grain: {
                    type: 3, strength: 0.15, scale: 0.3, speed: 0.6, blend: 'multiply'
                },
                atmospherics: [{
                    preset: 'firefly',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.35,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                }],
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.5, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // Ring 2 — middle ripple, slightly delayed
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.02 },
                orientation: 'camera',
                startScale: 0.15,
                endScale: 2.5,
                scaleEasing: 'easeOutCubic'
            },
            count: 1, scale: 1.3, models: ['sun-ring'],
            animation: {
                appearAt: 0.08,
                disappearAt: 0.65,
                enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                pulse: { amplitude: 0.06, frequency: 2.5, easing: 'easeInOut' },
                emissive: { min: 1.0, max: 2.0, frequency: 2.5, pattern: 'sine' },
                rotate: { axis: 'z', rotations: -0.25, phase: 0 },
                blending: 'additive',
                renderOrder: 13,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.4, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // Ring 3 — outermost ripple, most delayed
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.1,
                endScale: 3.0,
                scaleEasing: 'easeOutCubic'
            },
            count: 1, scale: 1.0, models: ['sun-ring'],
            animation: {
                appearAt: 0.16,
                disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                pulse: { amplitude: 0.05, frequency: 2.5, easing: 'easeInOut' },
                emissive: { min: 0.8, max: 1.8, frequency: 2.5, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.2, phase: 0 },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.75, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: 4 prism-shards — orbiting chandelier crystals
        // Slow orbit, they catch and refract the expanding light
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 'center',
                endHeight: 'center',
                radius: 0.8,
                endRadius: 1.2,                 // Drifting outward with the light
                speed: 1,                       // 1 full orbit
                easing: 'linear',
                startScale: 0.6,
                endScale: 1.0,
                orientation: 'camera'
            },
            formation: { type: 'ring', count: 4 },
            count: 4, scale: 0.9, models: ['prism-shard'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.65,
                stagger: 0.03,
                enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 2.2, frequency: 3, pattern: 'sine' },
                rotate: [
                    { axis: 'y', rotations: 1.5, phase: 0 },
                    { axis: 'x', rotations: -1.5, phase: 90 },
                    { axis: 'z', rotations: 1.5, phase: 180 },
                    { axis: 'y', rotations: -1.5, phase: 270 }
                ],
                scaleVariance: 0.2,
                blending: 'additive',
                renderOrder: 16,
            }
        }
    ],

    decayRate: 0.2,
    glowColor: [1.0, 0.95, 0.75],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.3,
    glowFlickerRate: 3,
    scaleVibration: 0.012,
    scaleFrequency: 2.5,
    scalePulse: true
};

export default buildLightEffectGesture(LIGHTILLUMINATE_CONFIG);
