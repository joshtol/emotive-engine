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
 * - Drift upward from surface placement
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
    temperature: 0.6,

    // 3D Element spawning - flames on surface that rise
    spawnMode: {
        type: 'surface',
        pattern: 'scattered', // Flames scattered across surface
        embedDepth: 0.15,
        cameraFacing: 0.3,
        clustering: 0.25, // Some clustering for flame groups
        count: 8,
        scale: 1.25,
        models: ['flame-wisp', 'flame-tongue'],
        minDistance: 0.12,
        animation: {
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.03,
            enter: {
                type: 'fade',
                duration: 0.08,
                easing: 'easeOut',
            },
            exit: {
                type: 'burst-fade',
                duration: 0.15,
                easing: 'easeIn',
                burstScale: 1.15,
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true,
            },
            // Gesture glow: ramps embers/edge glow from subtle to intense
            gestureGlow: {
                baseGlow: 0.8, // Start slightly dimmed
                peakGlow: 2.5, // Peak intensity at end
                curve: 'easeIn', // Slow build, dramatic peak
            },
            parameterAnimation: {
                temperature: {
                    start: 0.4,
                    peak: 0.65,
                    end: 0.35,
                    curve: 'bell',
                },
            },
            flicker: {
                intensity: 0.35,
                rate: 12,
                pattern: 'random',
            },
            pulse: {
                amplitude: 0.15,
                frequency: 8,
                easing: 'easeInOut',
            },
            emissive: {
                min: 0.8,
                max: 2.0,
                frequency: 10,
                pattern: 'sine',
            },
            // Two-layer cutout: EMBERS + WAVES for organic burning with flow
            cutout: {
                strength: 0.7,
                primary: { pattern: 5, scale: 2.0, weight: 1.0 }, // EMBERS - burning holes
                secondary: { pattern: 4, scale: 1.5, weight: 0.5 }, // WAVES - flowing interference
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 2.5,
                strengthCurve: 'fadeIn', // Cutouts gradually appear
                fadeInDuration: 0.4, // Takes 40% of gesture to fully appear
                // Trail dissolve: fade bottom of rising flames
                trailDissolve: {
                    offset: -0.15,
                    softness: 0.3,
                },
                // Geometric mask: focus cutouts at flame tips
                geometricMask: {
                    type: 'distance',
                    core: 0.08,
                    tip: 0.18,
                },
            },
            // Grain: subtle film grain for organic texture
            grain: {
                type: 3, // FILM - cinematic grain
                strength: 0.04, // Very subtle
                scale: 0.1,
                speed: 0.5,
                blend: 'multiply',
            },
            // Per-gesture atmospheric particles: smoke from burning surface
            atmospherics: [
                {
                    preset: 'smoke',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.3,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                },
            ],
            // Key feature: flames rise from where they spawn on surface
            drift: {
                direction: 'up',
                distance: 0.12,
                noise: 0.025,
            },
            scaleVariance: 0.35,
            lifetimeVariance: 0.3,
            delayVariance: 0.1,
            blending: 'additive',
            renderOrder: 10,
            intensityScaling: {
                scale: 1.3,
                pulseAmplitude: 1.5,
                flickerIntensity: 1.4,
                emissiveMax: 1.6,
            },
            modelOverrides: {
                'ember-cluster': {
                    scaling: { mode: 'uniform-pulse', amplitude: 0.2, frequency: 4 },
                    drift: { direction: 'rising', speed: 0.025, noise: 0.25, buoyancy: true },
                    opacityLink: 'flicker',
                },
                'flame-wisp': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.7 },
                            y: { expand: true, rate: 1.6 },
                            z: { expand: false, rate: 0.7 },
                        },
                    },
                    drift: { direction: 'rising', speed: 0.03, noise: 0.15, buoyancy: true },
                    orientationOverride: 'rising',
                },
                'flame-tongue': {
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: false, rate: 0.8, oscillate: true },
                            y: { expand: true, rate: 1.4 },
                            z: { expand: false, rate: 0.8, oscillate: true },
                        },
                        wobbleFrequency: 5,
                        wobbleAmplitude: 0.15,
                    },
                    drift: { direction: 'rising', speed: 0.025, noise: 0.2 },
                },
            },
        },
    },

    // Flame flicker motion
    flickerFrequency: 12,
    flickerAmplitude: 0.015,
    flickerDecay: 0.2,
    // Glow - orange/red pulsing
    glowColor: [1.0, 0.5, 0.1],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 15,
    // Scale - slight pulsing with flames
    scaleVibration: 0.02,
    scaleFrequency: 8,
    // Rise effect
    riseAmount: 0.01,
};

/**
 * Burn gesture - flames flickering across surface.
 *
 * Uses surface spawn mode with scattered pattern:
 * - Flames placed on mascot surface
 * - Drift upward from spawn points
 * - Chaotic flickering and rising motion
 */
export default buildFireEffectGesture(BURN_CONFIG);
