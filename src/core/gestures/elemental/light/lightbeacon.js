/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Beacon Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightbeacon gesture - spinning lighthouse beacon
 * @module gestures/destruction/elemental/lightbeacon
 *
 * VISUAL DIAGRAM:
 *          ✧ ✧ ✧           ← Sparkle motes drifting from beacon
 *           ✦               ← Sparkle-star beacon (small, focused)
 *         ═══════           ← Sun-ring base (beacon lens), flat
 *       ╱   ★   ╲          ← 2 light-ray beams sweeping from top
 *      ╱   /|\   ╲
 *
 * CONCEPT: A lighthouse beacon. A focused sparkle-star hovers above
 * the mascot with ARC VISIBILITY — the sweeping beam effect. A flat
 * sun-ring acts as the lens/housing below it. Two light-ray beams
 * extend from the top and rotate around the scene like lighthouse sweeps.
 *
 * KEY INSIGHT: Use sparkle-star (small focused point) NOT light-burst
 * (massive starburst that overwhelms the scene). The beacon should be
 * a tight, bright point — not an explosion of light.
 *
 * FEATURES:
 * - Sparkle-star beacon with arc sweep (arcWidth 0.5, arcSpeed 2.5)
 * - Sun-ring base/lens at head level (flat, slowly spinning)
 * - 2 light-ray beams spinning from beacon (the sweep beams)
 * - Sparkle-star motes drifting from beacon
 * - Moderate emissive — guiding light, not supernova
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTBEACON_CONFIG = {
    name: 'lightbeacon',
    emoji: '🔦',
    type: 'blending',
    description: 'Spinning lighthouse beacon with sweeping beam of divine light',
    duration: 3000,
    beats: 4,
    intensity: 0.9,
    category: 'emanating',
    radiance: 0.6,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Sparkle-star — the beacon light with SWEEPING ARC
        // Small, focused point of light — not a massive burst
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.15, z: 0 },
                orientation: 'camera',
                bob: { amplitude: 0.015, frequency: 0.5 }
            },
            count: 1, scale: 0.7, models: ['sparkle-star'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.75,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                // Beacon pulse — rhythmic brightening
                pulse: { amplitude: 0.15, frequency: 2.5, easing: 'easeInOut' },
                emissive: { min: 1.0, max: 2.0, frequency: 2.5, pattern: 'sine' },
                // Spins on its own axis
                rotate: { axis: 'z', rotations: 2, phase: 0 },
                atmospherics: [{
                    preset: 'firefly',
                    targets: ['sparkle-star'],
                    anchor: 'above',
                    intensity: 0.4,
                    sizeScale: 0.6,
                    progressCurve: 'sustain',
                }],
                blending: 'additive',
                renderOrder: 18,
                modelOverrides: {
                    'sparkle-star': {
                        // ARC SWEEP: focused beam, 2.5 sweeps, single beam
                        shaderAnimation: { type: 1, arcWidth: 0.5, arcSpeed: 2.5, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: Sun-ring — beacon lens/housing at head level
        // Flat horizontal, slowly spinning — the lighthouse base
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.02, z: 0 },
                orientation: 'flat'
            },
            count: 1, scale: 0.8, models: ['sun-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.75,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.12, geometryStability: true },
                pulse: { amplitude: 0.06, frequency: 1.5, easing: 'easeInOut' },
                emissive: { min: 0.6, max: 1.2, frequency: 2.5, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.4, phase: 0 },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 6, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 4, scale: 2.0, weight: 0.3 },
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 0.5,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                },
                grain: {
                    type: 3, strength: 0.15, scale: 0.3, speed: 0.4, blend: 'multiply'
                },
                blending: 'additive',
                renderOrder: 15,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.4, arcCount: 2 },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 2 light-rays — the sweeping lighthouse beams
        // These are the visible beams extending from the beacon, spinning
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 2,
                radius: 0.1,
                endRadius: 0.9,
                angleSpread: 360,
                startAngle: 0,
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad'
            },
            count: 2, scale: 1.0, models: ['light-ray'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.65,
                stagger: 0.04,
                enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 0.6, max: 1.5, frequency: 2.5, pattern: 'sine' },
                // Both rays spin together — the lighthouse sweep
                rotate: [
                    { axis: 'z', rotations: 2.0, phase: 0 },
                    { axis: 'z', rotations: 2.0, phase: 180 }
                ],
                blending: 'additive',
                renderOrder: 17,
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 4: 3 sparkle-stars — motes drifting down from beacon
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'top',
                end: 'center',
                easing: 'easeIn',
                startScale: 0.5,
                endScale: 0.2,
                startDiameter: 0.2,
                endDiameter: 0.8,
                orientation: 'camera'
            },
            formation: {
                type: 'spiral',
                count: 3,
                spacing: 0.05,
                arcOffset: 120,
                phaseOffset: 0
            },
            count: 3, scale: 0.4, models: ['sparkle-star'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.7,
                stagger: 0.1,
                enter: { type: 'fade', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 0.8, max: 1.5, frequency: 3, pattern: 'sine' },
                scaleVariance: 0.3,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 14,
            }
        }
    ],

    decayRate: 0.2,
    glowColor: [1.0, 0.95, 0.80],
    glowIntensityMin: 0.5,
    glowIntensityMax: 1.0,
    glowFlickerRate: 4,
    scaleVibration: 0.008,
    scaleFrequency: 2.5,
    scalePulse: true,
    tremor: 0.002,
    tremorFrequency: 3
};

export default buildLightEffectGesture(LIGHTBEACON_CONFIG);
