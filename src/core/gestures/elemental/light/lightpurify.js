/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Purify Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightpurify gesture - healing convergence with purification burst
 * @module gestures/destruction/elemental/lightpurify
 *
 * VISUAL DIAGRAM:
 *      ✧↘         ✦↙
 *         ╭─✧─╮              ← Fragments converging INWARD
 *         │ ★  │                gathering healing power
 *         ╰─✦─╯
 *      ✧↗      ═══ ✦↖        ← Sun-ring appears at convergence peak
 *                              ← Sparkle-stars burst outward (purification!)
 *
 * CONCEPT: Healing energy gathers inward from a wide radius. As 5
 * prism-shard/sparkle-star fragments converge on the mascot, a sun-ring
 * materializes at the center — the healing seal. At peak convergence,
 * 3 sparkle-stars burst outward — the purification releasing.
 *
 * THREE PHASES:
 * 1. GATHER: orbit fragments spiral inward (healing power collecting)
 * 2. SEAL: sun-ring appears at center (healing seal forms)
 * 3. RELEASE: sparkle-stars burst outward (purification complete)
 *
 * FEATURES:
 * - 5 prism/sparkle fragments converging in orbit
 * - Sun-ring at center appearing at convergence peak
 * - 3 sparkle-stars bursting outward at the end
 * - Cutout + grain on sun-ring for divine texture
 * - Rising emissive: healing crescendo
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTPURIFY_CONFIG = {
    name: 'lightpurify',
    emoji: '✨',
    type: 'blending',
    description: 'Healing light converges inward, seals, and releases — purifying curse and malady',
    duration: 3000,
    beats: 5,
    intensity: 1.1,
    mascotGlow: 0.5,
    category: 'afflicted',
    radiance: 0.7,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: 5 converging fragments — healing power gathering
        // Orbit from wide radius, converging tight. Growing brighter.
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 'center',
                endHeight: 'center',
                radius: 2.2, // Start wide
                endRadius: 0.3, // Converge tight
                speed: 2, // 2 full orbits during convergence
                easing: 'easeOut', // Fast approach, lingering arrival
                startScale: 0.5,
                endScale: 1.3, // Grow as they converge
                orientation: 'camera',
            },
            formation: { type: 'ring', count: 5 },
            count: 5,
            scale: 1.2,
            models: ['prism-shard', 'sparkle-star', 'prism-shard', 'sparkle-star', 'prism-shard'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.6,
                stagger: 0.04,
                enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'shrink', duration: 0.12, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                emissive: { min: 0.8, max: 2.5, frequency: 3, pattern: 'sine' },
                pulse: { amplitude: 0.1, frequency: 3, easing: 'easeInOut' },
                atmospherics: [
                    {
                        preset: 'firefly',
                        targets: null,
                        anchor: 'around',
                        intensity: 0.4,
                        sizeScale: 0.8,
                        progressCurve: 'rampUp',
                        velocityInheritance: 0.5,
                    },
                ],
                rotate: [
                    { axis: 'y', rotations: 1.5, phase: 0 },
                    { axis: 'x', rotations: -2, phase: 72 },
                    { axis: 'z', rotations: 1.5, phase: 144 },
                    { axis: 'y', rotations: -2, phase: 216 },
                    { axis: 'x', rotations: 1.5, phase: 288 },
                ],
                scaleVariance: 0.2,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 16,
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: Sun-ring — the healing seal forming at center
        // Appears partway through as fragments converge. Camera-facing.
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.1,
                endScale: 1.5,
                scaleEasing: 'easeOutBack',
            },
            count: 1,
            scale: 1.3,
            models: ['sun-ring'],
            animation: {
                appearAt: 0.25, // Appears as fragments converge
                disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.12, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.12, frequency: 3, easing: 'easeInOut' },
                emissive: { min: 1.0, max: 2.5, frequency: 3, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.5, phase: 0 },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 6, scale: 1.5, weight: 1.0 }, // SPIRAL — healing vortex
                    secondary: { pattern: 4, scale: 2.0, weight: 0.5 }, // WAVES
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 0.8,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                    bellWidth: 1.0,
                    geometricMask: { type: 'distance', core: 0.1, tip: 0.3 },
                },
                grain: {
                    type: 3,
                    strength: 0.2,
                    scale: 0.4,
                    speed: 0.5,
                    blend: 'multiply',
                },
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0.8, arcCount: 2 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 3 sparkle-stars — purification release burst
        // Burst outward after the healing seal forms
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 3,
                radius: 0.1,
                endRadius: 1.2,
                angleSpread: 360,
                startAngle: 40,
                orientation: 'camera',
                startScale: 0.4,
                endScale: 0.8,
                scaleEasing: 'easeOutQuad',
            },
            count: 3,
            scale: 0.8,
            models: ['sparkle-star'],
            animation: {
                appearAt: 0.4, // After seal forms — the purification release
                disappearAt: 0.7,
                stagger: 0.02,
                enter: { type: 'scale', duration: 0.06, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                emissive: { min: 1.3, max: 2.5, frequency: 5, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 1.0, phase: 0 },
                    { axis: 'z', rotations: -1.5, phase: 120 },
                    { axis: 'z', rotations: 1.0, phase: 240 },
                ],
                scaleVariance: 0.25,
                blending: 'additive',
                renderOrder: 18,
            },
        },
    ],

    decayRate: 0.18,
    glowColor: [1.0, 0.92, 0.65], // Golden healing warmth
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.3,
    glowFlickerRate: 4,
    scaleVibration: 0.015,
    scaleFrequency: 3,
    scalePulse: true,
};

export default buildLightEffectGesture(LIGHTPURIFY_CONFIG);
