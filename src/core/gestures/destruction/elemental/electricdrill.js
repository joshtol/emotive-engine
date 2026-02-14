/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Drill Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricdrill gesture - fast tight descending lightning helix
 * @module gestures/destruction/elemental/electricdrill
 *
 * VISUAL DIAGRAM:
 *      ⚡⚡⚡         ← Tight spiral of 6 rings
 *       ⚡⚡⚡          descending rapidly
 *        ⚡⚡⚡
 *         ★ ↓↓↓
 *
 * FEATURES:
 * - 2 lightning-rings in tight 180° spiral, descending
 * - Fast 4 rotations — aggressive drilling motion
 * - VORONOI + CRACKS cutout with fast vertical travel
 * - Intense grain for electric static
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICDRILL_CONFIG = {
    name: 'electricdrill',
    emoji: '🔩',
    type: 'blending',
    description: 'Fast tight descending lightning helix',
    duration: 1200,
    beats: 2,
    intensity: 1.5,
    category: 'electrocute',

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'feet',
            end: 'below',
            easing: 'easeIn',
            startScale: 1.0,
            endScale: 0.8,
            startDiameter: 1.8,
            endDiameter: 1.4,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 2,
            spacing: 0.1,
            arcOffset: 180,
            phaseOffset: 0
        },
        count: 2,
        scale: 2.0,
        models: ['lightning-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.03,
            enter: {
                type: 'fade',
                duration: 0.05,
                easing: 'linear'
            },
            exit: {
                type: 'fade',
                duration: 0.4,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.05,
                geometryStability: true
            },
            flicker: {
                intensity: 0.4,
                rate: 25,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.08,
                frequency: 10,
                easing: 'linear'
            },
            emissive: {
                min: 1.5,
                max: 3.5,
                frequency: 12,
                pattern: 'random'
            },
            cutout: {
                strength: 0.55,
                primary: { pattern: 3, scale: 1.5, weight: 1.0 },
                secondary: { pattern: 8, scale: 0.8, weight: 0.35 },
                blend: 'add',
                travel: 'vertical',
                travelSpeed: 3.0,
                strengthCurve: 'constant'
            },
            grain: {
                type: 3,
                strength: 0.3,
                scale: 0.2,
                speed: 4.0,
                blend: 'multiply'
            },
            // Per-gesture atmospheric particles: ionized air from drill
            atmospherics: [{
                preset: 'ozone',
                targets: null,
                anchor: 'below',
                intensity: 0.3,
                sizeScale: 0.8,
                progressCurve: 'sustain',
            }],
            rotate: { axis: 'y', rotations: 4, phase: 0 },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 16,
            modelOverrides: {
                'lightning-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,
                        arcSpeed: 3.0,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Drill generates jitter — electrocuting
    jitterFrequency: 45,
    jitterAmplitude: 0.01,
    jitterDecay: 0.25,
    glowColor: [0.3, 0.9, 1.0],
    glowIntensityMin: 1.3,
    glowIntensityMax: 2.8,
    glowFlickerRate: 15,
    scaleVibration: 0.02,
    scaleFrequency: 8,
    scaleGrowth: 0.03
};

export default buildElectricEffectGesture(ELECTRICDRILL_CONFIG);
