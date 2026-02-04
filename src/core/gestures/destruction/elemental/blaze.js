/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Blaze Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Blaze gesture - powerful fire aura, controlled intensity
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/blaze
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *       🔆🔆🔆
 *      🔆  ★  🔆      ← Powerful fire aura
 *       🔆🔆🔆         controlled intensity
 *
 * FEATURES:
 * - Full coverage fire aura (shell pattern)
 * - Powerful but controlled flames
 * - Bright orange sustained glow
 * - Mascot is SOURCE of fire (radiating category)
 *
 * USED BY:
 * - Power-up fire aura
 * - Torch-like flame effects
 * - Intense controlled burning
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Blaze gesture configuration
 * Powerful fire aura, controlled intensity
 */
const BLAZE_CONFIG = {
    name: 'blaze',
    emoji: '🔆',
    type: 'blending',
    description: 'Powerful fire aura, controlled intensity',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    category: 'radiating',
    temperature: 0.7,              // Hot flame

    // 3D Element spawning - powerful flame aura on surface
    spawnMode: {
        type: 'surface',
        pattern: 'shell',           // Full coverage aura
        embedDepth: 0.1,
        cameraFacing: 0.35,
        clustering: 0.1,
        count: 10,
        scale: 1.1,
        models: ['flame-tongue', 'flame-wisp'],
        minDistance: 0.1,           // Dense aura
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.08,
                easing: 'easeOutBack'
            },
            exit: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.55,
                    peak: 0.75,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.15,
                frequency: 2,
                easing: 'easeInOut',
                sync: 'global'
            },
            flicker: {
                intensity: 0.15,
                rate: 6,
                pattern: 'sine'
            },
            emissive: {
                min: 1.0,
                max: 2.2,
                frequency: 2,
                pattern: 'sine'
            },
            drift: {
                direction: 'up',
                distance: 0.08,
                noise: 0.01
            },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 10,
            intensityScaling: {
                scale: 1.35,
                emissiveMax: 1.5,
                pulseAmplitude: 1.3
            },
            modelOverrides: {
                'flame-tongue': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.2, oscillate: true },
                            y: { expand: true, rate: 1.8 },
                            z: { expand: true, rate: 1.2, oscillate: true }
                        },
                        wobbleFrequency: 2, wobbleAmplitude: 0.1
                    },
                    drift: { direction: 'rising', speed: 0.03, buoyancy: true }
                },
                'flame-wisp': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.7 },
                            y: { expand: true, rate: 2.0 },
                            z: { expand: false, rate: 0.7 }
                        }
                    },
                    drift: { direction: 'rising', speed: 0.035, buoyancy: true }
                }
            }
        }
    },

    // Controlled flicker
    flickerFrequency: 0,
    flickerAmplitude: 0,
    flickerDecay: 0.2,
    // Glow - strong sustained
    glowColor: [1.0, 0.6, 0.15],
    glowIntensityMin: 1.5,
    glowIntensityMax: 2.8,
    glowFlickerRate: 6,
    // Scale - power breathing
    scaleVibration: 0.025,
    scaleFrequency: 2,
    scalePulse: true,
    scaleGrowth: 0.04,
    // Slight rise
    hover: true,
    hoverAmount: 0.008
};

/**
 * Blaze gesture - powerful fire aura, controlled intensity.
 *
 * Uses surface spawn mode with shell pattern:
 * - Dense fire aura coverage on mascot
 * - Powerful but controlled flame behavior
 * - Mascot is the source of intense fire
 */
export default buildFireEffectGesture(BLAZE_CONFIG);
