/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Cleanse Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightcleanse gesture - purifying wave sweeping upward, turn undead
 * @module gestures/destruction/elemental/lightcleanse
 *
 * VISUAL DIAGRAM:
 *        ═══════            ← Ring 4 (arriving last, top)
 *        ═══════            ← Ring 3
 *        ═══════            ← Ring 2
 *          ★               ← Mascot being cleansed
 *        ═══════            ← Ring 1 (first, sweeping upward)
 *
 * CONCEPT: A purifying wave of divine light sweeps upward through
 * the mascot, chasing away malady and turning undead. Flat sun-rings
 * travel from below feet to above head in a steady, cleansing sweep.
 * Like a holy scanner washing evil away.
 *
 * FEATURES:
 * - 4 sun-rings sweeping from below to above (purifying wave)
 * - Flat horizontal orientation — washing through the body
 * - Steady linear easing — methodical cleansing
 * - Moderate golden-white glow
 * - Firefly particles rising in the wake
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTCLEANSE_CONFIG = {
    name: 'lightcleanse',
    emoji: '🌟',
    type: 'blending',
    description: 'Purifying wave of divine light sweeping upward — chase malady, turn undead',
    duration: 2500,
    beats: 4,
    intensity: 0.9,
    mascotGlow: 0.6,
    category: 'afflicted',
    radiance: 0.6,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'below',
            end: 'above',
            easing: 'linear',              // Steady, methodical sweep
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.6,
            endDiameter: 1.6,              // Uniform width — flat scanner
            orientation: 'flat'
        },
        formation: {
            type: 'stack',
            count: 4,
            spacing: 0.08,
            phaseOffset: 0.03
        },
        count: 4,
        scale: 1.0,
        models: ['sun-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.08,                 // Sequential upward sweep
            enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.06, frequency: 2, easing: 'easeInOut', sync: 'global' },
            emissive: { min: 1.0, max: 2.0, frequency: 2.5, pattern: 'sine' },
            rotate: { axis: 'z', rotations: 0.3, phase: 0 },
            atmospherics: [{
                preset: 'firefly',
                targets: null,
                anchor: 'above',
                intensity: 0.35,
                sizeScale: 0.8,
                progressCurve: 'rampUp',    // More particles as cleanse builds
                velocityInheritance: 0.3,
            }],
            scaleVariance: 0.05,
            lifetimeVariance: 0.05,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'sun-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.5, arcCount: 2 },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.95, 0.80],      // Warm cleansing white
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.1,
    glowFlickerRate: 3,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    scalePulse: true,
    riseAmount: 0.006,
    riseSpeed: 0.5
};

export default buildLightEffectGesture(LIGHTCLEANSE_CONFIG);
