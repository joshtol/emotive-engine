/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Smolder Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Smolder gesture - low simmer, faint ember glow
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/smolder
 * @complexity ⭐ Basic
 *
 * VISUAL DIAGRAM:
 *         ✦
 *        ★         ← Sparse embers
 *         ✦          faint glow
 *
 * FEATURES:
 * - Very sparse ember placement
 * - Slow, subtle pulsing
 * - Deep red ember glow
 * - Mascot is SOURCE of fire (radiating category)
 *
 * USED BY:
 * - Dying fire effects
 * - Low heat/ember states
 * - Subtle warmth indication
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Smolder gesture configuration
 * Low simmer, faint ember glow
 */
const SMOLDER_CONFIG = {
    name: 'smolder',
    emoji: '🪨',
    type: 'blending',
    description: 'Low simmer, faint ember glow',
    duration: 4000,
    beats: 6,
    intensity: 0.4,
    category: 'radiating',
    temperature: 0.15,             // Embers

    // 3D Element spawning - sparse embers
    spawnMode: {
        type: 'surface',
        pattern: 'scattered',       // Sparse embers
        embedDepth: 0.2,
        cameraFacing: 0.25,
        clustering: 0.3,
        count: 4,
        scale: 0.8,
        models: ['ember-cluster'],
        minDistance: 0.2,           // Very sparse
        animation: {
            appearAt: 0.1,
            disappearAt: 0.85,
            stagger: 0.08,          // Slow stagger
            enter: {
                type: 'fade',
                duration: 0.25,     // Slow fade in for embers
                easing: 'easeOutQuad'
            },
            exit: {
                type: 'fade',
                duration: 0.3,      // Slow fade out
                easing: 'easeInQuad'
            },
            // Procedural shader config
            procedural: {
                scaleSmoothing: 0.12,   // Very smooth for slow embers
                geometryStability: true
            },
            // Temperature: subtle ember glow
            parameterAnimation: {
                temperature: {
                    start: 0.1,         // Cool embers
                    peak: 0.2,          // Gentle warmth
                    end: 0.08,          // Dying down
                    curve: 'pulse'      // Subtle breathing
                }
            },
            // Subtle smoldering - very slow
            pulse: {
                amplitude: 0.08,
                frequency: 0.5,     // Very slow pulse
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.3,
                max: 0.8,           // Subtle ember glow
                frequency: 0.7,
                pattern: 'sine'
            },
            // Minimal drift
            drift: {
                direction: 'up',
                distance: 0.02,     // Barely perceptible rise over gesture
                noise: 0.002
            },
            scaleVariance: 0.15,
            lifetimeVariance: 0.2,
            blending: 'additive',
            renderOrder: 5,
            intensityScaling: {
                scale: 1.1,
                emissiveMax: 1.4
            },
            // Model-specific behavior overrides
            modelOverrides: {
                'ember-cluster': {
                    scaling: { mode: 'uniform-pulse', amplitude: 0.08, frequency: 0.5 },
                    drift: { direction: 'rising', speed: 0.008, noise: 0.05, buoyancy: true },
                    opacityLink: 'dissipate'
                }
            }
        }
    },

    // Very subtle flicker
    flickerFrequency: 0,
    flickerAmplitude: 0,
    flickerDecay: 0.4,
    // Glow - deep red, subtle
    glowColor: [0.9, 0.3, 0.1],    // Deep red
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.2,
    glowFlickerRate: 2,            // Very slow
    // Scale - minimal
    scaleVibration: 0.005,
    scaleFrequency: 1,
    scalePulse: true,
    // Smoke hint
    smokeHint: true
};

/**
 * Smolder gesture - low simmer, faint ember glow.
 *
 * Uses surface spawn mode with scattered pattern:
 * - Very sparse ember placement
 * - Slow, subtle breathing pulse
 * - Deep red glow for dying fire effect
 */
export default buildFireEffectGesture(SMOLDER_CONFIG);
