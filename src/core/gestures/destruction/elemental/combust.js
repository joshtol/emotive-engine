/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Combust Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Combust gesture - building heat then sudden flame burst
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/combust
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *      ╔════════╗
 *     ╱ 💥💥💥 ╲      ← Explosive flame burst
 *    │  💥 ★ 💥 │       from buildup pressure
 *     ╲ 💥💥💥 ╱
 *      ╚════════╝
 *
 * FEATURES:
 * - Two-phase: 60% buildup, 40% burst
 * - Explosive outward flame motion
 * - Very high temperature at burst moment
 * - Mascot is VICTIM of fire (burning category)
 *
 * USED BY:
 * - Spontaneous combustion effects
 * - Explosion/detonation reactions
 * - Critical fire damage moments
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Combust gesture configuration
 * Building heat then sudden flame burst
 */
const COMBUST_CONFIG = {
    name: 'combust',
    emoji: '💥',
    type: 'blending',
    description: 'Building heat then sudden flame burst',
    duration: 2000,
    beats: 4,
    intensity: 1.5,
    category: 'burning',
    temperature: 0.9,              // Very hot at burst

    // 3D Element spawning - explosive flame burst
    spawnMode: {
        type: 'surface',
        pattern: 'spikes',          // Flames burst outward
        embedDepth: 0.1,
        cameraFacing: 0.35,
        clustering: 0.3,
        count: 12,
        scale: 1.2,
        models: ['fire-burst', 'flame-tongue', 'ember-cluster'],
        minDistance: 0.08,          // Dense explosion
        animation: {
            appearAt: 0.55,         // Appears at burst moment
            disappearAt: 0.95,
            stagger: 0.01,          // Rapid sequential burst
            enter: {
                type: 'fade',       // Quick fade for procedural fire
                duration: 0.03,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeInCubic'
            },
            // Procedural shader config
            procedural: {
                scaleSmoothing: 0.06,   // Slightly faster for explosive effect
                geometryStability: true
            },
            // Temperature: spike at burst
            parameterAnimation: {
                temperature: {
                    start: 0.5,         // Building heat
                    peak: 0.95,         // Explosive plasma burst
                    end: 0.6,           // Hot aftermath
                    curve: 'spike'      // Slow rise then explosive peak
                }
            },
            flicker: {
                intensity: 0.5,     // Very chaotic at burst
                rate: 25,           // Extremely fast
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.25,
                frequency: 15,
                easing: 'easeOut'
            },
            emissive: {
                min: 1.5,
                max: 4.0,           // Extremely bright burst
                frequency: 20,
                pattern: 'sine'
            },
            drift: {
                direction: 'outward', // Explodes outward
                distance: 0.15,       // Total expansion over gesture lifetime
                noise: 0.02
            },
            scaleVariance: 0.4,
            lifetimeVariance: 0.25,
            delayVariance: 0.05,
            blending: 'additive',
            renderOrder: 15,
            intensityScaling: {
                scale: 1.5,
                emissiveMax: 2.0,
                flickerIntensity: 1.6,
                driftSpeed: 1.4
            },
            // Model-specific behavior overrides
            modelOverrides: {
                'fire-burst': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.8 },
                            y: { expand: true, rate: 2.0 },
                            z: { expand: true, rate: 1.8 }
                        }
                    },
                    drift: { direction: 'outward', speed: 0.06, noise: 0.15 },
                    opacityLink: 'inverse-scale'
                },
                'flame-tongue': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.4, oscillate: true },
                            y: { expand: true, rate: 1.6 },
                            z: { expand: true, rate: 1.4, oscillate: true }
                        },
                        wobbleFrequency: 8, wobbleAmplitude: 0.2
                    },
                    drift: { direction: 'outward', speed: 0.04, noise: 0.1 }
                },
                'ember-cluster': {
                    drift: { direction: 'outward', speed: 0.05, noise: 0.3 },
                    opacityLink: 'flicker'
                }
            }
        }
    },

    // Buildup then burst
    buildupPhase: 0.6,             // 60% buildup
    burstPhase: 0.4,               // 40% burst
    // Minimal flicker during buildup
    flickerFrequency: 20,
    flickerAmplitude: 0.025,       // Stronger at burst
    flickerDecay: 0.15,
    // Glow - ramps up dramatically
    glowColor: [1.0, 0.6, 0.2],    // Orange-yellow
    glowIntensityMin: 0.8,
    glowIntensityMax: 4.0,         // Bright burst
    glowFlickerRate: 25,
    // Scale - compress then burst
    scaleVibration: 0.03,
    scaleFrequency: 15,
    scaleBurst: 0.08,              // Expands 8% at burst
    // Position burst
    burstJitter: 0.03              // Violent shake at burst
};

/**
 * Combust gesture - building heat then sudden flame burst.
 *
 * Uses surface spawn mode with spikes pattern:
 * - Two-phase effect: buildup then explosive burst
 * - Flames explode outward at burst moment
 * - Very high temperature and brightness at peak
 */
export default buildFireEffectGesture(COMBUST_CONFIG);
