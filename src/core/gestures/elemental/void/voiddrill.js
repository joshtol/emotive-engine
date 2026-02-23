/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Drill Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voiddrill gesture - fast tight spiraling void rings drilling downward
 * @module gestures/destruction/elemental/voiddrill
 *
 * VISUAL DIAGRAM:
 *            ★           ← Mascot
 *           ●
 *          ●             ← Fast tight spiral
 *         ●                drilling downward
 *        ●
 *       ●                BOTTOM
 *
 * FEATURES:
 * - 6 void elements in tight spiral formation
 * - Fast descending helix (like a drill bit)
 * - High rotation speed (4 full rotations) for drilling effect
 * - Vertical orientation for standing rings
 * - STREAKS + VORONOI cutout for angular void cracks
 * - Shadow wisps trailing below
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDDRILL_CONFIG = {
    name: 'voiddrill',
    emoji: '⏬',
    type: 'blending',
    description: 'Fast tight void helix drilling downward',
    duration: 1200,
    beats: 2,
    intensity: 1.5,
    category: 'manifestation',
    depth: 0.75,
    distortionStrength: 0,

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
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 6,
            spacing: 0.1,
            arcOffset: 60,
            phaseOffset: 0
        },
        count: 6,
        scale: 0.8,
        models: ['void-wrap'],
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
            pulse: {
                amplitude: 0.08,
                frequency: 10,
                easing: 'linear'
            },
            emissive: {
                min: 0.4,
                max: 1.0,
                frequency: 12,
                pattern: 'random'
            },
            // No cutout — binary discard doesn't work with cutout patterns
            // No grain — rotation provides visual motion
            atmospherics: [{
                preset: 'darkness',
                targets: null,
                anchor: 'below',
                intensity: 0.5,
                sizeScale: 1.3,
                speedScale: 0.5,
                progressCurve: 'rampUp',
                velocityInheritance: 0.5,
                centrifugal: { speed: 1.0, tangentialBias: 0.3 },
            }],
            rotate: { axis: 'y', rotations: 4, phase: 0 },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 3,
            modelOverrides: {
                'void-wrap': {
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC
                        arcWidth: 0.4,      // Narrow — aggressive drill
                        arcSpeed: 4.0,      // Fast — drilling speed
                        arcCount: 1
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.15,
    glowColor: [0.15, 0.05, 0.25],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.2,
    glowFlickerRate: 6,
    dimStrength: 0.4,
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scalePulse: true,
    rotationDrift: 0.02
};

export default buildVoidEffectGesture(VOIDDRILL_CONFIG);
