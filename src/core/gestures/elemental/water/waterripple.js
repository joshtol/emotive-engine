/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterripple Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterripple gesture - concentric expanding rings
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterripple
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ╭─────────────╮
 *       (  ╭───────╮   )    ← Concentric rings expanding outward
 *      (  ( ★ )    )   )
 *       (  ╰───────╯   )
 *        ╰─────────────╯
 *
 * FEATURES:
 * - axis-travel with horizontal orientation
 * - Concentric ring formation expanding outward
 * - Non-uniform scaling (X/Z expand, Y stays flat)
 * - Staggered wave appearance for ripple effect
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water surface effects
 * - Impact ripple visuals
 * - Pulse wave reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterripple gesture configuration
 * Concentric expanding rings
 */
const WATERRIPPLE_CONFIG = {
    name: 'ripple',
    emoji: '🔵',
    type: 'blending',
    description: 'Concentric rings emanating outward from center',
    duration: 2000,
    beats: 3,
    intensity: 0.7,
    category: 'ambient',
    turbulence: 0.35,

    // 3D Element spawning - concentric expanding rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            startDiameter: 0.3,
            endDiameter: 3.0,
            orientation: 'horizontal',
        },
        formation: {
            type: 'ring',
            count: 4,
            spacing: 0,
            phaseOffset: 0.18,
        },
        count: 4,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.92,
            stagger: 0.15,
            enter: {
                type: 'grow',
                duration: 0.08,
                easing: 'easeOut',
            },
            exit: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeIn',
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true,
            },
            parameterAnimation: {
                waveHeight: {
                    start: 0.3,
                    peak: 1.0,
                    end: 0.1,
                    curve: 'bell',
                },
            },
            // Two-layer cutout: RIPPLES + CELLULAR for concentric water texture
            cutout: {
                strength: 0.5,
                primary: { pattern: 1, scale: 1.5, weight: 1.0 }, // RIPPLES - concentric rings
                secondary: { pattern: 0, scale: 0.8, weight: 0.4 }, // CELLULAR - organic breaks
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 1.5,
                strengthCurve: 'fadeOut',
            },
            // Grain: film grain for water surface texture
            grain: {
                type: 3, // FILM
                strength: 0.2,
                scale: 0.3,
                speed: 1.0,
                blend: 'multiply',
            },
            pulse: {
                amplitude: 0.12,
                frequency: 3,
                easing: 'easeInOut',
                sync: 'staggered',
            },
            blending: 'normal',
            renderOrder: 5,
            modelOverrides: {
                'splash-ring': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 2.0 },
                            y: { expand: false, rate: 0.2 },
                            z: { expand: true, rate: 2.0 },
                        },
                    },
                    opacityLink: 'inverse-scale',
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 0.8,
                        arcCount: 3,
                    },
                },
            },
            // No atmospherics — gentle ripples, no violent water motion
        },
    },

    // Ripple motion - pulsing outward
    wobbleFrequency: 2,
    wobbleAmplitude: 0.008,
    wobbleDecay: 0.1, // Minimal decay - continuous
    // Scale - subtle expansion
    scaleWobble: 0.02,
    scaleFrequency: 2,
    // Glow - soft water sheen
    glowColor: [0.3, 0.55, 0.85],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.2,
    glowPulseRate: 2,
    // Ripple-specific
    concentricPulse: true,
    pulseCount: 3, // Multiple wave peaks
};

/**
 * Waterripple gesture - concentric expanding rings.
 *
 * Uses axis-travel spawn mode:
 * - Horizontal orientation (rings lie flat)
 * - Expanding diameter from center outward
 * - Staggered appearance for wave effect
 */
export default buildWaterEffectGesture(WATERRIPPLE_CONFIG);
