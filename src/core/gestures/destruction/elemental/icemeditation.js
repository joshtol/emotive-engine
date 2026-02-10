/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icemeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icemeditation gesture - mandala crystals with breathing pulse
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icemeditation
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *           ❄️
 *        ❄️     ❄️
 *           ●           ← Mandala: center + outer crystals
 *        ❄️     ❄️          Breathing pulse in/out
 *           ❄️
 *
 * FEATURES:
 * - 5 ice-ring elements in mandala formation (1 center + 4 outer)
 * - Anchored at center (no travel)
 * - Synchronized breathing pulse animation
 * - VORONOI + CRACKS cutout with angular travel
 * - Calm meditative ice energy
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Meditation effects
 * - Calm ice displays
 * - Focusing/centering effects
 * - Spiritual frost themes
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icemeditation gesture configuration
 * Mandala crystals with breathing pulse
 */
const ICEMEDITATION_CONFIG = {
    name: 'icemeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Meditative ice crystals with breathing pulse',
    duration: 4000,
    beats: 4,
    intensity: 0.6,
    category: 'emanating',
    frost: 0.5,

    // 3D Element spawning - MANDALA: 5 crystals (1 center + 4 outer)
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'easeInOut',
            startScale: 1.4,
            endScale: 1.4,
            startDiameter: 2.2,
            endDiameter: 2.2,
            orientation: 'camera'       // Billboard: always face camera
        },
        formation: {
            type: 'mandala',
            count: 5,
            radius: 0.5,
            arcOffset: 45,
            scales: [1.1, 0.7, 0.7, 0.7, 0.7]
        },
        count: 5,
        scale: 1.6,
        models: ['ice-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.8,
            stagger: 0,
            enter: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeInOut'
            },
            exit: {
                type: 'fade',
                duration: 0.4,
                easing: 'easeInOut'
            },
            procedural: {
                scaleSmoothing: 0.15,
                geometryStability: true
            },
            parameterAnimation: {
                frost: {
                    start: 0.35,
                    peak: 0.55,
                    end: 0.4,
                    curve: 'sine'
                }
            },
            // VORONOI + CRACKS for crystalline mandala
            cutout: {
                strength: 0.55,
                primary: { pattern: 3, scale: 1.0, weight: 1.0 },    // VORONOI - crystalline cells
                secondary: { pattern: 8, scale: 1.2, weight: 0.4 },  // CRACKS - subtle fractures
                blend: 'add',
                travel: 'angular',
                travelSpeed: 0.5,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                bellWidth: 1.0
            },
            // Grain: FILM for subtle frost texture
            grain: {
                type: 3,
                strength: 0.2,
                scale: 0.3,
                speed: 0.5,
                blend: 'multiply'
            },
            // Strong breathing pulse - the key feature
            pulse: {
                amplitude: 0.15,
                frequency: 1.5,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.7,
                max: 1.2,
                frequency: 1.5,
                pattern: 'sine'
            },
            // Gentle slow rotation around Z
            rotate: [
                { axis: 'z', rotations: 0.4, phase: 0 },
                { axis: 'z', rotations: -0.35, phase: 0 },
                { axis: 'z', rotations: 0.25, phase: 0 },
                { axis: 'z', rotations: -0.35, phase: 0 },
                { axis: 'z', rotations: 0.4, phase: 0 }
            ],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            depthWrite: false,          // Don't occlude mascot (camera-facing rings safe from Necker inversion)
            renderOrder: -5,
            modelOverrides: {
                'ice-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.9,
                        arcSpeed: 0.4,
                        arcCount: 2
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Glow - calm icy aura
    glowColor: [0.55, 0.8, 0.95],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.0,
    glowFlickerRate: 3,
    // Scale - synchronized breathing
    scaleVibration: 0.004,
    scaleFrequency: 1.5,
    scaleGrowth: 0,
    // Tremor - crystalline stillness
    tremor: 0.001,
    tremorFrequency: 1
};

/**
 * Icemeditation gesture - mandala crystals with breathing pulse.
 *
 * Uses axis-travel with mandala formation:
 * - 5 crystal-cluster models in mandala pattern
 * - Synchronized breathing pulse (scale + emissive)
 * - VORONOI + CRACKS cutout for crystalline texture
 * - Calm meditative ice energy
 */
export default buildIceEffectGesture(ICEMEDITATION_CONFIG);
