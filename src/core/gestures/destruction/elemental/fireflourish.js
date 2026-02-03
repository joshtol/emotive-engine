/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fireflourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fireflourish gesture - spinning sword flourish with fire trail
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireflourish
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM (front view):
 *
 *           ╱ 3
 *        2 ╱
 *      ───★───        ← Arcs appear sequentially around
 *          ╲ 1          the circle, tracing spinning blade
 *           ╲ 0
 *
 * FEATURES:
 * - 6 camera-facing arcs in spinning flourish
 * - Heavy stagger + rotation phases trace circular sword path
 * - Partial arcs (not full rings) for blade-like appearance
 * - Fast rotation creates spinning flourish motion
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Theatrical fire displays
 * - Martial arts flame effects
 * - Sword flourish trails
 * - Combat celebration
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Fireflourish gesture configuration
 * Spinning sword flourish - arcs trace circular blade path
 */
const FIREFLOURISH_CONFIG = {
    name: 'fireflourish',
    emoji: '⚔️',
    type: 'blending',
    description: 'Spinning sword flourish with fire trail',
    duration: 2400,             // Extended for dramatic flourish with trail
    beats: 4,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.65,          // Hot orange-white

    // 3D Element spawning - spinning flourish at center
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',              // Stay at center (no travel)
            easing: 'linear',
            startScale: 0.7,            // First element smaller
            endScale: 1.3,              // Last element larger (stronger cascade)
            startDiameter: 1.5,
            endDiameter: 2.2,           // More diameter growth for trail spread
            orientation: 'camera'       // Face camera
        },
        formation: {
            type: 'spiral',
            count: 5,
            spacing: 0,                 // All at same position (stagger handles timing)
            arcOffset: 72,              // 72° angular offset between elements (360/5)
            phaseOffset: 0.05,
            zOffset: 0.02               // Slight Z-depth offset for parallax
        },
        count: 5,
        scale: 0.95,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.45,          // Earlier fade for longer trail
            stagger: 0.12,              // 12% stagger - denser trail with 5 elements
            enter: {
                type: 'fade',
                duration: 0.03,         // Very fast fade in
                easing: 'easeOut'
            },
            exit: {
                type: 'burst-fade',     // Pop up then shrink + fade for dramatic trail
                duration: 0.85,         // Long lingering trail
                easing: 'easeIn',
                burstScale: 1.15        // Brief scale-up before fade
            },
            procedural: {
                scaleSmoothing: 0.05,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.65,
                    peak: 0.95,
                    end: 0.3,           // Drops faster - cooler trailing edges
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.2,
                rate: 10,
                pattern: 'sine'
            },
            pulse: {
                amplitude: 0.15,        // Stronger scale breathing
                frequency: 5,           // Faster pulse for dynamic feel
                easing: 'easeInOut',
                perElement: true        // Each element pulses independently
            },
            emissive: {
                min: 2.0,
                max: 5.0,
                frequency: 6,
                pattern: 'sine',
                decayOnExit: true,      // Dims during exit
                perElementScale: [1.0, 0.95, 0.88, 0.8, 0.72]  // Brightness cascade
            },
            // Radial drift - elements spread outward as they fade
            drift: {
                speed: 0.3,
                distance: 0.18,
                pattern: 'radial',      // Drift outward from center
                accelerate: true        // Speed up during exit
            },
            // Opacity cascade - first elements brightest
            opacityGradient: [1.0, 0.9, 0.8, 0.7, 0.6],
            // Counter-rotating Z with ASYMMETRIC speeds - creates dynamic spread
            rotate: [
                { axis: 'z', rotations: 2.5, phase: 0 },      // Element 0: CW fastest
                { axis: 'z', rotations: -2.0, phase: 72 },    // Element 1: CCW fast
                { axis: 'z', rotations: 1.8, phase: 144 },    // Element 2: CW medium
                { axis: 'z', rotations: -2.3, phase: 216 },   // Element 3: CCW fast
                { axis: 'z', rotations: 2.0, phase: 288 }     // Element 4: CW fast
            ],
            // Y-axis oscillation for tilt depth + X wobble
            tilt: {
                axis: 'y',
                oscillate: true,
                range: 0.4,
                speed: 3.5
            },
            wobble: {
                axis: 'x',
                oscillate: true,
                range: 0.15,
                speed: 2.0,
                phase: 90              // 90° out of phase with tilt
            },
            scaleVariance: 0.2,         // More size variation
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 12,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,      // Half circle arcs
                        arcSpeed: 1.0,      // Slower sweep - more visible
                        arcCount: 2         // Two opposing arcs (dual blades)
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Mesh effects - bright intense fire
    flickerFrequency: 15,
    flickerAmplitude: 0.01,
    flickerDecay: 0.15,
    glowColor: [1.0, 0.55, 0.15],   // Hot orange
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 12,
    scaleVibration: 0.012,
    scaleFrequency: 8,
    scaleGrowth: 0.015,
    rotationEffect: false
};

/**
 * Fireflourish gesture - spinning sword flourish.
 *
 * Uses axis-travel at center with spiral formation:
 * - 6 camera-facing arcs with 60° arcOffset spacing
 * - Heavy stagger (0.12) makes arcs appear sequentially
 * - Fast rotation (1.5 rotations) creates spinning flourish
 * - arcOffset + stagger + rotation = circular blade trail
 */
export default buildFireEffectGesture(FIREFLOURISH_CONFIG);
