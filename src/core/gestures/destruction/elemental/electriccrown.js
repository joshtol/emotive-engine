/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Crown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electriccrown gesture - crackling lightning ring crown above head
 * @module gestures/destruction/elemental/electriccrown
 *
 * VISUAL DIAGRAM:
 *         ╭───────╮
 *        ( ⚡⚡⚡⚡⚡ )    ← Lightning ring spinning above head
 *         ╰───────╯
 *            ★           ← Mascot
 *           /|\
 *
 * FEATURES:
 * - Single lightning-ring anchored at head, horizontal
 * - Slow rotation with crackling Voronoi lightning shader
 * - Gentle bob for floating effect
 * - Additive blending — ring glows with electric energy
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICCROWN_CONFIG = {
    name: 'electriccrown',
    emoji: '👑',
    type: 'blending',
    description: 'Crackling lightning crown above the head',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'powered',

    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'top',
            offset: { x: 0, y: 0.05, z: 0 },
            orientation: 'flat',
            bob: {
                amplitude: 0.02,
                frequency: 0.3
            }
        },
        count: 1,
        scale: 2.2,
        models: ['lightning-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0,
            enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.02, frequency: 2, easing: 'easeInOut' },
            rotate: { axis: 'z', rotations: 1, phase: 0 },
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: 15
        }
    },

    // No jitter — controlled powered energy
    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    // Glow - constant cyan
    glowColor: [0.3, 0.9, 1.0],
    glowIntensityMin: 0.8,
    glowIntensityMax: 0.8,
    glowFlickerRate: 0,
    scaleVibration: 0.003,
    scaleFrequency: 3,
    scaleGrowth: 0.005,
    scalePulse: true,
    rotationDrift: 0.01
};

export default buildElectricEffectGesture(ELECTRICCROWN_CONFIG);
