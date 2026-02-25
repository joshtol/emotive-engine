/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Zap Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric zap gesture - explosive multi-layer lightning burst
 * @module gestures/destruction/elemental/electriczap
 *
 * VISUAL DIAGRAM:
 *         ⚡                          ← arc-medium body rising upward
 *    ↙⚡      ⚡↗                     ← spark-spike arms spreading out
 *         ★                           ← mascot at center
 *       ⚡  ⚡                         ← arc-small fragments trailing below
 *
 * CONCEPT: Multi-layer burst. Body rises via axis-travel (proven
 * reliable), arms spread from center via anchor+drift (spark-spike's elongated
 * shape reads as bolts). Tail sparks trail below. Flash events create dramatic
 * lightning strikes on the rising body. 5 total instances — lightweight.
 *
 * KEY: All layers include shaderAnimation in modelOverrides (matching
 * electricblast's proven pattern). Scales are large enough for bolt-driven
 * alpha to be visible.
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICZAP_CONFIG = {
    name: 'zap',
    emoji: '⚡',
    type: 'blending',
    description: 'Explosive multi-layer lightning burst',
    duration: 2000,
    beats: 4,
    intensity: 1.7,
    mascotGlow: 0.5,
    category: 'powered',

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Body — arc-medium rising from below to above
        // The central mass, axis-travel is the proven reliable pattern
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeIn',
                startScale: 0.5,
                endScale: 1.6,
                startDiameter: 0.8,
                endDiameter: 1.0,
                orientation: 'camera'
            },
            formation: {
                type: 'spiral',
                count: 1,
                strands: 1,
                spacing: 0,
                arcOffset: 0,
                phaseOffset: 0
            },
            count: 1,
            scale: 1.5,
            models: ['arc-medium'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.75,
                enter: { type: 'scale', duration: 0.06, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.06, geometryStability: true },
                flicker: { intensity: 0.35, rate: 14, pattern: 'random' },
                emissive: { min: 1.2, max: 3.0, frequency: 8, pattern: 'sine' },
                cutout: {
                    strength: 0.35,
                    primary: { pattern: 7, scale: 1.0, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut'
                },
                grain: { type: 3, strength: 0.12, scale: 0.25, speed: 2.0, blend: 'multiply' },
                // Per-gesture atmospheric particles: ionized air from zap
                atmospherics: [{
                    preset: 'ozone',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.5,
                    sizeScale: 1.2,
                    progressCurve: 'pulse',
                }],
                flash: {
                    events: [
                        { at: 0.10, intensity: 2.5 },
                        { at: 0.30, intensity: 4.0 },
                        { at: 0.50, intensity: 5.0 },
                        { at: 0.68, intensity: 3.0 }
                    ],
                    decay: 0.02
                },
                rotate: { axis: 'y', rotations: 1.5, phase: 0 },
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'arc-medium': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: Left Arm — spark-spike spreading left and up
        // Spike's elongated shape reads as a bolt arm when drifting outward
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.1, y: 0.1, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.6,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.8,
            models: ['spark-spike'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.65,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOutBack' },
                exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.2 },
                flicker: { intensity: 0.3, rate: 14, pattern: 'random' },
                drift: { speed: 1.2, distance: 1.0, direction: { x: -1.0, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: -0.25, phase: 0 },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'spark-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: Right Arm — spark-spike spreading right and up (mirror)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.1, y: 0.1, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.6,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.8,
            models: ['spark-spike'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.65,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOutBack' },
                exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.2 },
                flicker: { intensity: 0.3, rate: 14, pattern: 'random' },
                drift: { speed: 1.2, distance: 1.0, direction: { x: 1.0, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 0.25, phase: 0 },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'spark-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 4: Tail — arc-small fragments trailing below
        // Small discharge sparks that give a trailing plume
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 2,
                radius: 0.05,
                endRadius: 0.4,
                angleSpread: 120,
                startAngle: 240,
                orientation: 'camera',
                startScale: 0.3,
                endScale: 0.8,
                scaleEasing: 'easeOutQuad'
            },
            count: 2,
            scale: 0.6,
            models: ['arc-small'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.55,
                stagger: 0.03,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                flicker: { intensity: 0.4, rate: 18, pattern: 'random' },
                scaleVariance: 0.2,
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'arc-small': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    jitterFrequency: 8,
    jitterAmplitude: 0.005,
    jitterDecay: 0.2,
    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 1.4,
    glowIntensityMax: 3.5,
    glowFlickerRate: 10,
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scaleGrowth: 0.03,
    scalePulse: true,
    riseAmount: 0.02
};

export default buildElectricEffectGesture(ELECTRICZAP_CONFIG);
