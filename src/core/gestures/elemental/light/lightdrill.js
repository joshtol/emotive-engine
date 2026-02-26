/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Drill Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightdrill gesture - fast tight descending light helix
 * @module gestures/destruction/elemental/lightdrill
 *
 * VISUAL DIAGRAM:
 *       ●              TOP (wide)
 *        ●
 *         ●           ← Fast tight spiral
 *          ●            drilling downward
 *           ●
 *            ●        BOTTOM (narrow)
 *
 * FEATURES:
 * - 6 sun-ring elements in tight spiral formation
 * - Fast descending helix (like a drill bit)
 * - High rotation speed (4 full revolutions)
 * - Narrowing cone, accelerating downward
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTDRILL_CONFIG = {
    name: 'lightdrill',
    emoji: '🔩',
    type: 'blending',
    description: 'Light rings drilling downward in a tight spiral',
    duration: 1200,
    beats: 2,
    intensity: 1.5,
    category: 'manifestation',
    radiance: 0.75,

    // 3D Element spawning - tight spiral helix
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'feet',
            end: 'below',
            easing: 'easeIn', // Accelerating downward
            startScale: 1.0,
            endScale: 0.8,
            startDiameter: 1.8, // Wide at top
            endDiameter: 1.4, // Narrower at drill point
            orientation: 'vertical',
        },
        formation: {
            type: 'spiral',
            count: 6,
            spacing: 0.1, // Tight spacing
            arcOffset: 60, // 60° between each (6 * 60 = 360)
            phaseOffset: 0,
        },
        count: 6,
        scale: 0.8,
        models: ['sun-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.03, // Fast sequential spawn
            enter: { type: 'fade', duration: 0.05, easing: 'linear' },
            exit: { type: 'fade', duration: 0.4, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.05, geometryStability: true },
            pulse: { amplitude: 0.08, frequency: 10, easing: 'linear' },
            emissive: { min: 1.5, max: 3.5, frequency: 12, pattern: 'random' },
            cutout: {
                strength: 0.6,
                primary: { pattern: 8, scale: 2.5, weight: 1.0 }, // CRACKS — fracture lines
                secondary: { pattern: 3, scale: 3.0, weight: 0.7 }, // VORONOI — shattered cells
                blend: 'multiply',
                travel: 'oscillate',
                travelSpeed: 5.0,
                // Trail dissolve: leading edge dissolves as drill advances
                trailDissolve: {
                    offset: 0.1,
                    softness: 0.25,
                },
            },
            grain: {
                type: 2, // WHITE — sharp granular
                strength: 0.1,
                scale: 0.1,
                speed: 3.0,
                blend: 'multiply',
            },
            atmospherics: [
                {
                    preset: 'firefly',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.3,
                    sizeScale: 0.7,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.5,
                    centrifugal: { speed: 1.0, tangentialBias: 0.3 },
                },
            ],
            // Fast unified rotation for drill effect
            rotate: { axis: 'y', rotations: 4, phase: 0 },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'sun-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5, // Narrow arcs for drill bits
                        arcSpeed: 3.0, // Fast internal animation
                        arcCount: 1,
                    },
                    orientationOverride: 'vertical',
                },
            },
        },
    },

    decayRate: 0.15,
    glowColor: [1.0, 0.9, 0.5],
    glowIntensityMin: 1.3,
    glowIntensityMax: 2.8,
    glowFlickerRate: 10,
    scaleVibration: 0.02,
    scaleFrequency: 8,
    scaleGrowth: 0.03,
    scalePulse: true,
};

export default buildLightEffectGesture(LIGHTDRILL_CONFIG);
