/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Flourish gesture - lush vegetation spreading with spinning u-vine wreaths
 * @module gestures/destruction/elemental/flourish
 *
 * CONCEPT: Dense surface vegetation grows on the mascot while three u-vine wreaths
 * expand outward at staggered heights — a relay of organic crowns blooming open.
 * Each wreath uses arc reveal to sweep into existence, spinning in alternating directions.
 *
 * Layer 1: surface spawn — vine-cluster/leaf-bunch/s-vine on mascot body
 * Layer 2: u-vine wreath (center) — slow spin, arc reveal, 1.5 rotations
 * Layer 3: u-vine wreath (above) — faster counter-spin, delayed relay, 2 rotations
 * Layer 4: u-vine wreath (below) — phase-offset, 1 rotation, earliest exit
 *
 * ORIENTATION NOTES:
 * - u-vine: natively XZ plane → 'vertical' (identity) keeps it horizontal
 *   Uses verticalEdgeAlign: false to skip ring edge-alignment offset
 * - u-vine rotation uses axis 'y' directly (identity orientation, no remap)
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const SHARED_ANIMATION = {
    blending: 'normal',
    renderOrder: 10,
};

const CONFIG = {
    name: 'naturethrive',
    emoji: '🌳',
    type: 'blending',
    description: 'Lush vegetation spreading with spinning u-vine wreaths',
    duration: 3500,
    beats: 5,
    intensity: 1.1,
    category: 'emanating',
    growth: 0.9,
    mascotGlow: 0.5,

    spawnMode: [
        // ── Layer 1: Surface vegetation on mascot body ──
        {
            type: 'surface',
            pattern: 'shell',
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.1,
            count: 10,
            scale: 1.0,
            models: ['vine-cluster', 'leaf-bunch', 's-vine', 'vine-twist'],
            minDistance: 0.12,
            animation: {
                appearAt: 0.05,
                disappearAt: 0.88,
                stagger: 0.035,
                enter: { type: 'grow', duration: 0.1, easing: 'easeOutBack', overshoot: 1.15 },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                pulse: { amplitude: 0.1, frequency: 2, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.55, max: 0.95, frequency: 2, pattern: 'sine' },
                drift: { direction: 'outward', speed: 0.01, noise: 0.1 },
                rotate: { axis: 'y', speed: 0.01, oscillate: true, range: Math.PI / 10 },
                scaleVariance: 0.2,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 8,
                intensityScaling: { scale: 1.25, emissiveMax: 1.3 },
            },
        },

        // ── Layer 2: Center u-vine wreath — slow spin, arc reveal, 1.5 rotations ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'vertical',
                verticalEdgeAlign: false,
                diameterUnit: 'mascot',
                uniformDiameter: true,
                startDiameter: 0.8,
                endDiameter: 1.6,
                startScale: 0.3,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
            },
            count: 1,
            scale: 1.0,
            models: ['u-vine'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.08,
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.18,
                    easing: 'easeOutBack',
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeIn',
                },
                rotate: { axis: 'y', rotations: 1.5 },
                atmospherics: [
                    {
                        preset: 'falling-leaves',
                        targets: ['u-vine'],
                        anchor: 'around',
                        intensity: 0.5,
                        sizeScale: 1.0,
                        progressCurve: 'sustain',
                        velocityInheritance: 0.3,
                    },
                ],
                modelOverrides: {
                    'u-vine': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.65,
                            arcSpeed: 1.2,
                            arcCount: 1,
                        },
                    },
                },
            },
        },

        // ── Layer 3: Upper u-vine wreath — faster counter-spin, relay delay, 2 rotations ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.3, z: 0 },
                orientation: 'vertical',
                verticalEdgeAlign: false,
                diameterUnit: 'mascot',
                uniformDiameter: true,
                startDiameter: 0.6,
                endDiameter: 1.3,
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutCubic',
            },
            count: 1,
            scale: 0.85,
            models: ['u-vine'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.18,
                disappearAt: 0.82,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOutBack',
                },
                exit: {
                    type: 'scale',
                    duration: 0.18,
                    easing: 'easeIn',
                },
                rotate: { axis: 'y', rotations: -2.0, phase: 120 },
                modelOverrides: {
                    'u-vine': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.5,
                            arcSpeed: 1.8,
                            arcCount: 2,
                        },
                    },
                },
            },
        },

        // ── Layer 4: Lower u-vine wreath — phase offset, 1 rotation, earliest exit ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: -0.3, z: 0 },
                orientation: 'vertical',
                verticalEdgeAlign: false,
                diameterUnit: 'mascot',
                uniformDiameter: true,
                startDiameter: 0.6,
                endDiameter: 1.3,
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutCubic',
            },
            count: 1,
            scale: 0.85,
            models: ['u-vine'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.12,
                disappearAt: 0.75,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOutBack',
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeIn',
                },
                rotate: { axis: 'y', rotations: 1.0, phase: 240 },
                modelOverrides: {
                    'u-vine': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.55,
                            arcSpeed: 1.0,
                            arcCount: 1,
                        },
                    },
                },
            },
        },
    ],

    // Glow - rich forest green
    decayRate: 0.15,
    glowColor: [0.3, 0.8, 0.3],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.0,
    glowFlickerRate: 3,

    // Scale dynamics
    scaleVibration: 0.02,
    scaleFrequency: 2,
    tremor: 0.003,
    tremorFrequency: 4,

    // Parameter animation: growth swells to lush peak then fades
    parameterAnimation: {
        growth: {
            keyframes: [
                { at: 0.0, value: 0.3 },
                { at: 0.25, value: 0.9 },
                { at: 0.6, value: 0.85 },
                { at: 0.85, value: 0.6 },
                { at: 1.0, value: 0.0 },
            ],
        },
    },

    // Post-processing
    cutout: {
        primary: { pattern: 'leaf', scale: 3.0, blend: 'multiply', travelSpeed: 0.3 },
        secondary: { pattern: 'organic', scale: 5.0, blend: 'overlay', travelSpeed: 0.2 },
    },
    grain: { type: 3, strength: 0.03, blend: 'multiply', speed: 0.35 },
};

export default buildNatureEffectGesture(CONFIG);
