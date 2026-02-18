/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightvortex gesture - spiraling tornado of divine light rings
 * @module gestures/destruction/elemental/lightvortex
 *
 * VISUAL DIAGRAM:
 *        ╱│╲           TOP (wider)
 *       │ │ │
 *      │  ★  │         ← Horizontal sun-rings
 *       │ │ │            spinning around
 *        ╲│╱           ← 3 rings at 120° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 3 sun-rings in spiral formation (120° apart)
 * - Rings travel from bottom to top of mascot
 * - Horizontal orientation — divine tornado funnel
 * - Funnel shape: narrower at bottom, wider at top
 * - Arc visibility: portion of ring visible, sweeps around
 * - Matches fire vortex behavior with light aesthetics
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTVORTEX_CONFIG = {
    name: 'lightvortex',
    emoji: '🌀',
    type: 'blending',
    description: 'Spiraling tornado of divine light rings around mascot',
    duration: 1500,
    beats: 5,
    intensity: 1.4,
    category: 'manifestation',
    radiance: 0.75,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.4,
            endScale: 1.7,
            startDiameter: 0.6,
            endDiameter: 1.2,
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.0,
        models: ['sun-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            flicker: { intensity: 0.4, rate: 18, pattern: 'random' },
            pulse: { amplitude: 0.12, frequency: 6, easing: 'easeInOut' },
            emissive: { min: 1.0, max: 2.5, frequency: 8, pattern: 'sine' },
            cutout: {
                strength: 0.7,
                primary: { pattern: 6, scale: 2.5, weight: 1.0 },    // SPIRAL — vortex swirl
                secondary: { pattern: 4, scale: 1.8, weight: 0.5 },  // WAVES — flowing energy
                blend: 'add',
                travel: 'spiral',
                travelSpeed: 4.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.1,
                    tip: 0.25
                }
            },
            grain: {
                type: 2,              // WHITE — intense vortex texture
                strength: 0.12,
                scale: 0.15,
                speed: 2.5,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'firefly',
                targets: null,
                anchor: 'above',
                intensity: 0.3,
                sizeScale: 0.8,
                progressCurve: 'sustain',
            }],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 15,
            intensityScaling: {
                scale: 1.4,
                emissiveMax: 1.6,
                pulseAmplitude: 1.3
            },
            modelOverrides: {
                'sun-ring': {
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC
                        arcWidth: 0.5,      // ~29% visible at a time
                        arcSpeed: 6.0,      // 6 rotations over gesture duration
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

    decayRate: 0.2,
    glowColor: [1.0, 0.95, 0.70],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.2,
    glowFlickerRate: 8,
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scalePulse: true
};

export default buildLightEffectGesture(LIGHTVORTEX_CONFIG);
