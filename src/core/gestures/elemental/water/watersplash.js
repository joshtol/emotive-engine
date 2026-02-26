/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watersplash Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watersplash gesture - explosive water splash with multiple elements
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watersplash
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *              💧              ← Center droplet shoots UP
 *           💧    💧           ← Side droplets arc up/out
 *         •  •  •  •  •        ← Tiny spray particles (radial)
 *        ═══════════════       ← Expanding ring (crown base)
 *            ○○○               ← Bubble foam at impact
 *
 * FEATURES:
 * - Central expanding splash-ring (RADIAL cutout)
 * - 5 large droplets shooting UP and OUT like splash crown arms
 * - 8 medium droplets in radial burst (CELLULAR cutout)
 * - 12 tiny spray particles for fine mist (DISSOLVE cutout)
 * - Bubble foam cluster at impact base
 * - TRUE SPLASH: centered burst, not trailing
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water impact effects
 * - Splash reactions
 * - Dramatic water bursts
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watersplash gesture configuration
 * Explosive splash - wave-curls bursting outward with droplet spray
 */
const WATERSPLASH_CONFIG = {
    name: 'splash',
    emoji: '💦',
    type: 'blending',
    description: 'Explosive water splash with curling waves and spray',
    duration: 1000,
    beats: 2,
    intensity: 1.3,
    category: 'impact',
    turbulence: 0.8,

    // 3D Element spawning - TRUE SPLASH: centered burst of droplets
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Central expanding ring - the splash "crown" base
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 2.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.5,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.4,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 2, scale: 1.8, weight: 1.0 }, // RADIAL - burst lines
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.0, // Slow radial expansion
                    strengthCurve: 'fadeOut',
                },
                // Grain: cinematic film grain for realistic water
                grain: {
                    type: 3, // FILM - perlin + white hybrid
                    strength: 0.5, // STRONG for testing
                    scale: 0.3, // Coarser texture
                    speed: 1.5, // Faster animation
                    blend: 'multiply', // Darkens for depth
                },
                blending: 'additive',
                renderOrder: 8,
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
                // Burst spray on impact — one-time event, not sustained
                atmospherics: [
                    {
                        preset: 'spray',
                        targets: null,
                        anchor: 'above',
                        intensity: 1.0,
                        sizeScale: 1.2,
                        burstCount: 25,
                        progressCurve: 'burst',
                    },
                ],
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: BIG droplets shooting UP and OUT - the main splash arms (5 directions)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.6,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.2,
            models: ['droplet-large'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 4, scale: 1.0, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.4,
                    distance: 0.8,
                    direction: { x: 0, y: 1.0, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'droplet-large': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.25,
                endScale: 1.3,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.0,
            models: ['droplet-large'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 0, scale: 0.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.6,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.3,
                    distance: 0.75,
                    direction: { x: -0.7, y: 0.85, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'droplet-large': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.25,
                endScale: 1.3,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.0,
            models: ['droplet-large'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 0, scale: 0.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.6,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.3,
                    distance: 0.75,
                    direction: { x: 0.7, y: 0.85, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'droplet-large': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.85,
            models: ['droplet-large'],
            animation: {
                appearAt: 0.03,
                disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.18, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 4, scale: 1.2, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.1,
                    distance: 0.6,
                    direction: { x: -0.95, y: 0.5, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                blending: 'additive',
                renderOrder: 11,
                modelOverrides: {
                    'droplet-large': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.85,
            models: ['droplet-large'],
            animation: {
                appearAt: 0.03,
                disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.18, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 4, scale: 1.2, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.1,
                    distance: 0.6,
                    direction: { x: 0.95, y: 0.5, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                blending: 'additive',
                renderOrder: 11,
                modelOverrides: {
                    'droplet-large': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: MEDIUM droplets - secondary splash (radial burst, 8 directions)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8,
                radius: 0.05,
                endRadius: 0.65,
                angleSpread: 360,
                startAngle: 22, // Offset to not align with big droplets
                orientation: 'camera',
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutQuad',
            },
            count: 8,
            scale: 0.6,
            models: ['droplet-small'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.4,
                stagger: 0.008,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                cutout: {
                    strength: 0.35,
                    primary: { pattern: 0, scale: 0.7, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                scaleVariance: 0.3,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'droplet-small': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 4: TINY spray particles - fine mist (radial burst, 12 particles)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 12,
                radius: 0.03,
                endRadius: 0.5,
                angleSpread: 360,
                startAngle: 0,
                orientation: 'camera',
                startScale: 0.1,
                endScale: 0.35,
                scaleEasing: 'easeOutQuad',
            },
            count: 12,
            scale: 0.2,
            models: ['droplet-small'],
            animation: {
                appearAt: 0.01,
                disappearAt: 0.3,
                stagger: 0.005,
                enter: { type: 'scale', duration: 0.02, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.1, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                cutout: {
                    strength: 0.25,
                    primary: { pattern: 7, scale: 0.5, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.0,
                    strengthCurve: 'fadeOut',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                scaleVariance: 0.5,
                lifetimeVariance: 0.25,
                blending: 'additive',
                renderOrder: 16,
                modelOverrides: {
                    'droplet-small': {
                        shaderAnimation: { type: 1, arcWidth: 0.98, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 5: Bubble foam at base - impact foam
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: -0.1, z: 0.12 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.7,
            models: ['bubble-cluster'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.6,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 1.2, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.5,
                    strengthCurve: 'constant',
                },
                pulse: { amplitude: 0.1, frequency: 8, easing: 'easeInOut' },
                rotate: { axis: 'z', rotations: 0, phase: 0 }, // Tidally locked
                blending: 'additive',
                renderOrder: 6,
                modelOverrides: {
                    'bubble-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 2 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
    ],

    // Wobble - punchy impact
    wobbleFrequency: 6,
    wobbleAmplitude: 0.018,
    wobbleDecay: 0.4,
    // Scale - burst expansion
    scaleWobble: 0.035,
    scaleFrequency: 7,
    scaleGrowth: 0.015,
    // Glow - bright impact
    glowColor: [0.35, 0.65, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.2,
    glowPulseRate: 6,
};

/**
 * Watersplash gesture - centered impact burst.
 *
 * TRUE SPLASH design - droplets bursting from center point:
 * - Layer 1: Expanding splash-ring crown base (RADIAL cutout)
 * - Layer 2: 5 large droplets shooting UP and OUT (crown arms)
 * - Layer 3: 8 medium droplets in radial burst (CELLULAR cutout)
 * - Layer 4: 12 tiny spray particles (DISSOLVE cutout)
 * - Layer 5: Bubble foam at impact base (CELLULAR cutout)
 * All elements burst FROM center OUTWARD - no trailing.
 */
export default buildWaterEffectGesture(WATERSPLASH_CONFIG);
