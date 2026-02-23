/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Entangle Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Natureentangle gesture - vines wrapping and squeezing the mascot
 * @module gestures/destruction/elemental/entangle
 *
 * CONCEPT: Vine squeeze with two layers:
 * Layer 1: 6 flat vine-rings descending from above → feet, narrowing diameter.
 *          Arc animation sweeps create the illusion of vines wrapping tighter.
 * Layer 2: 6 mixed organic models surface-spawned on mascot body — the
 *          squeeze contact points where vines grip the surface.
 *
 * Like iceencase for the surface layer, naturedrill-like axis-travel for wrapping.
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREENTANGLE_CONFIG = {
    name: 'natureentangle',
    emoji: '🌿',
    type: 'blending',
    description: 'Vine squeeze — wrapping rings tighten while organic growths grip the surface',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    category: 'afflicted',
    growth: 0.7,

    spawnMode: [
        // ── Layer 1: 6 flat vine-rings descending → feet, wrapping entire body ──
        // Rings descend from above, squeeze to mascot width, and HOLD (no shrink)
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'above',
                end: 'center',
                endOffset: -0.15,
                easing: 'easeOut',
                startScale: 1.0,
                endScale: 1.0,
                startDiameter: 1.5,
                endDiameter: 1.0,
                diameterUnit: 'mascot',
                holdAt: 0.75,
                orientation: 'flat'
            },
            formation: {
                type: 'spiral',
                count: 6,
                spacing: 0.12,
                arcOffset: 60,
                phaseOffset: 0.03
            },
            count: 6,
            scale: 2.0,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.95,
                stagger: 0.05,
                enter: {
                    type: 'scale',
                    duration: 0.1,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                parameterAnimation: {
                    growth: {
                        start: 0.4,
                        peak: 0.8,
                        end: 0.6,
                        curve: 'bell'
                    }
                },
                pulse: {
                    amplitude: 0.05,
                    frequency: 2,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 0.5,
                    max: 1.0,
                    frequency: 2,
                    pattern: 'sine'
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 0, scale: 2.0, weight: 0.35 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'fadeIn'
                },
                grain: { type: 3, strength: 0.2, scale: 0.3, speed: 0.8, blend: 'multiply' },
                rotate: [
                    { axis: 'z', rotations: 0.8, phase: 0 },
                    { axis: 'z', rotations: -1.2, phase: 45 },
                    { axis: 'z', rotations: 1.5, phase: 120 },
                    { axis: 'z', rotations: -0.6, phase: 200 },
                    { axis: 'z', rotations: 1.0, phase: 270 },
                    { axis: 'z', rotations: -1.4, phase: 160 }
                ],
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.6,
                            arcSpeed: 1.5,
                            arcCount: 2
                        },
                        orientationOverride: 'flat'
                    }
                },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.4,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                }]
            }
        },

        // ── Layer 2: 6 mixed organic pieces surface-spawned (squeeze grip) ───
        // Like iceencase: models growing ON mascot surface as the vines squeeze
        {
            type: 'surface',
            pattern: 'shell',
            embedDepth: 0.15,
            cameraFacing: 0.35,
            clustering: 0.1,
            minDistance: 0.1,
            count: 6,
            scale: 1.0,
            models: ['vine-twist', 'thorn-curl', 's-vine'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.85,
                stagger: 0.05,
                enter: {
                    type: 'grow',
                    duration: 0.15,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'shrink',
                    duration: 0.2,
                    easing: 'easeInQuad'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                pulse: {
                    amplitude: 0.04,
                    frequency: 1.5,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: { min: 0.3, max: 0.7, frequency: 1.5, pattern: 'sine' },
                rotate: {
                    axis: 'y',
                    speed: 0.006,
                    oscillate: true,
                    range: Math.PI / 20
                },
                scaleVariance: 0.2,
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    'vine-twist': {
                        scaling: { mode: 'non-uniform', axes: { x: 1.2, y: 0.8, z: 1.2 } }
                    },
                    'thorn-curl': {
                        scaling: { mode: 'non-uniform', axes: { x: 0.85, y: 1.5, z: 0.85 } }
                    },
                    's-vine': {
                        scaling: { mode: 'non-uniform', axes: { x: 0.7, y: 1.6, z: 0.7 } }
                    }
                }
            }
        }
    ],

    glowColor: [0.2, 0.7, 0.25],
    glowIntensityMin: 0.5,
    glowIntensityMax: 1.0,
    glowFlickerRate: 3,
    scaleVibration: 0.012,
    scaleFrequency: 3,
    scaleContract: 0.02,
    tremor: 0.004,
    tremorFrequency: 4,
    decayRate: 0.18
};

export default buildNatureEffectGesture(NATUREENTANGLE_CONFIG);
