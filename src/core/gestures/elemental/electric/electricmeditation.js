/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electricmeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricmeditation gesture - dual Star-of-David lightning weave
 * @module gestures/destruction/elemental/electricmeditation
 *
 * CONCEPT: Two Star-of-David hexagons — one original, one vertically flipped with
 * reversed rotations. 12 rings total. Each hexagon is a trinity of lightning-rings
 * with relay arc handoff creating a weaving energy flow.
 *
 * Uses the relay arc system (aRandomSeed >= 100 encoding) for per-instance arc control.
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICMEDITATION_CONFIG = {
    name: 'electricmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Dual lightning weave — electric hexagon meditation',
    duration: 4000,
    beats: 8,
    intensity: 0.7,
    mascotGlow: 0.4,
    category: 'emanating',
    charge: 0.4,

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
            models: ['lightning-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                atmospherics: [{ preset: 'ozone', intensity: 0.15, sizeScale: 0.5, progressCurve: 'sustain' }],
                modelOverrides: {
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
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
            models: ['lightning-ring'],
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
                    'lightning-ring': {
                        arcPhase: 2.62,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.5, 0.7, 1.0],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.9,
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

export default buildElectricEffectGesture(ELECTRICMEDITATION_CONFIG);
