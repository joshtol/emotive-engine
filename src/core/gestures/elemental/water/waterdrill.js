/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterdrill Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterdrill gesture - fast tight descending water helix
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterdrill
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *       ●              TOP (wide)
 *        ●
 *         ●           ← Fast tight spiral
 *          ●            drilling downward
 *           ●
 *            ●        BOTTOM (narrow)
 *
 * FEATURES:
 * - 6 splash elements in tight spiral formation
 * - Fast descending helix (like a drill bit)
 * - SPIRAL + STREAKS cutout for drilling motion
 * - High rotation speed for drilling effect
 * - Energetic intense water
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Piercing water effects
 * - Drill/bore attacks
 * - Intense energy buildups
 * - Breaking through obstacles
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterdrill gesture configuration
 * Fast tight descending helix - drilling water spiral
 */
const WATERDRILL_CONFIG = {
    name: 'waterdrill',
    emoji: '🔩',
    type: 'blending',
    description: 'Fast tight descending water helix',
    duration: 1200, // Quick intense burst
    beats: 2,
    intensity: 1.5, // High intensity
    category: 'transform',
    turbulence: 0.6,

    // 3D Element spawning - tight spiral helix
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'feet',
            end: 'below',
            easing: 'easeIn', // Accelerating downward
            startScale: 1.0,
            endScale: 0.8,
            startDiameter: 1.8, // Wide at top
            endDiameter: 1.4, // Narrower at drill point
            orientation: 'vertical',
        },
        formation: {
            type: 'spiral',
            count: 6,
            spacing: 0.1, // Tight spacing
            arcOffset: 60, // 60° between each (6 * 60 = 360)
            phaseOffset: 0,
        },
        count: 6,
        scale: 0.8,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.03, // Fast sequential spawn
            enter: {
                type: 'fade',
                duration: 0.05,
                easing: 'linear',
            },
            exit: {
                type: 'fade',
                duration: 0.4,
                easing: 'easeIn',
            },
            procedural: {
                scaleSmoothing: 0.05,
                geometryStability: true,
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.3,
                    peak: 0.7,
                    end: 0.5,
                    curve: 'bell',
                },
            },
            // SPIRAL cutout for drilling effect
            cutout: {
                strength: 0.55,
                primary: { pattern: 6, scale: 1.5, weight: 1.0 }, // SPIRAL - drilling motion
                secondary: { pattern: 1, scale: 0.8, weight: 0.35 }, // STREAKS - speed lines
                blend: 'add',
                travel: 'vertical',
                travelSpeed: 3.0, // Fast drilling travel
                strengthCurve: 'constant',
            },
            // Grain: intense film grain for drilling spray
            grain: {
                type: 3, // FILM
                strength: 0.3, // Stronger for intense effect
                scale: 0.2,
                speed: 4.0, // Fast for drilling energy
                blend: 'multiply',
            },
            pulse: {
                amplitude: 0.08,
                frequency: 10, // Fast pulse
                easing: 'linear',
            },
            // Fast unified rotation for drill effect
            rotate: { axis: 'y', rotations: 4, phase: 0 }, // 4 full rotations
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 16,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5, // Narrow arcs for drill bits
                        arcSpeed: 3.0, // Fast internal animation
                        arcCount: 1,
                    },
                    orientationOverride: 'vertical',
                },
            },
            // Sustained spray thrown off drilling rotation
            atmospherics: [
                {
                    preset: 'spray',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.25,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.5,
                    centrifugal: { speed: 1.0, tangentialBias: 0.3 },
                },
            ],
        },
    },

    // Wobble - minimal for focused drill
    wobbleFrequency: 8,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.15,
    // Scale - tight control
    scaleWobble: 0.02,
    scaleFrequency: 8,
    scaleGrowth: 0.03,
    // Glow - intense blue
    glowColor: [0.2, 0.5, 1.0],
    glowIntensityMin: 1.3,
    glowIntensityMax: 2.8,
    glowPulseRate: 10,
    // Drill-specific
    rotationFlow: 0.05,
};

/**
 * Waterdrill gesture - fast tight descending helix.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 6 splash elements in tight 60° spiral
 * - Fast travel from feet to below
 * - High rotation speed (4 full rotations)
 * - Drilling/piercing water effect
 */
export default buildWaterEffectGesture(WATERDRILL_CONFIG);
