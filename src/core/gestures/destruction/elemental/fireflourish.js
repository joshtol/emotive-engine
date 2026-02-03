/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fireflourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fireflourish gesture - theatrical flame sword flourish
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireflourish
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *            ═══
 *          ═══       ← Rings trail upward
 *        ═══           in sweeping arc
 *      ═══  ★        ← Like a sword flourish
 *        ═══
 *          ═══
 *
 * FEATURES:
 * - 5 horizontal rings sweeping in trailing arc
 * - Sequential stagger creates blade trail effect
 * - Martial arts flourish motion
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
 * Theatrical flame sword flourish - rings sweep in trailing arc
 */
const FIREFLOURISH_CONFIG = {
    name: 'fireflourish',
    emoji: '⚔️',
    type: 'blending',
    description: 'Theatrical flame sword flourish',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'radiating',
    temperature: 0.6,  // Warm orange fire

    // 3D Element spawning - trailing arc of rings
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'linear',
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.8,
            endDiameter: 1.8,
            orientation: 'flat'
        },
        formation: {
            type: 'stack',
            count: 5,
            spacing: 0.15
        },
        count: 5,
        scale: 0.8,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.08,            // Sequential for trailing effect
            enter: {
                type: 'fade',
                duration: 0.1,
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
                    end: 0.55,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.2,
                rate: 20,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.08,
                frequency: 8,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.5,
                max: 3.0,
                frequency: 8,
                pattern: 'sine'
            },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 12,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.8,
                        arcSpeed: 2.0,
                        arcCount: 2
                    }
                }
            }
        }
    },

    // Mesh effects - warm fire glow
    flickerFrequency: 15,
    flickerAmplitude: 0.008,
    flickerDecay: 0.2,
    glowColor: [1.0, 0.6, 0.2],       // Warm orange
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowFlickerRate: 12,
    scaleVibration: 0.01,
    scaleFrequency: 6,
    scaleGrowth: 0.015,
    rotationEffect: false
};

/**
 * Fireflourish gesture - theatrical flame sword flourish.
 *
 * Uses axis-travel spawn mode with stack formation:
 * - 5 flame-ring models travel from bottom to above
 * - Sequential stagger creates trailing blade arc
 * - Like swinging a flaming sword in a martial arts pattern
 */
export default buildFireEffectGesture(FIREFLOURISH_CONFIG);
