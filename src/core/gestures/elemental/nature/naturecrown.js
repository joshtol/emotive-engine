/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Naturecrown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturecrown gesture - living vine crown hovering above the head
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/naturecrown
 *
 * VISUAL DIAGRAM:
 *         ╭───────╮
 *        ( ~vine~  )    ← Nature ring spinning above head
 *         ╰───────╯
 *            ★           ← Mascot
 *           /|\
 *
 * FEATURES:
 * - Single vine-ring anchored at head
 * - Slow organic rotation (0.5 rotations per gesture)
 * - Gentle bob animation for floating effect
 * - Living vine material with growth parameter
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Royal/nature mastery effects
 * - Living crown indicators
 * - Blessed druid states
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Naturecrown gesture configuration
 * Living vine crown hovering above the head
 */
const NATURECROWN_CONFIG = {
    name: 'naturecrown',
    emoji: '👑',
    type: 'blending',
    description: 'Living vine crown hovering above the head',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    mascotGlow: 0.3,
    category: 'emanating',
    growth: 0.8,

    // 3D Element spawning - nature-crown model anchored at head (matches earthcrown)
    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'top',
            offset: { x: 0, y: 0.05, z: 0 },
            orientation: 'flat',
            bob: {
                amplitude: 0.008,
                frequency: 0.2,
            },
        },
        count: 1,
        scale: 2.2,
        models: ['nature-crown'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0,
            enter: { type: 'scale', duration: 0.2, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.03, frequency: 1.5, easing: 'easeInOut' },
            emissive: { min: 0.6, max: 1.0, frequency: 1, pattern: 'sine' },
            rotate: { axis: 'z', rotations: 0.3, phase: 0 },
            atmospherics: [
                {
                    preset: 'falling-leaves',
                    targets: ['nature-crown'],
                    anchor: 'around',
                    intensity: 0.15,
                    sizeScale: 0.6,
                    progressCurve: 'sustain',
                },
            ],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 10,
            modelOverrides: {
                'nature-crown': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.8,
                        arcSpeed: 0.4,
                        arcCount: 2,
                    },
                    orientationOverride: 'flat',
                },
            },
        },
    },

    // Glow - warm green, constant
    glowColor: [0.3, 0.8, 0.25],
    glowIntensityMin: 0.7,
    glowIntensityMax: 0.85,
    glowFlickerRate: 2,
    // Subtle scale dynamics
    scaleVibration: 0.005,
    scaleFrequency: 2,
    scaleGrow: 0.005,
    // No tremor - calm crown
    tremor: 0,
    tremorFrequency: 0,
    tremorDecay: 0,
    decayRate: 0.2,
};

/**
 * Naturecrown gesture - living vine crown.
 *
 * Uses anchor spawn mode at head landmark:
 * - Single vine-ring model hovering above head
 * - Horizontal orientation (flat crown)
 * - Slow Z-axis rotation for organic spinning
 * - Gentle bob for floating effect
 */
export default buildNatureEffectGesture(NATURECROWN_CONFIG);
