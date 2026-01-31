/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Burn Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Burn gesture - flames flickering across surface
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/burn
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *        🔥  🔥
 *       🔥 ★ 🔥      ← Flames scattered across surface
 *        🔥  🔥        rising upward
 *
 * FEATURES:
 * - Flames scattered across mascot surface
 * - Chaotic flickering motion
 * - Multiple flame models for variety
 * - Mascot is VICTIM of fire (burning category)
 *
 * USED BY:
 * - Taking fire damage
 * - Being consumed by flames
 * - Heat distress effects
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Burn gesture configuration
 * Flames flickering across surface, being consumed
 */
const BURN_CONFIG = {
    name: 'burn',
    emoji: '🔥',
    type: 'blending',
    description: 'Flames flickering across surface, being consumed',
    duration: 2500,
    beats: 4,
    intensity: 1.0,
    category: 'burning',
    temperature: 0.6,              // Active flame temperature

    // 3D Element spawning - flames rising from surface
    spawnMode: {
        type: 'surface',
        pattern: 'scattered',       // Flames scattered across surface
        embedDepth: 0.15,
        cameraFacing: 0.3,
        clustering: 0.25,           // Some clustering for flame groups
        count: 8,
        scale: 1.0,
        models: ['flame-wisp', 'ember-cluster', 'flame-tongue'],
        minDistance: 0.12,          // Flames can be fairly close
        animation: {
            // Timing - staggered flame appearance
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.03,          // Staggered ignition
            // Enter - flames ignite with flash
            enter: {
                type: 'fade',       // Smooth fade in for procedural fire
                duration: 0.08,
                easing: 'easeOut'
            },
            // Exit - flames die down
            exit: {
                type: 'fade',
                duration: 0.15,
                easing: 'easeIn'
            },
            // Procedural shader config (universal for all procedural elements)
            procedural: {
                scaleSmoothing: 0.08,    // Smooth scale lerping to avoid jitter
                geometryStability: true  // Use fadeProgress for stable vertex displacement
            },
            // Parameter animation: animate shader uniforms over gesture lifetime
            parameterAnimation: {
                temperature: {
                    start: 0.4,         // Cool ignition
                    peak: 0.65,         // Hot active flames
                    end: 0.35,          // Dying embers
                    curve: 'bell'       // Gradual rise and fall
                }
            },
            // Hold - flickering fire animation
            flicker: {
                intensity: 0.35,    // Strong flicker
                rate: 12,           // Fast fire flicker
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.15,
                frequency: 8,       // Fast pulsing
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.8,
                max: 2.0,
                frequency: 10,
                pattern: 'sine'
            },
            drift: {
                direction: 'up',    // Flames rise
                distance: 0.1,      // Total drift over gesture lifetime (musical timing)
                noise: 0.02         // Subtle variation
            },
            // Variance - chaotic fire
            scaleVariance: 0.35,
            lifetimeVariance: 0.3,
            delayVariance: 0.1,
            // Rendering
            blending: 'additive',
            renderOrder: 10,
            // Intensity scaling
            intensityScaling: {
                scale: 1.3,
                pulseAmplitude: 1.5,
                flickerIntensity: 1.4,
                emissiveMax: 1.6
            },
            // Model-specific behavior overrides
            modelOverrides: {
                'ember-cluster': {
                    scaling: { mode: 'uniform-pulse', amplitude: 0.2, frequency: 4 },
                    drift: { direction: 'rising', speed: 0.025, noise: 0.25, buoyancy: true },
                    opacityLink: 'flicker'
                },
                'flame-wisp': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.7 },
                            y: { expand: true, rate: 1.6 },
                            z: { expand: false, rate: 0.7 }
                        }
                    },
                    drift: { direction: 'rising', speed: 0.03, noise: 0.15, buoyancy: true },
                    orientationOverride: 'rising'
                },
                'flame-tongue': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.8, oscillate: true },
                            y: { expand: true, rate: 1.4 },
                            z: { expand: false, rate: 0.8, oscillate: true }
                        },
                        wobbleFrequency: 5, wobbleAmplitude: 0.15
                    },
                    drift: { direction: 'rising', speed: 0.025, noise: 0.2 }
                }
            }
        }
    },

    // Flame flicker motion
    flickerFrequency: 12,          // Fast flickering
    flickerAmplitude: 0.015,       // Subtle position jitter
    flickerDecay: 0.2,
    // Glow - orange/red pulsing
    glowColor: [1.0, 0.5, 0.1],    // Orange
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 15,           // Fast erratic flicker
    // Scale - slight pulsing with flames
    scaleVibration: 0.02,
    scaleFrequency: 8,
    // Rise effect - flames rise
    riseAmount: 0.01
};

/**
 * Burn gesture - flames flickering across surface.
 *
 * Uses surface spawn mode with scattered pattern:
 * - Multiple flame models for visual variety
 * - Chaotic flickering and rising motion
 * - Mascot is the victim of fire
 */
export default buildFireEffectGesture(BURN_CONFIG);
