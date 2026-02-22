/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icemeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icemeditation gesture - icetwirl doubled into a hexagon
 * @module gestures/destruction/elemental/icemeditation
 *
 * CONCEPT: Two Star-of-David hexagons — one original, one vertically flipped with
 * reversed rotations. 12 rings total. Each hexagon is icetwirl + its mirror.
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

const ICEMEDITATION_CONFIG = {
    name: 'icemeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Dual ice weave — icetwirl hexagon',
    duration: 4000,
    beats: 8,
    intensity: 0.7,
    category: 'emanating',
    frost: 0.5,

    spawnMode: [
        // ═══ ICETWIRL ORIGINAL ═══

        // Ring A — lower-left — relay 2, CW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.38, y: -0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 0.0,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring B — lower-right — relay 1, CCW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.38, y: -0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: 5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 3.14,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring C — upper-center — relay 0, CW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.0, y: 0.44, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 4.71,
                        relayIndex: 0,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══ Y-FLIPPED COPY (everything identical except offset.y negated) ═══

        // Ring A (flipped) — upper-right — relay 2, CCW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.38, y: 0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: 5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 0.0,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring B (flipped) — upper-left — relay 1, CW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.38, y: 0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 3.14,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring C (flipped) — lower-center — relay 0, CCW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.0, y: -0.44, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: 5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 4.71,
                        relayIndex: 0,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══ VERTICAL FLIP OF ENTIRE THING (Y negated, rotations reversed) ═══

        // Ring A (v-flip) — upper-left — relay 2, arc offset +π/3
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.38, y: 0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.04,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: 3, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 1.05,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring B (v-flip) — upper-right — relay 0, arc offset +π/3
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.38, y: 0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.04,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -3, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 4.19,
                        relayIndex: 0,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring C (v-flip) — lower-center — relay 2, arc offset +π/3
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.0, y: -0.44, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.04,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -3, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 2.62,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring A' (v-flip) — lower-right — relay 0, arc offset +π/3
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.38, y: -0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.04,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -3, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 1.05,
                        relayIndex: 0,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring B' (v-flip) — lower-left — relay 1, arc offset +π/3
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.38, y: -0.22, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.04,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: 3, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 4.19,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring C' (v-flip) — upper-center — relay 1, arc offset +π/3
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.0, y: 0.44, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['ice-ring'],
            animation: {
                appearAt: 0.04,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: 3, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'ice-ring': {
                        arcPhase: 2.62,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.6, 0.85, 1.0],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.2,
    glowFlickerRate: 2,
    scaleVibration: 0,
    scaleFrequency: 0,
    scaleContract: 0,
    tremor: 0,
    tremorFrequency: 0,
    shakeAmount: 0,
    shakeFrequency: 0,
    decayRate: 0.15
};

export default buildIceEffectGesture(ICEMEDITATION_CONFIG);
