/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Radiate Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Radiate gesture - emitting heat waves, warm ambient glow
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/radiate
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *         ☀️
 *        ╱ ╲
 *      ✧  ★  ✧      ← Gentle scattered embers
 *        ╲ ╱          warm ambient glow
 *         ✧
 *
 * FEATURES:
 * - Gentle ambient heat emanation
 * - Smooth breathing pulse (not chaotic)
 * - Warm orange glow
 * - Mascot is SOURCE of fire (radiating category)
 *
 * USED BY:
 * - Warmth/comfort effects
 * - Ambient fire aura
 * - Heat wave emanation
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Radiate gesture configuration
 * Emitting heat waves, warm ambient glow
 */
const RADIATE_CONFIG = {
    name: 'radiate',
    emoji: '☀️',
    type: 'blending',
    description: 'Emitting heat waves, warm ambient glow',
    duration: 3000,
    beats: 4,
    intensity: 0.8,
    category: 'radiating',
    temperature: 0.4,              // Warm, not hot

    // 3D Element spawning - gentle ambient embers
    spawnMode: {
        type: 'surface',
        pattern: 'scattered',       // Gentle scattered embers
        embedDepth: 0.15,
        cameraFacing: 0.3,
        clustering: 0.2,
        count: 5,
        scale: 0.9,
        models: ['ember-cluster', 'flame-wisp'],
        minDistance: 0.18,          // Spread out for ambient feel
        animation: {
            appearAt: 0.1,
            disappearAt: 0.9,
            stagger: 0.05,
            enter: {
                type: 'fade',       // Gentle fade in
                duration: 0.12,
                easing: 'easeOutQuad'
            },
            exit: {
                type: 'fade',
                duration: 0.15,
                easing: 'easeInQuad'
            },
            // Procedural shader config
            procedural: {
                scaleSmoothing: 0.1,    // Very smooth for gentle radiating
                geometryStability: true
            },
            // Temperature: gentle warmth pulse
            parameterAnimation: {
                temperature: {
                    start: 0.3,         // Warm start
                    peak: 0.45,         // Gentle peak
                    end: 0.3,           // Return to warmth
                    curve: 'pulse'      // Smooth sine wave
                }
            },
            // Controlled emanation - smooth breathing
            pulse: {
                amplitude: 0.12,
                frequency: 1.5,     // Slow breathing
                easing: 'easeInOut',
                sync: 'global'      // All elements pulse together
            },
            emissive: {
                min: 0.6,
                max: 1.2,
                frequency: 1.5,
                pattern: 'sine'
            },
            drift: {
                direction: 'outward',
                distance: 0.05,     // Subtle outward drift over gesture
                noise: 0.005
            },
            rotate: {
                axis: 'y',
                speed: 0.02,
                oscillate: true,
                range: Math.PI / 6
            },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 8,
            intensityScaling: {
                scale: 1.2,
                emissiveMax: 1.3,
                pulseAmplitude: 1.2
            },
            // Model-specific behavior overrides
            modelOverrides: {
                'ember-cluster': {
                    scaling: { mode: 'uniform-pulse', amplitude: 0.15, frequency: 1.5 },
                    drift: { direction: 'rising', speed: 0.015, noise: 0.1, buoyancy: true }
                },
                'flame-wisp': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.8 },
                            y: { expand: true, rate: 1.2 },
                            z: { expand: false, rate: 0.8 }
                        }
                    },
                    drift: { direction: 'rising', speed: 0.01, buoyancy: true }
                }
            }
        }
    },

    // No jitter - controlled emission
    flickerFrequency: 0,
    flickerAmplitude: 0,
    flickerDecay: 0.3,
    // Glow - gentle warm pulsing
    glowColor: [1.0, 0.7, 0.3],    // Warm orange
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.6,
    glowFlickerRate: 3,            // Slow breathing pulse
    // Scale - gentle breathing
    scaleVibration: 0.015,
    scaleFrequency: 1.5,
    scalePulse: true,              // Smooth sine pulse
    // Heat wave effect
    heatWaves: true,
    waveFrequency: 2
};

/**
 * Radiate gesture - emitting heat waves, warm ambient glow.
 *
 * Uses surface spawn mode with scattered pattern:
 * - Gentle ambient embers with smooth breathing pulse
 * - Mascot is the source of warmth
 * - Controlled, calm fire emanation
 */
export default buildFireEffectGesture(RADIATE_CONFIG);
