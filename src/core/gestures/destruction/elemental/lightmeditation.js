/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Meditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightmeditation gesture - mandala of light with breathing pulse
 * @module gestures/destruction/elemental/lightmeditation
 *
 * VISUAL DIAGRAM:
 *         ◎   ◎
 *       ◎       ◎          ← 5 sun-rings in mandala pattern
 *         ◎ ★ ◎              1 center + 4 outer
 *       ◎       ◎            camera-facing, breathing
 *         ◎   ◎
 *
 * CONCEPT: Following the firemeditation pattern. A mandala of
 * sun-rings arranged in a circular pattern around the mascot.
 * Slow breathing pulse, alternating rotation directions, calm
 * meditative golden energy. Long duration for sustained meditation.
 *
 * FEATURES:
 * - 5 sun-rings in mandala formation (1 center + 4 outer)
 * - Camera-facing orientation — always face viewer
 * - Synchronized breathing pulse (scale + emissive)
 * - Alternating rotation directions for mandala harmony
 * - Gentle golden firefly motes
 * - Long 4000ms duration — sustained meditation feel
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTMEDITATION_CONFIG = {
    name: 'lightmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Meditative mandala of light with synchronized breathing pulse',
    duration: 4000,
    beats: 4,
    intensity: 0.7,
    category: 'emanating',
    radiance: 0.5,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',                  // No travel — fixed in place
            easing: 'easeInOut',
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.8,
            endDiameter: 1.8,
            orientation: 'camera'           // Billboard: always face camera
        },
        formation: {
            type: 'mandala',
            count: 5,                       // 1 center + 4 outer rings
            radius: 0.5,
            arcOffset: 45,
            scales: [1.0, 0.6, 0.6, 0.6, 0.6]
        },
        count: 5,
        scale: 1.2,
        models: ['sun-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.8,
            stagger: 0,                     // All appear together
            enter: { type: 'fade', duration: 0.5, easing: 'easeInOut' },
            exit: { type: 'fade', duration: 0.4, easing: 'easeInOut' },
            procedural: { scaleSmoothing: 0.15, geometryStability: true },
            // Breathing pulse — the key meditation feature
            pulse: { amplitude: 0.15, frequency: 1.5, easing: 'easeInOut' },
            emissive: { min: 0.8, max: 1.6, frequency: 1.5, pattern: 'sine' },
            // Cutout: flowing meditation energy
            cutout: {
                strength: 0.6,
                primary: { pattern: 4, scale: 2.0, weight: 1.0 },      // WAVES — flowing energy
                secondary: { pattern: 6, scale: 1.5, weight: 0.5 },    // SPIRAL — meditation swirl
                blend: 'add',
                travel: 'angular',
                travelSpeed: 0.6,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 1.0,
                geometricMask: { type: 'distance', core: 0.1, tip: 0.3 }
            },
            grain: {
                type: 3,                    // FILM
                strength: 0.3,
                scale: 0.5,
                speed: 0.5,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'firefly',
                targets: null,
                anchor: 'above',
                intensity: 0.25,
                sizeScale: 0.6,
                speedScale: 0.5,
                progressCurve: 'sustain',
            }],
            // Alternating rotation for mandala harmony
            rotate: [
                { axis: 'z', rotations: 0.4, phase: 0 },
                { axis: 'z', rotations: -0.35, phase: 0 },
                { axis: 'z', rotations: 0.25, phase: 0 },
                { axis: 'z', rotations: -0.35, phase: 0 },
                { axis: 'z', rotations: 0.4, phase: 0 }
            ],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'additive',
            renderOrder: -5,                // Behind mascot
            modelOverrides: {
                'sun-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.9,
                        arcSpeed: 0.5,
                        arcCount: 2
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.92, 0.65],      // Soft meditation gold
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.0,
    glowFlickerRate: 2,
    scaleVibration: 0.004,
    scaleFrequency: 1.5,
    scaleGrowth: 0,
    rotationEffect: false
};

export default buildLightEffectGesture(LIGHTMEDITATION_CONFIG);
