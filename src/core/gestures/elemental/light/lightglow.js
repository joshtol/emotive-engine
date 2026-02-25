/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Glow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightglow gesture - gentle inner warmth, barely-there radiance
 * @module gestures/destruction/elemental/lightglow
 *
 * VISUAL DIAGRAM:
 *          ·  ✧  ·
 *        ✧   ★   ✧       ← Tiny sparkles hover in slow orbit
 *          ·  ✧  ·           gentle breathing pulse
 *           /|\              warm amber inner light
 *
 * CONCEPT: The gentlest light gesture. Like a candle's warmth —
 * barely perceptible sparkles drift around the mascot in a lazy orbit.
 * The glow comes from within, not from the elements themselves.
 *
 * FEATURES:
 * - 3 sparkle-stars in gentle orbit around center
 * - Very slow revolution (0.5 rotations over gesture)
 * - Soft breathing pulse synced with emissive
 * - Warm amber glow, low intensity
 * - Firefly motes drifting upward
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTGLOW_CONFIG = {
    name: 'lightglow',
    emoji: '💡',
    type: 'blending',
    description: 'Gentle inner warmth, barely-there radiance from within',
    duration: 3500,
    beats: 5,
    intensity: 0.6,
    mascotGlow: 0.5,
    category: 'emanating',
    radiance: 0.4,

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center',
            endHeight: 'center',
            radius: 0.8,
            endRadius: 0.9,
            speed: 0.5,                     // Very slow — lazy drift
            easing: 'linear',
            startScale: 0.8,
            endScale: 1.0,
            orientation: 'camera'
        },
        formation: { type: 'ring', count: 3 },
        count: 3,
        scale: 0.7,
        models: ['sparkle-star', 'sparkle-star', 'sparkle-star'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.08,
            enter: { type: 'fade', duration: 0.2, easing: 'easeInOut' },
            exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.15, geometryStability: true },
            pulse: { amplitude: 0.1, frequency: 1.5, easing: 'easeInOut', sync: 'global' },
            emissive: { min: 0.6, max: 1.2, frequency: 1.5, pattern: 'sine' },
            atmospherics: [{
                preset: 'firefly',
                targets: null,
                anchor: 'around',
                intensity: 0.2,
                sizeScale: 0.4,
                progressCurve: 'sustain',
            }],
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 10,
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.90, 0.70],      // Warm amber
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.9,
    glowFlickerRate: 2,
    scaleVibration: 0.008,
    scaleFrequency: 1.5,
    scalePulse: true,
    floatAmount: 0.003,
    floatSpeed: 1
};

export default buildLightEffectGesture(LIGHTGLOW_CONFIG);
