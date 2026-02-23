/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Dance Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightdance gesture - spinning rings of light ascending like coins
 * @module gestures/destruction/elemental/lightdance
 *
 * VISUAL DIAGRAM:
 *        ◎           TOP — wide, luminous
 *       ◎  ◎
 *        ◎           ← 3 light-rings spinning like coins (120° offset)
 *         ★             ascending with gentle wobble
 *        /|\
 *
 * FEATURES:
 * - 3 light-rings in axis-travel (bottom → top)
 * - 120° DANCING COINS rotation (like voiddance)
 * - Golden additive glow stacks as rings overlap
 * - Widening diameter as they rise (funnel)
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTDANCE_CONFIG = {
    name: 'lightdance',
    emoji: '💃',
    type: 'blending',
    description: 'Rings of light ascending and spinning like golden coins',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'manifestation',
    radiance: 0.65,

    // 3D Element spawning - vertical dancing rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.4,
            endScale: 1.8,
            startDiameter: 1.3,
            endDiameter: 2.0,
            orientation: 'vertical'      // Standing rings for coin-spin dance
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,              // DANCING COINS — 120° between rings
            phaseOffset: 0
        },
        count: 3,
        scale: 1.0,
        models: ['sun-ring'],
        animation: {
            appearAt: 0.02,
            disappearAt: 0.5,
            stagger: 0.02,
            enter: { type: 'fade', duration: 0.08, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.5, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.1, frequency: 5, easing: 'easeInOut' },
            emissive: { min: 1.0, max: 2.2, frequency: 6, pattern: 'sine' },
            cutout: {
                strength: 0.55,
                primary: { pattern: 5, scale: 1.0, weight: 0.8 },   // EMBERS — scattered sparks
                secondary: { pattern: 6, scale: 1.5, weight: 0.5 }, // SPIRAL — swirling arms
                blend: 'add',
                travel: 'spiral',
                travelSpeed: 2.5,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
            },
            grain: {
                type: 3, strength: 0.08, scale: 0.15, speed: 1.0, blend: 'multiply'
            },
            atmospherics: [{
                preset: 'firefly',
                targets: null,
                anchor: 'above',
                intensity: 0.25,
                sizeScale: 0.7,
                progressCurve: 'sustain',
                velocityInheritance: 0.4,
                centrifugal: { speed: 0.5, tangentialBias: 0.5 },
            }],
            // Dance partners: two mirror each other, one does a flourish
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },     // Lead: 2 rotations
                { axis: 'y', rotations: -2, phase: 60 },    // Partner: counter-rotation!
                { axis: 'y', rotations: 3, phase: 120 }     // Flourish: faster accent
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'sun-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.6,
                        arcSpeed: 1.5,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.90, 0.55],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 6,
    scaleVibration: 0.018,
    scaleFrequency: 4,
    scaleGrowth: 0.025,
    rotationDrift: 0.01
};

export default buildLightEffectGesture(LIGHTDANCE_CONFIG);
