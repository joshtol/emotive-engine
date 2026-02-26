/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Singularity Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidsingularity gesture - a single void orb consuming all light
 * @module gestures/destruction/elemental/voidsingularity
 *
 * VISUAL DIAGRAM:
 *
 *           ╭─────╮
 *          (  ◉◉◉  )      ← Void orb — gravitational lensing
 *           ╰─────╯          warps background inward
 *             ★              ← Mascot consumed
 *            /|\
 *
 * FEATURES:
 * - Single billboarded void-disk at center — THE singularity
 * - Mathematically perfect circle (billboard plane, not 3D sphere)
 * - Gravitational lensing shader warps background inward
 * - Photon ring at event horizon boundary
 * - Ominous slow pulse, strong dimming
 * - Shadow atmospherics swirling around the disk
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDSINGULARITY_CONFIG = {
    name: 'voidsingularity',
    emoji: '⚫',
    type: 'blending',
    description: 'Collapsing void orb — a singularity consuming all light',
    duration: 3000,
    beats: 4,
    intensity: 1.5,
    category: 'annihilation',
    depth: 0.8,
    distortionStrength: 0, // ZERO — disk must be perfectly round, distortion warps its pixels

    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'center',
            offset: { x: 0, y: 0, z: 0 },
            cameraOffset: 2.5, // Push toward camera by 2.5× mascotRadius — prevents clipping into mascot
            orientation: 'camera', // Billboard — always faces camera for perfect circle
            wander: {
                radius: 0.12, // Subtle drift — black hole meanders
                speedX: 0.25, // Slow, incommensurate frequencies
                speedZ: 0.18, // for natural Lissajous path
            },
        },
        count: 1,
        scale: 1.2,
        models: ['void-disk'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.88,
            stagger: 0,
            enter: { type: 'scale', duration: 0.3, easing: 'easeOut' },
            exit: { type: 'shrink', duration: 0.06, easing: 'easeInCubic' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.08, frequency: 1.0, easing: 'easeInOut' },
            // No cutout — binary discard doesn't work with cutout patterns
            // No grain — same reason
            atmospherics: [
                {
                    preset: 'shadow',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.25,
                    sizeScale: 1.2,
                    progressCurve: 'rampUp',
                },
                {
                    preset: 'darkness',
                    targets: ['void-disk'],
                    anchor: 'around',
                    intensity: 0.7,
                    sizeScale: 0.6,
                    speedScale: 0.1,
                    lifetimeScale: 0.4,
                    progressCurve: 'sustain',
                    gravity: {
                        strength: 1.8, // Strong pull — singularity consumes
                        spawnRadius: 0.4, // Spawn in ring around disk
                    },
                },
            ],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 3,
            modelOverrides: {
                'void-disk': {
                    diskMode: true,
                },
            },
        },
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.15,
    glowColor: [0.15, 0.05, 0.25],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.0,
    glowFlickerRate: 1.5,
    dimStrength: 0.45,
    scaleVibration: 0.01,
    scaleFrequency: 1,
    scalePulse: true,
    rotationDrift: 0.003,
};

export default buildVoidEffectGesture(VOIDSINGULARITY_CONFIG);
