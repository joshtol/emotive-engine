/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Pillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricpillar gesture - rising pillar of stacked lightning rings
 * @module gestures/destruction/elemental/electricpillar
 *
 * VISUAL DIAGRAM:
 *     ═══⚡═══        ← Layer 3: top (VORONOI + DISSOLVE)
 *     ═══⚡═══        ← Layer 2: middle (CRACKS + STREAKS)
 *     ═══★═══        ← Layer 1: base (STREAKS + RADIAL)
 *
 * FEATURES:
 * - 3 spawn layers, 2 rings each = 6 total lightning-rings
 * - Each layer has unique cutout pattern combination
 * - SHARED_ANIMATION for consistent timing
 * - Rising pillar formation with staggered appearance
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const SHARED_ANIMATION = {
    enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
    exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
    procedural: { scaleSmoothing: 0.08, geometryStability: true },
    pulse: { amplitude: 0.08, frequency: 4, easing: 'easeInOut' },
    emissive: { min: 1.0, max: 2.0, frequency: 5, pattern: 'sine' },
    grain: { type: 3, strength: 0.25, scale: 0.3, speed: 2.0, blend: 'multiply' },
    rotate: { axis: 'z', rotations: 1, phase: 0 },
    scaleVariance: 0.1,
    lifetimeVariance: 0.08,
    blending: 'additive',
    renderOrder: 12,
    modelOverrides: {
        'lightning-ring': {
            shaderAnimation: { type: 1, arcWidth: 0.65, arcSpeed: 3.0, arcCount: 1 },
            orientationOverride: 'flat'
        },
        'plasma-ring': {
            shaderAnimation: { type: 1, arcWidth: 0.55, arcSpeed: 4.0, arcCount: 2 },
            orientationOverride: 'flat'
        }
    }
};

const ELECTRICPILLAR_CONFIG = {
    name: 'electricpillar',
    emoji: '🗼',
    type: 'blending',
    description: 'Rising pillar of stacked lightning rings',
    duration: 3000,
    beats: 4,
    intensity: 1.3,
    mascotGlow: 0.4,
    category: 'powered',

    spawnMode: [
        // Layer 1: Base — STREAKS + RADIAL (grounded energy)
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y', start: 'bottom', end: 'center',
                easing: 'easeOut',
                startScale: 1.0, endScale: 1.3,
                startDiameter: 1.5, endDiameter: 1.8,
                orientation: 'flat'
            },
            formation: { type: 'stack', count: 2, spacing: 0.3 },
            count: 2, scale: 1.5, models: ['lightning-ring'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.0, disappearAt: 0.85, stagger: 0.04,
                // Per-gesture atmospheric particles: ionized air from pillar
                atmospherics: [{
                    preset: 'ozone',
                    targets: ['lightning-ring'],
                    anchor: 'above',
                    intensity: 0.1,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.5,
                }],
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 0.65 },
                    secondary: { pattern: 2, scale: 0.8, weight: 0.35 },
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'bell'
                }
            }
        },
        // Layer 2: Middle — CRACKS + STREAKS (branching discharge)
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y', start: 'center', end: 'above',
                easing: 'easeOut',
                startScale: 0.9, endScale: 1.2,
                startDiameter: 1.3, endDiameter: 1.6,
                orientation: 'flat'
            },
            formation: { type: 'stack', count: 2, spacing: 0.3 },
            count: 2, scale: 1.4, models: ['plasma-ring'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.08, disappearAt: 0.88, stagger: 0.04,
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 8, scale: 1.2, weight: 0.7 },
                    secondary: { pattern: 1, scale: 0.7, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.8,
                    strengthCurve: 'bell'
                }
            }
        },
        // Layer 3: Top — VORONOI + DISSOLVE (dissipating discharge)
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y', start: 'above', end: 'far-above',
                easing: 'easeOut',
                startScale: 0.8, endScale: 1.1,
                startDiameter: 1.1, endDiameter: 1.4,
                orientation: 'flat'
            },
            formation: { type: 'stack', count: 2, spacing: 0.3 },
            count: 2, scale: 1.3, models: ['lightning-ring'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.15, disappearAt: 0.9, stagger: 0.04,
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 3, scale: 1.0, weight: 0.6 },
                    secondary: { pattern: 7, scale: 0.8, weight: 0.4 },
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeOut'
                }
            }
        }
    ],

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 5,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.015
};

export default buildElectricEffectGesture(ELECTRICPILLAR_CONFIG);
