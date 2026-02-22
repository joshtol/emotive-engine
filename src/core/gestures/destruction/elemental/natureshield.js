/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Natureshield Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Natureshield gesture - living armor with vine cage and organic coating
 * @module gestures/destruction/elemental/natureshield
 *
 * CONCEPT: A living organic shield with 3 distinct defense layers:
 * Layer 1: 8 mixed [vine-twist, thorn-curl, leaf-bunch, vine-cluster] surface-spawn on mascot
 *          — organic armor growing directly on the body (like iceencase)
 * Layer 2: 4 vine-rings orbiting at waist (structural cage perimeter)
 * Layer 3: Single vine-ring flat above head (dome canopy)
 *
 * Like iceencase: mixed models surface-spawned on mascot body.
 * Plus vine-ring structural cage for visible protection boundary.
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATURESHIELD_CONFIG = {
    name: 'natureshield',
    emoji: '🛡️',
    type: 'blending',
    description: 'Living shield — organic armor grows on body, vine cage orbits around',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'emanating',
    growth: 0.7,

    spawnMode: [
        // ── Layer 1: 8 mixed organic pieces surface-spawned (living armor) ──
        // Like iceencase: multiple model types growing ON mascot surface
        {
            type: 'surface',
            pattern: 'shell',
            embedDepth: 0.15,
            cameraFacing: 0.35,
            clustering: 0.1,
            minDistance: 0.1,
            count: 8,
            scale: 1.2,
            models: ['vine-twist', 'thorn-curl', 'leaf-bunch', 'vine-cluster'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                stagger: 0.04,
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
                renderOrder: 4,
                modelOverrides: {
                    'vine-twist': {
                        scaling: { mode: 'non-uniform', axes: { x: 1.2, y: 0.8, z: 1.2 } }
                    },
                    'thorn-curl': {
                        scaling: { mode: 'non-uniform', axes: { x: 0.85, y: 1.5, z: 0.85 } }
                    },
                    'leaf-bunch': {
                        scaling: { mode: 'non-uniform', axes: { x: 1.3, y: 0.7, z: 1.3 } }
                    },
                    'vine-cluster': {
                        scaling: { mode: 'non-uniform', axes: { x: 0.8, y: 1.4, z: 0.8 } }
                    }
                }
            }
        },

        // ── Layer 2: 4 vine-rings orbiting at waist (structural cage) ──────
        {
            type: 'orbit',
            orbit: {
                height: 0.0,
                endHeight: 0.0,
                radius: 0.8,
                endRadius: 0.8,
                speed: 0.3,
                easing: 'linear',
                startScale: 1.0,
                endScale: 1.0,
                orientation: 'camera'
            },
            formation: {
                type: 'ring',
                count: 4,
                arcOffset: 90
            },
            count: 4,
            scale: 1.5,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.8,
                stagger: 0.03,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                pulse: { amplitude: 0.04, frequency: 2, easing: 'easeInOut' },
                emissive: { min: 0.5, max: 0.9, frequency: 2, pattern: 'sine' },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 0, scale: 3.0, weight: 1.0 },
                    secondary: { pattern: 3, scale: 2.0, weight: 0.3 },
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 0.5,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.1, scale: 0.3, speed: 0.4, blend: 'multiply' },
                rotate: [
                    { axis: 'z', rotations: 0.3, phase: 0 },
                    { axis: 'z', rotations: -0.25, phase: 90 },
                    { axis: 'z', rotations: 0.35, phase: 180 },
                    { axis: 'z', rotations: -0.3, phase: 270 }
                ],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ── Layer 3: Dome cap (flat ring above head) ────────────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'above',
                offset: { x: 0, y: 0.15, z: 0 },
                orientation: 'flat',
                bob: { amplitude: 0.015, frequency: 0.5 }
            },
            count: 1,
            scale: 1.8,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.75,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                emissive: { min: 0.6, max: 1.0, frequency: 2, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.25, phase: 0 },
                blending: 'normal',
                renderOrder: 6,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.7, arcSpeed: 0.4, arcCount: 2 },
                        orientationOverride: 'flat'
                    }
                }
            }
        }
    ],

    glowColor: [0.15, 0.55, 0.15],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.85,
    glowFlickerRate: 2,
    scaleVibration: 0.005,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 2,
    decayRate: 0.2
};

export default buildNatureEffectGesture(NATURESHIELD_CONFIG);
