/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Blast Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricblast gesture - explosive discharge burst
 * @module gestures/destruction/elemental/electricblast
 *
 * VISUAL DIAGRAM:
 *         ⚡↗      ⚡↗         ← Spark-spikes shoot outward
 *           ═══════            ← Plasma-ring expanding at center
 *         ⚡↙      ⚡↙         ← Arc-ring-small discharge fragments
 *
 * CONCEPT: Simplified from 5 layers (27 instances!) to 3 layers (7 instances).
 * 3D Voronoi is GPU-expensive — fewer instances, each more impactful.
 * Flash at detonation makes the blast feel powerful despite fewer elements.
 * Uses all 3 underused models: plasma-ring, spark-spike, arc-ring-small.
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICBLAST_CONFIG = {
    name: 'electricblast',
    emoji: '💥',
    type: 'blending',
    description: 'Explosive electrical discharge burst',
    duration: 1000,
    beats: 2,
    intensity: 1.5,
    category: 'electrocute',

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Central plasma-ring — expanding discharge wave
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 2.2,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 2.0,
            models: ['plasma-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                flicker: { intensity: 0.3, rate: 14, pattern: 'random' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 2, scale: 1.5, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.5,
                    strengthCurve: 'fadeOut',
                },
                grain: { type: 3, strength: 0.3, scale: 0.25, speed: 3.0, blend: 'multiply' },
                // Per-gesture atmospheric particles: intense ionized air blast
                atmospherics: [
                    {
                        preset: 'ozone',
                        targets: null,
                        anchor: 'above',
                        intensity: 0.8,
                        sizeScale: 2.0,
                        progressCurve: 'pulse',
                    },
                ],
                flash: {
                    events: [
                        { at: 0.0, intensity: 4.0 },
                        { at: 0.15, intensity: 1.5 },
                    ],
                    decay: 0.03,
                },
                blending: 'additive',
                renderOrder: 8,
                modelOverrides: {
                    'plasma-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: 3 spark-spikes — bolt arms shooting outward
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.5,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.0,
            models: ['spark-spike'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                flicker: { intensity: 0.35, rate: 16, pattern: 'random' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.4,
                    distance: 0.8,
                    direction: { x: 0, y: 1.0, z: 0 },
                    easing: 'easeOutQuad',
                },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'spark-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.25,
                endScale: 1.3,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.9,
            models: ['spark-spike'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                flicker: { intensity: 0.35, rate: 16, pattern: 'random' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 0.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.3,
                    distance: 0.75,
                    direction: { x: -0.8, y: 0.7, z: 0 },
                    easing: 'easeOutQuad',
                },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'spark-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.25,
                endScale: 1.3,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.9,
            models: ['spark-spike'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                flicker: { intensity: 0.35, rate: 16, pattern: 'random' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 0.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.3,
                    distance: 0.75,
                    direction: { x: 0.8, y: 0.7, z: 0 },
                    easing: 'easeOutQuad',
                },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'spark-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 3 arc-ring-small — discharge fragments (radial burst)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 3,
                radius: 0.05,
                endRadius: 0.6,
                angleSpread: 360,
                startAngle: 30,
                orientation: 'camera',
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutQuad',
            },
            count: 3,
            scale: 0.6,
            models: ['arc-ring-small'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.4,
                stagger: 0.01,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                flicker: { intensity: 0.4, rate: 18, pattern: 'random' },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 3, scale: 0.7, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.0,
                    strengthCurve: 'fadeOut',
                },
                scaleVariance: 0.3,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'arc-ring-small': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
    ],

    jitterFrequency: 60,
    jitterAmplitude: 0.02,
    jitterDecay: 0.25,
    glowColor: [0.4, 0.9, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 15,
    scaleVibration: 0.04,
    scaleFrequency: 10,
    scaleGrowth: 0.02,
};

export default buildElectricEffectGesture(ELECTRICBLAST_CONFIG);
