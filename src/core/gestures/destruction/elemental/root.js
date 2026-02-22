/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Root Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Natureroot gesture - flat vine rings burrowing into the ground
 * @module gestures/destruction/elemental/root
 *
 * CONCEPT: Root system burrowing — flat vine-rings descend from center into
 * the ground, narrowing as they go. Arc animation creates sweeping root
 * tendrils drilling into the earth.
 *
 * FEATURES:
 * - 5 flat vine-rings descending center → below
 * - Diameter narrows 1.8 → 1.0 (funneling into earth)
 * - Flat orientation — horizontal rings sinking like root layers
 * - easeIn — accelerating descent (roots finding purchase)
 * - Arc animation for animated root tendril sweeps
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREROOT_CONFIG = {
    name: 'natureroot',
    emoji: '🌱',
    type: 'blending',
    description: 'Root system burrowing — flat vine rings descend and narrow into the ground',
    duration: 2000,
    beats: 4,
    intensity: 1.0,
    category: 'afflicted',
    growth: 0.6,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'below',
            easing: 'easeIn',
            startScale: 1.0,
            endScale: 0.7,
            startDiameter: 1.8,
            endDiameter: 1.0,
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 5,
            spacing: 0.12,
            arcOffset: 72,
            phaseOffset: 0.03
        },
        count: 5,
        scale: 1.0,
        models: ['vine-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0.06,
            enter: {
                type: 'scale',
                duration: 0.1,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.35,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.06,
                geometryStability: true
            },
            parameterAnimation: {
                growth: {
                    start: 0.4,
                    peak: 0.75,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.04,
                frequency: 2,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.4,
                max: 0.8,
                frequency: 2,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.55,
                primary: { pattern: 8, scale: 1.2, weight: 1.0 },
                secondary: { pattern: 3, scale: 1.5, weight: 0.4 },
                blend: 'max',
                travel: 'vertical',
                travelSpeed: 1.5,
                strengthCurve: 'fadeIn'
            },
            grain: {
                type: 3,
                strength: 0.15,
                scale: 0.25,
                speed: 0.5,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: null,
                anchor: 'below',
                intensity: 0.4,
                sizeScale: 1.0,
                progressCurve: 'sustain',
                velocityInheritance: 0.3
            }],
            rotate: { axis: 'z', rotations: 0.5, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 12,
            modelOverrides: {
                'vine-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.6,
                        arcSpeed: 1.0,
                        arcCount: 1
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    glowColor: [0.35, 0.5, 0.2],
    glowIntensityMin: 0.45,
    glowIntensityMax: 0.7,
    glowFlickerRate: 2,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 3,
    decayRate: 0.2
};

export default buildNatureEffectGesture(NATUREROOT_CONFIG);
