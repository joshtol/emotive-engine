/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Burden Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthburden gesture - stacking stone slabs pressing down on mascot
 * @module gestures/destruction/elemental/earthburden
 *
 * FEATURES:
 * - 3 stone slabs stacking on mascot's head, each appearing with delay
 * - Progressive weight — each slab makes mascot struggle more
 * - Sinking effect as burden increases
 * - Low, grinding tremor
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHBURDEN_CONFIG = {
    name: 'earthburden',
    emoji: '⬇️',
    type: 'blending',
    description: 'Stone slabs stack on the mascot, each adding more crushing weight',
    duration: 3000,
    beats: 4,
    intensity: 0.9,
    category: 'afflicted',
    petrification: 0.5,

    spawnMode: [
        // ── Slab 1: First slab lands immediately ─────────────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.08, z: 0 },
                orientation: 'flat',
                startScale: 0.3,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.6,
            models: ['stone-slab'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutBounce' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 0.3, max: 0.6, frequency: 0.8, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.001, phase: 0 },
                atmospherics: [
                    {
                        preset: 'earth-dust',
                        targets: ['stone-slab'],
                        anchor: 'above',
                        intensity: 0.15,
                        sizeScale: 0.6,
                        progressCurve: 'sustain',
                    },
                ],
                blending: 'normal',
                renderOrder: 10,
            },
        },

        // ── Slab 2: Second slab stacks on top (rotated, smaller) ────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.2, z: 0 },
                orientation: 'flat',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.1,
            models: ['stone-slab'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.8,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutBounce' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 0.3, max: 0.6, frequency: 0.8, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.001, phase: 45 },
                atmospherics: [
                    {
                        preset: 'earth-gravel',
                        targets: ['stone-slab'],
                        anchor: 'below',
                        intensity: 0.2,
                        sizeScale: 0.5,
                        progressCurve: 'burst',
                    },
                ],
                blending: 'normal',
                renderOrder: 11,
            },
        },

        // ── Slab 3: Third slab — final crushing weight (rotated, big) ───
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.32, z: 0 },
                orientation: 'flat',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.4,
            models: ['stone-slab'],
            animation: {
                appearAt: 0.3,
                disappearAt: 0.75,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutBounce' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 0.4, max: 0.7, frequency: 1.0, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.001, phase: -30 },
                atmospherics: [
                    {
                        preset: 'earth-dust',
                        targets: ['stone-slab'],
                        anchor: 'above',
                        intensity: 0.3,
                        sizeScale: 0.8,
                        progressCurve: 'burst',
                    },
                    {
                        preset: 'earth-gravel',
                        targets: ['stone-slab'],
                        anchor: 'below',
                        intensity: 0.25,
                        sizeScale: 0.6,
                        progressCurve: 'burst',
                    },
                ],
                blending: 'normal',
                renderOrder: 12,
            },
        },
    ],

    sinkAmount: 0.03,
    sinkAcceleration: 0.5,
    decayRate: 0.2,
    glowColor: [0.7, 0.5, 0.25],
    glowIntensityMin: 0.3,
    glowIntensityMax: 0.5,
    tremor: 0.006,
    tremorFrequency: 2,
};

export default buildEarthEffectGesture(EARTHBURDEN_CONFIG);
