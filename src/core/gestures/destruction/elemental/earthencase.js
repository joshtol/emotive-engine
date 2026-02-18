/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Encase Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthencase gesture - stone clusters growing on mascot surface
 * @module gestures/destruction/elemental/earthencase
 *
 * FEATURES:
 * - 4 earth model types: rock-cluster, rock-chunk-medium, rock-chunk-small, stone-spike
 * - Surface spawn mode: stones grow directly on mascot surface
 * - Progressive stagger: stone spreads across mascot over time
 * - Non-uniform scaling: spikes grow tall, clusters spread wide
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHENCASE_CONFIG = {
    name: 'earthencase',
    emoji: '🪨',
    type: 'blending',
    description: 'Stone clusters growing on mascot surface, encasing in rock',
    duration: 3500,
    beats: 5,
    intensity: 1.2,
    category: 'transform',
    petrification: 0.85,

    spawnMode: {
        type: 'surface',
        pattern: 'shell',
        embedDepth: 0.2,
        cameraFacing: 0.4,
        clustering: 0.1,
        count: 10,
        scale: 1.8,
        minDistance: 0.1,
        models: ['rock-cluster', 'rock-chunk-medium', 'rock-chunk-small', 'stone-spike'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.04,
            enter: {
                type: 'grow',
                duration: 0.12,
                easing: 'easeOutQuad'
            },
            exit: {
                type: 'shrink',
                duration: 0.15,
                easing: 'easeInQuad'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                petrification: {
                    start: 0.5,
                    peak: 0.9,
                    end: 0.7,
                    curve: 'fadeIn'
                }
            },
            pulse: {
                amplitude: 0.05,
                frequency: 1.2,
                easing: 'easeInOut',
                sync: 'global'
            },
            emissive: {
                min: 0.5,
                max: 0.9,
                frequency: 1.5,
                pattern: 'sine'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: null,
                anchor: 'below',
                intensity: 0.3,
                sizeScale: 1.2,
                progressCurve: 'sustain',
            }],
            wetness: {
                wetness: 0.50,
                wetSpeed: 0.25
            },
            cutout: {
                edgeMask: 0.3
            },
            rotate: {
                axis: 'y',
                speed: 0.008,
                oscillate: true,
                range: Math.PI / 16
            },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 6,
            intensityScaling: {
                scale: 1.25,
                emissiveMax: 1.2
            },
            modelOverrides: {
                'rock-chunk-small': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.0 },
                            y: { expand: true, rate: 1.4 },
                            z: { expand: true, rate: 1.0 }
                        },
                        easing: 'easeOutQuad'
                    }
                },
                'rock-chunk-medium': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.1 },
                            y: { expand: true, rate: 1.5 },
                            z: { expand: true, rate: 1.1 }
                        }
                    }
                },
                'rock-cluster': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.3 },
                            y: { expand: true, rate: 1.2 },
                            z: { expand: true, rate: 1.3 }
                        }
                    }
                },
                'stone-spike': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.85 },
                            y: { expand: true, rate: 1.8 },
                            z: { expand: false, rate: 0.85 }
                        }
                    }
                }
            }
        }
    },

    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 0.55,
    glowIntensityMax: 0.9,
    glowFlickerRate: 2,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    scaleContract: 0.02,
    tremor: 0.004,
    tremorFrequency: 6,
    tremorDecay: 0.8,
    decayRate: 0.15
};

export default buildEarthEffectGesture(EARTHENCASE_CONFIG);
