/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Aura Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric aura gesture - rings rising slowly from center
 * @module gestures/destruction/elemental/electricaura
 *
 * CONCEPT: Plasma-rings and arc-ring-smalls (underused models) rise slowly
 * from center, creating a majestic sustained energy field.
 * Axis-travel center → above with slow easeOut for gradual ascent.
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICAURA_CONFIG = {
    name: 'electricAuraEffect',
    emoji: '💫',
    type: 'blending',
    description: 'Electric rings rising slowly from center',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'powered',

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'below',
            end: 'center',
            easing: 'easeOut',
            startScale: 0.9,
            endScale: 1.3,
            startDiameter: 1.6,
            endDiameter: 2.2,
            orientation: 'camera'
        },
        formation: {
            type: 'spiral',
            count: 3,
            strands: 1,
            spacing: 0.15,
            arcOffset: 120,
            phaseOffset: 0.05
        },
        count: 3,
        scale: 2.0,
        models: ['plasma-ring', 'arc-ring-small', 'plasma-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.06,
            enter: { type: 'fade', duration: 0.12, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            flicker: { intensity: 0.15, rate: 8, pattern: 'sine' },
            emissive: { min: 0.9, max: 1.8, frequency: 2.5, pattern: 'sine' },
            cutout: {
                strength: 0.4,
                primary: { pattern: 0, scale: 1.0, weight: 0.6 },
                secondary: { pattern: 1, scale: 0.8, weight: 0.4 },
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 0.6,
                strengthCurve: 'constant'
            },
            grain: { type: 3, strength: 0.08, scale: 0.4, speed: 1.0, blend: 'multiply' },
            atmospherics: [{ preset: 'ozone', intensity: 0.2, sizeScale: 0.6, progressCurve: 'sustain' }],
            rotate: { axis: 'y', rotations: 0.5, phase: 0 },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 10,
            modelOverrides: {
                'plasma-ring': {
                    scaleMultiplier: 1.1,
                    shaderAnimation: { type: 1, arcWidth: 0.7, arcSpeed: 0.5, arcCount: 1 },
                    orientationOverride: 'camera'
                },
                'arc-ring-small': {
                    scaleMultiplier: 0.9,
                    shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 0.8, arcCount: 2 },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.3,
    glowColor: [0.5, 0.85, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.0,
    glowFlickerRate: 4,
    scaleVibration: 0.015,
    scaleFrequency: 1.5,
    scalePulse: true,
    rotationDrift: 0.02,
    hover: true,
    hoverAmount: 0.01
};

export default buildElectricEffectGesture(ELECTRICAURA_CONFIG);
