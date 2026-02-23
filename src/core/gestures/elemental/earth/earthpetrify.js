/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Petrify Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthpetrify gesture - encasement in stone
 * @module gestures/destruction/elemental/earthpetrify
 *
 * FEATURES:
 * - Layer 1: Ground foundation — flat earth-ring expanding at feet
 * - Layer 2: Converging orbit — 5 rocks spiral inward from wide radius to hug the mascot
 *   Petrification ramps UP (0.3 → 0.95) as rocks close in
 * - Layer 3: Stone-slab cap — descends from above to seal the tomb
 * - Layer 4: Stone-slab plate below — seals the bottom
 * - Slow inevitable pace (3500ms), sinking, contracting
 * - NOTE: Uses orbit instead of surface-shell to avoid phallic silhouettes
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHPETRIFY_CONFIG = {
    name: 'earthpetrify',
    emoji: '🗿',
    type: 'blending',
    description: 'Rocks converge from all sides, entombing the mascot in a stone prison',
    duration: 3500,
    beats: 5,
    intensity: 1.2,
    category: 'afflicted',
    petrification: 0.95,

    spawnMode: [
        // ── Layer 1: Ground foundation — flat earth-ring expanding at feet ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'feet',
                offset: { x: 0, y: -0.02, z: 0 },
                orientation: 'flat',
                startScale: 0.3,
                endScale: 1.2,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 2.0,
            models: ['earth-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                emissive: { min: 0.5, max: 1.0, frequency: 1.5, pattern: 'sine' },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: ['earth-ring'],
                    anchor: 'above',
                    intensity: 0.3,
                    sizeScale: 1.5,
                    progressCurve: 'buildup',
                }],
                blending: 'normal',
                renderOrder: 4,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.8,
                            arcSpeed: 0.5,
                            arcCount: 2
                        },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ── Layer 2: Converging rocks — orbit spiraling inward ──────────────
        // Rocks close in from a wide orbit, getting closer and slower
        // as they "lock into place" around the mascot
        {
            type: 'orbit',
            orbit: {
                height: 'center',
                endHeight: 'center',
                radius: 1.8,
                endRadius: 0.35,
                speed: 1.5,
                easing: 'easeInQuad',
                startScale: 0.5,
                endScale: 1.0,
                orientation: 'camera'
            },
            count: 5,
            scale: 0.8,
            models: ['boulder', 'rock-cluster', 'stone-slab', 'rock-chunk-medium', 'boulder'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.75,
                stagger: 0.06,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                parameterAnimation: {
                    petrification: {
                        start: 0.3,
                        peak: 0.95,
                        end: 0.9,
                        curve: 'fadeIn'
                    }
                },
                pulse: {
                    amplitude: 0.03,
                    frequency: 1,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: { min: 0.4, max: 0.9, frequency: 1.5, pattern: 'sine' },
                rotate: [
                    { axis: 'x', rotations: -0.8, phase: 0 },
                    { axis: 'z', rotations: 0.6, phase: 72 },
                    { axis: 'y', rotations: -0.5, phase: 144 },
                    { axis: 'x', rotations: 0.7, phase: 216 },
                    { axis: 'z', rotations: -0.6, phase: 288 }
                ],
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.4,
                    sizeScale: 0.8,
                    progressCurve: 'buildup',
                }],
                scaleVariance: 0.25,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 8
            }
        },

        // ── Layer 3: Stone-slab cap — descends from above to seal the tomb ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.1, z: 0 },
                orientation: 'flat',
                startScale: 0.1,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.5,
            models: ['stone-slab'],
            animation: {
                appearAt: 0.5,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOutBounce' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 0.6, max: 1.2, frequency: 1, pattern: 'sine' },
                atmospherics: [{
                    preset: 'earth-gravel',
                    targets: ['stone-slab'],
                    anchor: 'below',
                    intensity: 0.4,
                    sizeScale: 0.6,
                    progressCurve: 'burst',
                }],
                blending: 'normal',
                renderOrder: 12
            }
        },

        // ── Layer 4: Stone-slab plate — seals from below ────────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'feet',
                offset: { x: 0, y: -0.05, z: 0 },
                orientation: 'flat',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.6,
            models: ['stone-slab'],
            animation: {
                appearAt: 0.35,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutQuad' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 0.4, max: 0.8, frequency: 1, pattern: 'sine' },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: ['stone-slab'],
                    anchor: 'above',
                    intensity: 0.2,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                }],
                blending: 'normal',
                renderOrder: 4
            }
        }
    ],

    sinkAmount: 0.02,
    sinkAcceleration: 0.4,
    scaleContract: 0.015,
    decayRate: 0.2,
    glowColor: [0.65, 0.45, 0.20],
    glowIntensityMin: 0.3,
    glowIntensityMax: 0.7,
    glowFlickerRate: 1.0,
    tremor: 0.008,
    tremorFrequency: 3,
    tremorDecay: 0.7
};

export default buildEarthEffectGesture(EARTHPETRIFY_CONFIG);
