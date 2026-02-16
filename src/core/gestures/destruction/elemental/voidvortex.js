/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidvortex gesture - dark tornado spiraling around mascot
 * @module gestures/destruction/elemental/voidvortex
 *
 * VISUAL DIAGRAM:
 *        ╱│╲           TOP (wider)
 *       │ │ │
 *      │  ★  │         ← Horizontal void rings
 *       │ │ │            spinning in dark funnel
 *        ╲│╱           ← 3 rings at 120° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 3 void-wrap models in spiral formation (120° apart)
 * - Horizontal orientation — dark tornado funnel
 * - Narrower at bottom, wider at top (inverse gravity)
 * - SPIRAL + VORONOI cutout for swirling void
 * - Non-uniform scaling for flattened ring silhouette
 * - Shadow wisps with centrifugal motion
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDVORTEX_CONFIG = {
    name: 'voidvortex',
    emoji: '🌀',
    type: 'blending',
    description: 'Dark void tornado spiraling around mascot',
    duration: 1500,
    beats: 5,
    intensity: 1.3,
    category: 'manifestation',
    depth: 0.7,
    distortionStrength: 0.003,

    // Matches ice/water vortex pattern: arc animation only, no cutout/grain
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.2,
            endScale: 1.5,
            startDiameter: 0.6,
            endDiameter: 2.0,
            orientation: 'flat'     // void-wrap XY plane → 'flat' rotates to horizontal
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.5,
        models: ['void-wrap'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.12, frequency: 6, easing: 'easeInOut' },
            emissive: {
                min: 0.3,
                max: 0.8,
                frequency: 5,
                pattern: 'sine'
            },
            // No cutout — arc animation provides the visual motion
            // No grain — binary discard doesn't work with grain
            atmospherics: [{
                preset: 'darkness',
                targets: null,
                anchor: 'around',
                intensity: 0.6,
                sizeScale: 1.5,
                progressCurve: 'sustain',
                velocityInheritance: 0.5,
                centrifugal: { speed: 0.8, tangentialBias: 0.4 },
            }],
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 3,
            modelOverrides: {
                'void-wrap': {
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC
                        arcWidth: 0.5,      // ~50% of ring visible
                        arcSpeed: 5.0,      // 5 rotations — spinning tornado
                        arcCount: 1
                    },
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.1 },
                            y: { expand: false, rate: 0.3 },
                            z: { expand: true, rate: 1.1 }
                        }
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    glowColor: [0.2, 0.08, 0.3],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.0,
    glowFlickerRate: 4,
    dimStrength: 0.35,
    scaleVibration: 0.015,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.015
};

export default buildVoidEffectGesture(VOIDVORTEX_CONFIG);
