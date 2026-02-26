/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Iceencase Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Iceencase gesture - ice crystals growing on mascot surface
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/iceencase
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *       ❄ ❄ ❄ ❄ ❄
 *      ❄ ╭───────╮ ❄
 *      ❄ │  ★    │ ❄    ← Crystals grow ON the surface
 *      ❄ │ /|\ ↗ │ ❄       encasing the mascot in ice
 *      ❄ ╰───────╯ ❄
 *       ❄ ❄ ❄ ❄ ❄
 *
 * FEATURES:
 * - 4 ice model types: crystal-cluster, crystal-medium, crystal-small, ice-spike
 * - Surface spawn mode: crystals grow directly on mascot surface
 * - Progressive stagger: ice spreads across mascot over time
 * - Non-uniform scaling: spikes grow tall, clusters spread wide
 * - Slow crystalline pulse for frozen shimmer
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Frozen/encased states
 * - Ice imprisonment effects
 * - Crystallization/petrification visuals
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Iceencase gesture configuration
 * Ice crystals growing on mascot surface, encasing it in ice
 */
const ICEENCASE_CONFIG = {
    name: 'iceencase',
    emoji: '🧊',
    type: 'blending',
    description: 'Ice crystals growing on mascot surface, encasing in ice',
    duration: 3500,
    beats: 5,
    intensity: 1.2,
    mascotGlow: 0.5,
    category: 'transform',
    frost: 0.85,

    // 3D Element spawning - crystals growing on mascot surface
    spawnMode: {
        type: 'surface',
        pattern: 'shell', // Even coverage for full encasement
        embedDepth: 0.2, // Slightly embedded into surface
        cameraFacing: 0.4, // Mostly surface-normal aligned, some camera bias
        clustering: 0.1, // Even distribution
        count: 10, // Dense crystal coverage
        scale: 1.8,
        minDistance: 0.1, // Dense for encasement
        models: ['crystal-cluster', 'crystal-medium', 'crystal-small', 'ice-spike'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.04, // Progressive spread across surface
            enter: {
                type: 'grow', // Crystals grow outward from surface
                duration: 0.12,
                easing: 'easeOutQuad',
            },
            exit: {
                type: 'shrink',
                duration: 0.15,
                easing: 'easeInQuad',
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true,
            },
            parameterAnimation: {
                frost: {
                    start: 0.5,
                    peak: 0.9,
                    end: 0.7,
                    curve: 'fadeIn',
                },
            },
            // Frozen shimmer - slow crystalline pulse
            pulse: {
                amplitude: 0.05,
                frequency: 1.2,
                easing: 'easeInOut',
                sync: 'global',
            },
            emissive: {
                min: 0.5,
                max: 0.9,
                frequency: 1.5,
                pattern: 'sine',
            },
            // Per-gesture atmospheric particles: cold mist as ice encases
            atmospherics: [
                {
                    preset: 'mist',
                    targets: null,
                    anchor: 'below',
                    intensity: 0.3,
                    sizeScale: 1.2,
                    progressCurve: 'sustain',
                },
            ],
            // Edge breakup: ice shader's own Voronoi cracks become actual geometry
            // holes at silhouette edges, creating jagged crystalline outlines.
            // Only edgeMask needed — the ice shader uses its own crack computation.
            cutout: {
                edgeMask: 0.3,
            },
            // Very slow oscillating rotation
            rotate: {
                axis: 'y',
                speed: 0.008,
                oscillate: true,
                range: Math.PI / 16,
            },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 6,
            intensityScaling: {
                scale: 1.25,
                emissiveMax: 1.2,
            },
            // Model-specific behavior overrides
            modelOverrides: {
                'crystal-small': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.0 },
                            y: { expand: true, rate: 1.4 },
                            z: { expand: true, rate: 1.0 },
                        },
                        easing: 'easeOutQuad',
                    },
                },
                'crystal-medium': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.1 },
                            y: { expand: true, rate: 1.5 },
                            z: { expand: true, rate: 1.1 },
                        },
                    },
                },
                'crystal-cluster': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.3 },
                            y: { expand: true, rate: 1.2 },
                            z: { expand: true, rate: 1.3 },
                        },
                    },
                },
                'ice-spike': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.85 },
                            y: { expand: true, rate: 1.8 },
                            z: { expand: false, rate: 0.85 },
                        },
                    },
                },
            },
        },
    },

    // Glow - solid ice blue
    glowColor: [0.6, 0.85, 1.0],
    glowIntensityMin: 0.55,
    glowIntensityMax: 0.9,
    glowFlickerRate: 2,
    // Scale - slight contraction as ice encases
    scaleVibration: 0.01,
    scaleFrequency: 2,
    scaleContract: 0.02,
    // Tremor - freezing in place
    tremor: 0.004,
    tremorFrequency: 6,
    tremorDecay: 0.8,
    // Decay
    decayRate: 0.15,
};

/**
 * Iceencase gesture - ice crystals growing on mascot surface.
 *
 * Uses surface spawn mode with shell pattern:
 * - 4 crystal model types growing on mascot surface
 * - Progressive stagger for spreading encasement
 * - Non-uniform scaling: spikes grow tall, clusters spread wide
 * - Slow crystalline pulse + subtle oscillation
 */
export default buildIceEffectGesture(ICEENCASE_CONFIG);
