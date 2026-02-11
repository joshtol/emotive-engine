/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Surge Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricsurge gesture - expanding electromagnetic shockwave
 * @module gestures/destruction/elemental/electricsurge
 *
 * VISUAL DIAGRAM:
 *      ╭─────────╮
 *     ╭───────────╮        ← Lightning ring expands outward
 *    ╭─────────────╮         like an EMP shockwave
 *         ★
 *
 * FEATURES:
 * - Single plasma-ring expanding outward from mascot
 * - Camera-facing orientation — EMP pulse wave
 * - RADIAL + CRACKS cutout for discharge pattern
 * - Radial travel for expanding wave effect
 * - EMANATING: mascot is radiating electric energy
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICSURGE_CONFIG = {
    name: 'electricsurge',
    emoji: '📡',
    type: 'blending',
    description: 'Expanding electromagnetic shockwave',
    duration: 2000,
    beats: 3,
    intensity: 0.9,
    category: 'powered',

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'linear',
            startScale: 0.4,
            endScale: 2.5,
            startDiameter: 0.5,
            endDiameter: 3.0,
            orientation: 'camera'
        },
        formation: { type: 'stack', count: 1, spacing: 0 },
        count: 1,
        scale: 1.3,
        models: ['plasma-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.85,
            enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            cutout: {
                strength: 0.5,
                primary: { pattern: 2, scale: 1.5, weight: 0.6 },
                secondary: { pattern: 8, scale: 1.0, weight: 0.4 },
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 1.0,
                strengthCurve: 'fadeOut',
                trailDissolve: {
                    enabled: true,
                    offset: -0.3,
                    softness: 1.5
                }
            },
            grain: { type: 3, strength: 0.15, scale: 0.35, speed: 2.0, blend: 'multiply' },
            pulse: { amplitude: 0.08, frequency: 3, easing: 'easeInOut' },
            emissive: { min: 0.8, max: 2.0, frequency: 4, pattern: 'sine' },
            blending: 'additive',
            renderOrder: 8,
            modelOverrides: {
                'plasma-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0.3, arcCount: 1 },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.3,
    glowColor: [0.4, 0.85, 1.0],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowFlickerRate: 4,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    scalePulse: true,
    rotationDrift: 0.01
};

export default buildElectricEffectGesture(ELECTRICSURGE_CONFIG);
