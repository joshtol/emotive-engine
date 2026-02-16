/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidhelix gesture - double helix of void rings spiraling upward
 * @module gestures/destruction/elemental/voidhelix
 *
 * VISUAL DIAGRAM:
 *        ●   ○        TOP
 *       ○     ●
 *        ●   ○        ← Two interleaved
 *       ○     ●          spirals rising
 *        ●   ○
 *       ○     ●       BOTTOM
 *
 * FEATURES:
 * - 6 void elements in double helix formation (strands: 2)
 * - DNA-style interleaved spiral ascending
 * - Vertical orientation for standing rings
 * - Graceful twisting void effect
 * - WAVES + SPIRAL cutout for flowing darkness
 * - Shadow wisps with centrifugal motion
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDHELIX_CONFIG = {
    name: 'voidhelix',
    emoji: '🧬',
    type: 'blending',
    description: 'Double helix of void rings spiraling around mascot',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    depth: 0.6,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeInOut',
            startScale: 0.9,
            endScale: 1.1,
            startDiameter: 1.8,
            endDiameter: 2.0,
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 6,
            strands: 2,
            spacing: 0.2,
            arcOffset: 120,
            phaseOffset: 0.05
        },
        count: 6,
        scale: 1.3,
        models: ['void-wrap'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.06,
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            pulse: {
                amplitude: 0.06,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.2,
                max: 0.6,
                frequency: 6,
                pattern: 'smooth'
            },
            cutout: {
                strength: 0.45,
                primary: { pattern: 4, scale: 2.0, weight: 1.0 },    // WAVES
                secondary: { pattern: 6, scale: 1.8, weight: 0.6 },  // SPIRAL
                blend: 'max',
                travel: 'angular',
                travelSpeed: 3.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.1,
                    tip: 0.25
                },
                trailDissolve: {
                    enabled: true,
                    offset: -0.6,
                    softness: 1.8
                }
            },
            atmospherics: [{
                preset: 'darkness',
                targets: null,
                anchor: 'around',
                intensity: 0.5,
                sizeScale: 1.3,
                progressCurve: 'sustain',
                velocityInheritance: 0.5,
                centrifugal: { speed: 0.8, tangentialBias: 0.4 },
            }],
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 3,
            modelOverrides: {
                'void-wrap': {
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC
                        arcWidth: 0.5,
                        arcSpeed: 2.0,      // Graceful spiral
                        arcCount: 2
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    glowColor: [0.25, 0.1, 0.35],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.8,
    glowFlickerRate: 3,
    dimStrength: 0.25,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.01
};

export default buildVoidEffectGesture(VOIDHELIX_CONFIG);
