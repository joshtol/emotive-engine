/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Crown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightcrown gesture - radiant golden halo floating above head
 * @module gestures/destruction/elemental/lightcrown
 *
 * VISUAL DIAGRAM:
 *         ╭───────╮
 *        ( ✦✦✦✦✦ )    ← Golden halo hovering, emanating rays
 *         ╰───────╯
 *            ★           ← Mascot
 *           /|\
 *
 * FEATURES:
 * - Single light-ring anchored at head, horizontal
 * - Slow majestic rotation with radiant glow
 * - Gentle bob for floating divine effect
 * - Additive blending — ring brightens surroundings
 * - Golden light motes rising from the crown
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTCROWN_CONFIG = {
    name: 'lightcrown',
    emoji: '👑',
    type: 'blending',
    description: 'Radiant golden halo floating above the head, emanating divine light',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'manifestation',
    radiance: 0.7,

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
        scale: 1.0,
        models: ['light-crown'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0,
            enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.06, frequency: 2, easing: 'easeInOut' },
            emissive: { min: 1.2, max: 2.0, frequency: 1.5, pattern: 'sine' },
            rotate: { axis: 'z', rotations: 0.5, phase: 0 },
            // Golden firefly motes drifting up from the crown
            atmospherics: [{
                preset: 'firefly',
                targets: ['light-crown'],
                anchor: 'above',
                intensity: 0.4,
                sizeScale: 0.6,
                progressCurve: 'sustain',
            }],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'light-crown': {
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC
                        arcWidth: 0.7,
                        arcSpeed: 0.6,
                        arcCount: 3
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.92, 0.65],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.4,
    glowFlickerRate: 2,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    scalePulse: true,
    rotationDrift: 0.01
};

export default buildLightEffectGesture(LIGHTCROWN_CONFIG);
