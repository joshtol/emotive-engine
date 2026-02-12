/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watercrush Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watercrush gesture - heavy wave crushing down on mascot
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watercrush
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *
 *    ╰═══════════════════╯       ← Splash-rings start large
 *     ╰═════════════════╯
 *      ╰═══════════════╯         ← Contracting inward from all sides
 *            ★                   ← Mascot crushed at center
 *         💧💧💧💧💧              ← Bubble spray at base
 *
 * FEATURES:
 * - Stack of 3 splash-rings contracting inward
 * - Water walls closing in from all sides - crushing pressure
 * - Bubble-cluster spray at impact base
 * - Heavy mascot wobble and scale contraction
 * - AFFLICTED: mascot is being crushed by water weight
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Crushing wave attacks
 * - Being overwhelmed by water
 * - Heavy water pressure effects
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watercrush gesture configuration
 * Heavy wave descending and crushing mascot
 */
const WATERCRUSH_CONFIG = {
    name: 'watercrush',
    emoji: '🌊',
    type: 'blending',
    description: 'Walls of water crushing inward on mascot',
    duration: 1200,
    beats: 2,
    intensity: 1.4,
    category: 'impact',
    turbulence: 0.7,

    // 3D Element spawning - contracting water walls
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Stack of splash-rings contracting inward - crushing water walls
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'center',
                easing: 'linear',
                startScale: 2.2,                 // Start huge
                endScale: 0.3,                   // Crush to nothing
                startDiameter: 2.5,
                endDiameter: 0.5,
                orientation: 'camera'
            },
            formation: { type: 'stack', count: 3, spacing: 0.35 },
            count: 3,
            scale: 1.4,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.75,
                stagger: 0.06,
                enter: { type: 'fade', duration: 0.06, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.1, easing: 'easeIn', burstScale: 0.3 },
                procedural: { scaleSmoothing: 0.04, geometryStability: true },
                parameterAnimation: {
                    turbulence: {
                        start: 0.3,
                        peak: 0.8,
                        end: 0.9,
                        curve: 'fadeIn'
                    }
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 1.3, weight: 1.0 },    // CELLULAR - heavy water mass
                    secondary: { pattern: 3, scale: 0.6, weight: 0.6 },  // VORONOI - chunky pressure
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.5,
                    strengthCurve: 'fadeIn',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.3,
                        softness: 1.4
                    }
                },
                grain: { type: 3, strength: 0.2, scale: 0.25, speed: 2.0, blend: 'multiply' },
                pulse: { amplitude: 0.08, frequency: 4, easing: 'easeInOut' },
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0.4, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Bubble spray at impact - water splashing out on crush
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 6,
                radius: 0.05,
                endRadius: 0.5,
                angleSpread: 360,
                startAngle: 0,
                orientation: 'camera',
                startScale: 0.15,
                endScale: 0.7,
                scaleEasing: 'easeOutQuad'
            },
            count: 6, scale: 0.5, models: ['bubble-cluster'],
            animation: {
                appearAt: 0.35, disappearAt: 0.75, stagger: 0.01,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: { strength: 0.4, primary: { pattern: 0, scale: 0.8, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 1.0, strengthCurve: 'fadeOut' },
                scaleVariance: 0.3, lifetimeVariance: 0.15,
                blending: 'additive', renderOrder: 12,
                modelOverrides: { 'bubble-cluster': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        }
    ],

    // Wobble - heavy crushing impact
    wobbleFrequency: 4,
    wobbleAmplitude: 0.025,
    wobbleDecay: 0.3,
    // Scale - contraction from crush
    scaleWobble: 0.03,
    scaleFrequency: 3,
    scaleContract: 0.06,
    // Glow - deep blue pressure
    glowColor: [0.1, 0.35, 0.9],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowPulseRate: 4,
    // Tremor - impact shake
    tremor: 0.015,
    tremorFrequency: 8
};

/**
 * Watercrush gesture - water walls crushing inward.
 *
 * Two-layer design:
 * - Layer 1: Stack of 3 splash-rings contracting from large → small (crushing walls)
 * - Layer 2: Bubble spray at base (appears mid-gesture on impact)
 * - AFFLICTED: mascot is being crushed by water pressure
 */
export default buildWaterEffectGesture(WATERCRUSH_CONFIG);
