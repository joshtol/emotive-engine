/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firepillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firepillar gesture - stacked horizontal rings rising together
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firepillar
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ═══════        TOP
 *         ═══════
 *         ═══════        ← Stacked rings
 *         ═══════          rising as pillar
 *         ═══════
 *           ★            BOTTOM
 *
 * FEATURES:
 * - 5 horizontal flame rings stacked vertically
 * - Rise together as a unified pillar
 * - Maintains spacing while ascending
 * - Majestic pillar of flame effect
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pillar of fire effects
 * - Summoning/rising power
 * - Majestic fire displays
 * - Divine fire themes
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firepillar gesture configuration
 * Stacked horizontal rings rising together as a pillar
 */
const FIREPILLAR_CONFIG = {
    name: 'firepillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Stacked flame rings rising as pillar',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    category: 'radiating',
    temperature: 0.65,      // Warm powerful fire

    // 3D Element spawning - stacked rising rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeOut',      // Decelerating rise (majestic)
            startScale: 1.0,
            endScale: 1.1,
            startDiameter: 1.6,
            endDiameter: 1.8,
            orientation: 'flat'  // Flat stacked rings
        },
        formation: {
            type: 'stack',
            count: 5,
            spacing: 0.2            // Even vertical spacing
        },
        count: 5,
        scale: 1.0,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.04,          // Slight stagger for wave effect
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.3,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.5,
                    peak: 0.7,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.18,
                rate: 10,
                pattern: 'sine'
            },
            pulse: {
                amplitude: 0.07,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 2.2,
                frequency: 5,
                pattern: 'sine'
            },
            // Slow unified rotation for pillar cohesion
            rotate: { axis: 'z', rotations: 0.75, phase: 0 },
            scaleVariance: 0.05,    // Slight variation for organic feel
            lifetimeVariance: 0.05,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.85,   // Wide arcs for solid rings
                        arcSpeed: 1.0,
                        arcCount: 3
                    }
                }
            }
        }
    },

    // Mesh effects - powerful warm glow
    flickerFrequency: 8,
    flickerAmplitude: 0.008,
    flickerDecay: 0.25,
    glowColor: [1.0, 0.6, 0.2],     // Warm orange fire
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 7,
    scaleVibration: 0.01,
    scaleFrequency: 4,
    scaleGrowth: 0.02,
    rotationEffect: false
};

/**
 * Firepillar gesture - stacked horizontal rings rising together.
 *
 * Uses axis-travel spawn mode with stack formation:
 * - 5 flame-ring models stacked with even spacing
 * - Rise together from bottom to above
 * - Horizontal rings create pillar structure
 * - Majestic pillar of flame effect
 */
export default buildFireEffectGesture(FIREPILLAR_CONFIG);
