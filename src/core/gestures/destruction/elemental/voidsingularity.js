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
 * - Single void-orb anchored at center — THE singularity
 * - Gravitational lensing shader warps background inward
 * - Photon ring at event horizon boundary
 * - Ominous slow pulse, strong dimming
 * - Shadow atmospherics swirling around the orb
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

    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'center',
            offset: { x: 0, y: 0, z: 0 },
            orientation: 'flat',
        },
        count: 1,
        scale: 3.0,
        models: ['void-orb'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.8,
            stagger: 0,
            enter: { type: 'scale', duration: 0.3, easing: 'easeOut' },
            exit: { type: 'scale', duration: 0.2, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.08, frequency: 1.0, easing: 'easeInOut' },
            // No cutout — binary discard doesn't work with cutout patterns
            // No grain — same reason
            atmospherics: [{
                preset: 'darkness',
                targets: ['void-orb'],
                anchor: 'around',
                intensity: 1.2,
                sizeScale: 3.0,
                progressCurve: 'sustain',
            }, {
                preset: 'shadow',
                targets: null,
                anchor: 'around',
                intensity: 0.4,
                sizeScale: 1.5,
                progressCurve: 'rampUp',
            }],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 3,
        }
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
    rotationDrift: 0.003
};

export default buildVoidEffectGesture(VOIDSINGULARITY_CONFIG);
