/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Phoenix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Phoenix gesture - ascending fire vortex with mixed elements
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/phoenix
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *            ═══════            ← Crown ring at top (flame-ring)
 *          ✦       ✦           ← Fire bursts (fire-burst)
 *        🔥    ★    🔥         ← Flame tongues (flame-tongue)
 *         🔥       🔥           ← Rising spiral
 *           ✧   ✧              ← Wisps + embers at bottom
 *             ↑                 ← All ascending
 *
 * FEATURES:
 * - 8 mixed elements in double-helix spiral
 * - Ordered layering: wisps/embers → tongues → bursts → ring
 * - axis-travel from below to above (funnel shape)
 * - Unified Y-axis rotation (1.5 rotations)
 * - Temperature gradient: cool bottom → hot middle → warm top
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Rebirth/resurrection effects
 * - Power-up transformations
 * - Dramatic fire aura reveals
 * - Victory celebrations
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Phoenix gesture configuration
 * Mixed ascending spiral - fire elements rise in unified vortex
 */
const PHOENIX_CONFIG = {
    name: 'phoenix',
    emoji: '🦅',
    type: 'blending',
    description: 'Ascending fire vortex - mixed flames spiral upward in rebirth',
    duration: 4000,
    beats: 4,
    intensity: 1.7,
    category: 'radiating',
    temperature: 0.85,              // Hot ascending flames

    // 3D Element spawning - ascending spiral with mixed models
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'below',
            end: 'above',
            easing: 'easeOut',          // Fast rise, slow at top
            startScale: 1.0,            // Visible at birth
            endScale: 1.8,              // Large at peak
            startDiameter: 1.8,         // Wide enough to be outside mascot
            endDiameter: 2.8,           // Wide spread at top (funnel)
            orientation: 'rising'       // All face upward
        },
        formation: {
            type: 'spiral',
            count: 7,
            strands: 2,                 // Double helix
            spacing: 0.2,               // More spacing
            arcOffset: 51,              // ~51° between elements (360/7)
            phaseOffset: 0.1
        },
        count: 7,
        scale: 1.1,                     // Larger base scale
        // Ordered mix: wisps at bottom, tongues middle, bursts at top
        models: ['flame-wisp', 'ember-cluster', 'flame-tongue', 'flame-tongue',
            'flame-tongue', 'fire-burst', 'fire-burst'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0.08,              // Wave rising effect
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.35,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.5,         // Cool at bottom
                    peak: 0.95,         // Hot at middle (rebirth)
                    end: 0.7,           // Warm at top
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.3,
                rate: 12,
                pattern: 'smooth'
            },
            pulse: {
                amplitude: 0.15,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 4.0,
                frequency: 6,
                pattern: 'sine'
            },
            // Two-layer cutout: DISSOLVE + EMBERS for rebirth erosion
            cutout: {
                strength: 0.65,
                primary: { pattern: 7, scale: 1.5, weight: 1.0 },    // DISSOLVE - rebirth erosion
                secondary: { pattern: 5, scale: 2.0, weight: 0.5 },  // EMBERS - phoenix flames
                blend: 'add',
                travel: 'angular',
                travelSpeed: 2.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.1,
                    tip: 0.3
                }
            },
            // Grain: perlin for smooth ascending energy
            grain: {
                type: 0,              // PERLIN - smooth ascending energy
                strength: 0.1,
                scale: 0.25,
                speed: 1.5,
                blend: 'multiply'
            },
            // Per-gesture atmospheric particles: smoke from rising phoenix
            atmospherics: [{
                preset: 'smoke',
                targets: null,
                anchor: 'above',
                intensity: 0.3,
                sizeScale: 0.8,
                progressCurve: 'sustain',
            }],
            // All rotate together in spiral
            rotate: { axis: 'y', rotations: 1.5, phase: 0 },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 14,
            modelOverrides: {
                'flame-wisp': {
                    scaleMultiplier: 1.2,
                    orientationOverride: 'rising'
                },
                'ember-cluster': {
                    scaleMultiplier: 1.0,
                    orientationOverride: 'rising'
                },
                'flame-tongue': {
                    scaleMultiplier: 1.4,
                    orientationOverride: 'rising'
                },
                'fire-burst': {
                    scaleMultiplier: 1.3,
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Phoenix glow - golden-orange ascending
    flickerFrequency: 10,
    flickerAmplitude: 0.015,
    flickerDecay: 0.12,
    glowColor: [1.0, 0.6, 0.2],      // Golden-orange
    glowIntensityMin: 1.4,
    glowIntensityMax: 3.5,
    glowFlickerRate: 8,
    scaleVibration: 0.02,
    scaleFrequency: 3,
    scaleGrowth: 0.04,
    rotationEffect: true,
    rotationSpeed: 0.35
};

/**
 * Phoenix gesture - ascending fire vortex with mixed elements.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 8 mixed models in double-helix: wisps, embers, tongues, bursts, ring
 * - Ordered layering from bottom to top by element type
 * - Funnel shape: tight at bottom, wide at top
 * - Unified rotation creates ascending vortex effect
 */
export default buildFireEffectGesture(PHOENIX_CONFIG);
