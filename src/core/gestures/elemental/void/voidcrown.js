/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Crown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidcrown gesture - dark void ring hovering above head
 * @module gestures/destruction/elemental/voidcrown
 *
 * VISUAL DIAGRAM:
 *         ╭───────╮
 *        ( ◉◉◉◉◉ )    ← Void ring hovering, absorbing light
 *         ╰───────╯
 *            ★           ← Mascot
 *           /|\
 *
 * FEATURES:
 * - Single void-crown anchored at head, horizontal
 * - Slow ominous rotation with FBM void shader
 * - Gentle bob for floating effect
 * - Light-absorbing CustomBlending — ring darkens surroundings
 * - Shadow wisps rising from the crown
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDCROWN_CONFIG = {
    name: 'voidcrown',
    emoji: '👑',
    type: 'blending',
    description: 'Dark void ring hovering above the head, absorbing light',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    mascotGlow: 0.2,
    category: 'manifestation',
    depth: 0.6,
    distortionStrength: 0,

    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'top',
            offset: { x: 0, y: 0.05, z: 0 },
            orientation: 'flat', // void-crown is XY plane — 90° X makes it horizontal
            bob: {
                amplitude: 0.02,
                frequency: 0.25, // Slower than electric — ominous float
            },
        },
        count: 1,
        scale: 0.85,
        models: ['void-crown'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0,
            enter: { type: 'scale', duration: 0.2, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.02, frequency: 1.5, easing: 'easeInOut' },
            rotate: { axis: 'z', rotations: 0.5, phase: 0 }, // Slow rotation
            atmospherics: [
                {
                    preset: 'darkness',
                    targets: ['void-crown'],
                    anchor: 'above',
                    intensity: 0.5,
                    sizeScale: 1.2,
                    progressCurve: 'sustain',
                },
            ],
            cutout: {
                strength: 0.35,
                primary: { pattern: 6, scale: 0.8, weight: 0.7 }, // SPIRAL
                secondary: { pattern: 3, scale: 1.0, weight: 0.3 }, // VORONOI
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 0.8,
                strengthCurve: 'bell',
                trailDissolve: {
                    enabled: true,
                    offset: -0.4,
                    softness: 1.2,
                },
            },
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 3,
            modelOverrides: {
                'void-crown': {
                    shaderAnimation: {
                        type: 1, // ROTATING_ARC
                        arcWidth: 0.6, // Wide arcs — regal, stately
                        arcSpeed: 0.5, // Slow rotation — ominous float
                        arcCount: 2,
                    },
                    orientationOverride: 'flat',
                },
            },
        },
    },

    // No jitter — controlled manifestation
    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    // Glow — deep purple dim
    glowColor: [0.25, 0.1, 0.35],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.7,
    glowFlickerRate: 1.5,
    dimStrength: 0.25,
    scaleVibration: 0.005,
    scaleFrequency: 2,
    scalePulse: true,
    rotationDrift: 0.008,
};

export default buildVoidEffectGesture(VOIDCROWN_CONFIG);
