/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electrichelix gesture - DNA-style double helix of lightning rings
 * @module gestures/destruction/elemental/electrichelix
 *
 * VISUAL DIAGRAM:
 *      ⚡    ⚡
 *        ╲╱         ← Double helix of 6 lightning rings
 *        ╱╲           2 strands intertwining upward
 *      ⚡  ★ ⚡
 *        ╲╱
 *        ╱╲
 *      ⚡    ⚡
 *
 * FEATURES:
 * - 6 lightning-rings in double helix (strands=2)
 * - DNA-like intertwining pattern ascending
 * - CRACKS + VORONOI cutout for fracture energy
 * - Angular travel for rotating patterns
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICHELIX_CONFIG = {
    name: 'electrichelix',
    emoji: '🧬',
    type: 'blending',
    description: 'Double helix of lightning rings ascending',
    duration: 2000,
    beats: 3,
    intensity: 1.2,
    category: 'powered',

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 0.9,
            endScale: 1.2,
            startDiameter: 1.3,
            endDiameter: 1.6,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 6,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0,
            strands: 2
        },
        count: 6,
        scale: 1.4,
        models: ['lightning-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.88,
            stagger: 0.03,
            enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.06, geometryStability: true },
            pulse: { amplitude: 0.08, frequency: 4, easing: 'easeInOut' },
            emissive: { min: 0.9, max: 2.0, frequency: 5, pattern: 'sine' },
            cutout: {
                strength: 0.45,
                primary: { pattern: 8, scale: 1.0, weight: 0.65 },
                secondary: { pattern: 3, scale: 0.8, weight: 0.35 },
                blend: 'max',
                travel: 'angular',
                travelSpeed: 1.5,
                strengthCurve: 'bell'
            },
            grain: { type: 3, strength: 0.15, scale: 0.35, speed: 1.5, blend: 'multiply' },
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.08,
            blending: 'additive',
            renderOrder: 12
        }
    },

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 5,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.015
};

export default buildElectricEffectGesture(ELECTRICHELIX_CONFIG);
