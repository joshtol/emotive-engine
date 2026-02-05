/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterflow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterflow gesture - double helix water streams rising
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterflow
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *           💧    💧
 *          ↗    ↖
 *       💧   ↗↖   💧       ← Double helix rising
 *          ↗    ↖
 *           ★              ← Mascot as source
 *          /|\
 *
 * FEATURES:
 * - axis-travel from bottom to top
 * - Double helix spiral formation (2 strands)
 * - Expanding diameter as streams rise
 * - Continuous flowing motion
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water current effects
 * - Flowing stream visuals
 * - Fluid emanation reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterflow gesture configuration
 * Double helix water streams rising
 */
const WATERFLOW_CONFIG = {
    name: 'flow',
    emoji: '〰️',
    type: 'blending',
    description: 'Current - double helix water streams rising',
    duration: 3000,
    beats: 4,
    intensity: 0.8,
    category: 'ambient',
    turbulence: 0.3,

    // 3D Element spawning - double helix formation
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'linear',
            startDiameter: 1.0,
            endDiameter: 1.3,
            startScale: 0.8,
            endScale: 1.0
        },
        formation: {
            type: 'spiral',
            count: 6,
            strands: 2,
            arcOffset: 60,
            phaseOffset: 0.05
        },
        count: 6,
        models: ['wave-curl', 'droplet-small', 'wave-curl', 'droplet-small', 'wave-curl', 'droplet-small'],
        animation: {
            appearAt: 0.08,
            disappearAt: 0.88,
            stagger: 0.03,
            enter: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.12,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.2,
                    peak: 0.3,
                    end: 0.2,
                    curve: 'sustained'
                }
            },
            pulse: {
                amplitude: 0.1,
                frequency: 1.5,
                easing: 'easeInOut',
                sync: 'global'
            },
            blending: 'normal',
            renderOrder: 6
        }
    },

    // Flow motion - smooth S-curve
    flowFrequency: 0.8,          // Slow wave
    flowAmplitude: 0.02,         // Gentle side-to-side
    flowPhaseOffset: 0.5,        // Creates S-curve with Y offset
    // Scale - gentle breathing
    scaleWobble: 0.015,
    scaleFrequency: 1.5,
    // Glow - cool water sheen
    glowColor: [0.25, 0.55, 0.9],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.3,
    glowPulseRate: 1.5,
    // Flow-specific
    rotationFlow: 0.01,          // Slight rotation drift
    continuous: true
};

/**
 * Waterflow gesture - double helix water streams rising.
 *
 * Uses axis-travel spawn mode:
 * - Double helix spiral formation (2 strands)
 * - Rising from bottom to top
 * - Expanding diameter as it rises
 */
export default buildWaterEffectGesture(WATERFLOW_CONFIG);
