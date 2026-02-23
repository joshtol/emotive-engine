/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earthmeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthmeditation gesture - dual Star-of-David stone weave
 * @module gestures/destruction/elemental/earthmeditation
 *
 * CONCEPT: Two Star-of-David hexagons — one original, one vertically flipped with
 * reversed rotations. 12 rings total. Each hexagon is a trinity of earth-rings
 * with relay arc handoff creating a weaving stone flow.
 *
 * Uses the relay arc system (aRandomSeed >= 100 encoding) for per-instance arc control.
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHMEDITATION_CONFIG = {
    name: 'earthmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Dual stone weave — earth hexagon meditation',
    duration: 4000,
    beats: 8,
    intensity: 0.7,
    category: 'emanating',
    petrification: 0.3,

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
            models: ['earth-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                atmospherics: [{ preset: 'earth-dust', intensity: 0.15, sizeScale: 0.5, progressCurve: 'sustain' }],
                modelOverrides: {
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
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
            models: ['earth-ring'],
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
                    'earth-ring': {
                        arcPhase: 2.62,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.80, 0.55, 0.25],
    glowIntensityMin: 0.3,
    glowIntensityMax: 0.6,
    glowFlickerRate: 2,
    scaleVibration: 0,
    scaleFrequency: 0,
    scaleContract: 0,
    tremor: 0,
    tremorFrequency: 0,
    shakeAmount: 0,
    shakeFrequency: 0,
    decayRate: 0.2
};

export default buildEarthEffectGesture(EARTHMEDITATION_CONFIG);
