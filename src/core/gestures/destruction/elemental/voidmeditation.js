/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Meditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidmeditation gesture - dark mandala with breathing pulse
 * @module gestures/destruction/elemental/voidmeditation
 *
 * VISUAL DIAGRAM:
 *         ◎   ◎
 *       ◎       ◎          ← 5 void-rings in mandala pattern
 *         ◎ ★ ◎              1 center + 4 outer
 *       ◎       ◎            camera-facing, breathing
 *         ◎   ◎
 *
 * CONCEPT: Following the firemeditation pattern with void aesthetics.
 * A dark mandala of void-rings — the anti-meditation. Where fire
 * meditation is warm and nurturing, void meditation is still and
 * consuming. Slow breathing pulse, alternating rotation, dark energy.
 *
 * FEATURES:
 * - 5 void-rings in mandala formation (1 center + 4 outer)
 * - Camera-facing orientation
 * - Synchronized breathing pulse
 * - Alternating rotation directions
 * - Dark atmospheric wisps
 * - Long 4000ms duration
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDMEDITATION_CONFIG = {
    name: 'voidmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Dark meditative mandala — void energy breathing in stillness',
    duration: 4000,
    beats: 4,
    intensity: 0.7,
    category: 'absorption',
    voidStrength: 0.5,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'easeInOut',
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.8,
            endDiameter: 1.8,
            orientation: 'camera'
        },
        formation: {
            type: 'mandala',
            count: 5,
            radius: 0.5,
            arcOffset: 45,
            scales: [1.0, 0.6, 0.6, 0.6, 0.6]
        },
        count: 5,
        scale: 1.2,
        models: ['void-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.8,
            stagger: 0,
            enter: { type: 'fade', duration: 0.5, easing: 'easeInOut' },
            exit: { type: 'fade', duration: 0.4, easing: 'easeInOut' },
            procedural: { scaleSmoothing: 0.15, geometryStability: true },
            pulse: { amplitude: 0.12, frequency: 1.2, easing: 'easeInOut' },
            emissive: { min: 0.7, max: 1.3, frequency: 1.2, pattern: 'sine' },
            cutout: {
                strength: 0.6,
                primary: { pattern: 4, scale: 2.0, weight: 1.0 },
                secondary: { pattern: 6, scale: 1.5, weight: 0.5 },
                blend: 'add',
                travel: 'angular',
                travelSpeed: 0.4,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 1.0,
                geometricMask: { type: 'distance', core: 0.1, tip: 0.3 }
            },
            grain: {
                type: 3,
                strength: 0.4,
                scale: 0.5,
                speed: 0.3,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'smoke',
                targets: null,
                anchor: 'above',
                intensity: 0.25,
                sizeScale: 0.8,
                speedScale: 0.4,
                progressCurve: 'sustain',
            }],
            rotate: [
                { axis: 'z', rotations: 0.3, phase: 0 },
                { axis: 'z', rotations: -0.25, phase: 0 },
                { axis: 'z', rotations: 0.2, phase: 0 },
                { axis: 'z', rotations: -0.25, phase: 0 },
                { axis: 'z', rotations: 0.3, phase: 0 }
            ],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'additive',
            depthWrite: false,
            renderOrder: -5,
            modelOverrides: {
                'void-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.85,
                        arcSpeed: 0.3,
                        arcCount: 2
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [0.3, 0.1, 0.5],        // Dark purple void
    glowIntensityMin: 0.4,
    glowIntensityMax: 0.8,
    glowFlickerRate: 2,
    scaleVibration: 0.004,
    scaleFrequency: 1.2,
    scaleGrowth: 0,
    rotationEffect: false
};

export default buildVoidEffectGesture(VOIDMEDITATION_CONFIG);
