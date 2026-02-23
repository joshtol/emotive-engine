/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Crumble Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthcrumble gesture - multi-phase structural collapse and debris scatter
 * @module gestures/destruction/elemental/earthcrumble
 *
 * FEATURES:
 * - Phase 1: Surface 'spikes' — stone-spikes erupting upward through the mascot
 *   Growing before breaking free, shatterPoint triggers Phase 2
 * - Phase 2: Radial-burst — 10 mixed debris chunks explode outward in full 360°
 *   Each piece tumbles on unique axes, shrinking as they fly, burst-fade exit
 * - Phase 3: Ground-level shockwave — flat earth-ring expanding at feet
 *   With gravel cascade + heavy dust cloud (dual atmospherics)
 * - Aggressive shake, endFlash at shatter moment, fadeOut
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHCRUMBLE_CONFIG = {
    name: 'earthcrumble',
    emoji: '💔',
    type: 'blending',
    description: 'Structural collapse — stone cracks, shatters outward, and crumbles to dust',
    duration: 2000,
    beats: 3,
    intensity: 1.4,
    category: 'transform',
    petrification: 0.7,

    spawnMode: [
        // ── Phase 1: Cracking spikes — stone erupting upward through body ───
        {
            type: 'surface',
            pattern: 'spikes',
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.15,
            count: 4,
            scale: 0.9,
            minDistance: 0.12,
            models: ['stone-spike', 'stone-spike', 'stone-spike', 'stone-spike'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.4,
                stagger: 0.04,
                enter: {
                    type: 'grow',
                    duration: 0.12,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.1,
                    easing: 'easeIn',
                    burstScale: 1.3
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                parameterAnimation: {
                    petrification: {
                        start: 0.7,
                        peak: 0.9,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                pulse: {
                    amplitude: 0.06,
                    frequency: 6,
                    easing: 'easeInOut'
                },
                emissive: { min: 0.5, max: 1.2, frequency: 4, pattern: 'sine' },
                cutout: {
                    edgeMask: 0.25
                },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.3,
                    sizeScale: 0.8,
                    progressCurve: 'buildup',
                }],
                scaleVariance: 0.25,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 6,
                modelOverrides: {
                    'stone-spike': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.8 },
                                y: { expand: true, rate: 2.0 },
                                z: { expand: false, rate: 0.8 }
                            }
                        }
                    }
                }
            }
        },

        // ── Phase 2: Explosion — debris flying outward ─────────────────────
        {
            type: 'radial-burst',
            radialBurst: {
                count: 10,
                radius: 0.15,
                endRadius: 2.5,
                angleSpread: 360,
                startAngle: 0,
                orientation: 'camera'
            },
            startScale: 0.7,
            endScale: 0.2,
            scaleEasing: 'easeInQuad',
            speedCurve: 'burst',
            count: 10,
            scale: 0.55,
            models: ['rock-chunk-small', 'rock-chunk-medium', 'rock-chunk-small', 'boulder', 'rock-chunk-small', 'rock-chunk-medium', 'rock-chunk-small', 'rock-cluster', 'rock-chunk-small', 'rock-chunk-medium'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.75,
                stagger: 0.01,
                enter: { type: 'scale', duration: 0.06, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.2, easing: 'easeIn', burstScale: 1.1 },
                emissive: { min: 0.4, max: 0.8, frequency: 3, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 3, phase: 0 },
                    { axis: 'x', rotations: -2, phase: 36 },
                    { axis: 'y', rotations: 2.5, phase: 72 },
                    { axis: 'z', rotations: -1.5, phase: 108 },
                    { axis: 'x', rotations: 2, phase: 144 },
                    { axis: 'y', rotations: -3, phase: 180 },
                    { axis: 'z', rotations: 1.5, phase: 216 },
                    { axis: 'x', rotations: -2.5, phase: 252 },
                    { axis: 'y', rotations: 2, phase: 288 },
                    { axis: 'z', rotations: -2, phase: 324 }
                ],
                atmospherics: [{
                    preset: 'earth-gravel',
                    targets: null,
                    anchor: 'below',
                    intensity: 0.6,
                    sizeScale: 1.0,
                    progressCurve: 'burst',
                    velocityInheritance: 0.5,
                }, {
                    preset: 'earth-dust',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.5,
                    sizeScale: 1.5,
                    progressCurve: 'sustain',
                }],
                scaleVariance: 0.35,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 12
            }
        },

        // ── Phase 3: Ground shockwave — expanding dust ring at feet ────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'bottom',
                offset: { x: 0, y: -0.05, z: 0 },
                orientation: 'flat',
                startScale: 0.2,
                endScale: 2.5,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.0,
            models: ['earth-ring'],
            animation: {
                appearAt: 0.3,
                disappearAt: 0.7,
                enter: { type: 'fade', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                cutout: {
                    strength: 0.75,
                    primary: { pattern: 8, scale: 2.0, weight: 1.0 },
                    secondary: { pattern: 7, scale: 1.5, weight: 0.5 },
                    blend: 'add',
                    travel: 'radial',
                    travelSpeed: 3.0,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                    trailDissolve: {
                        offset: -0.3,
                        softness: 1.5,
                        direction: 'outward'
                    }
                },
                grain: {
                    type: 3, strength: 0.25, scale: 0.2, speed: 3.0, blend: 'multiply'
                },
                emissive: { min: 0.8, max: 1.5, frequency: 2, pattern: 'sine' },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: ['earth-ring'],
                    anchor: 'above',
                    intensity: 0.6,
                    sizeScale: 2.0,
                    progressCurve: 'burst',
                }],
                blending: 'normal',
                renderOrder: 4,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 1.0,
                            arcSpeed: 0,
                            arcCount: 1
                        }
                    }
                }
            }
        }
    ],

    shatterPoint: 0.28,
    endFlash: true,
    fadeOut: true,
    fadeStartAt: 0.5,
    fadeEndAt: 0.95,
    scaleShrink: 0.15,
    distortionStrength: 1.2,
    decayRate: 0.2,
    glowColor: [0.80, 0.55, 0.25],
    glowIntensityMin: 0.5,
    glowIntensityMax: 1.0,
    glowFlickerRate: 4,
    shakeAmount: 0.03,
    shakeFrequency: 15,
    tremor: 0.012,
    tremorFrequency: 8
};

export default buildEarthEffectGesture(EARTHCRUMBLE_CONFIG);
