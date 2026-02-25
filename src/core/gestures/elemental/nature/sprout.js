/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Sprout Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturesprout gesture - fresh shoots emerging with rising vine wreath
 * @module gestures/destruction/elemental/naturesprout
 *
 * CONCEPT: Gentle new growth emerges on the mascot surface while a small u-vine
 * wreath rises from below, spinning slowly — like a seedling unfurling.
 * Light, delicate, spring-like energy.
 *
 * Layer 1: surface spawn — leaf-bunch and s-vine shoots growing on mascot
 * Layer 2: u-vine wreath — rises from bottom to center, gentle spin, arc reveal
 *
 * ORIENTATION NOTES:
 * - u-vine: natively XZ plane → 'vertical' (identity) keeps it horizontal
 *   Uses verticalEdgeAlign: false to skip ring edge-alignment offset
 * - u-vine rotation uses axis 'y' directly (identity orientation, no remap)
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const CONFIG = {
    name: 'naturesprout',
    emoji: '🌱',
    type: 'blending',
    description: 'Fresh shoots emerging with rising vine wreath',
    duration: 2800,
    beats: 4,
    intensity: 0.6,
    category: 'emanating',
    growth: 0.5,
    mascotGlow: 0.2,

    spawnMode: [
        // ── Layer 1: Surface shoots on mascot ──
        {
            type: 'surface',
            pattern: 'crown',
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.2,
            count: 6,
            scale: 1.0,
            models: ['leaf-bunch', 'vine-cluster', 's-vine'],
            minDistance: 0.18,
            animation: {
                appearAt: 0.1,
                disappearAt: 0.88,
                stagger: 0.05,
                enter: { type: 'grow', duration: 0.12, easing: 'easeOutCubic' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                pulse: { amplitude: 0.08, frequency: 2.5, easing: 'easeInOut' },
                emissive: { min: 0.5, max: 0.85, frequency: 2.5, pattern: 'sine' },
                drift: { direction: 'up', speed: 0.012, noise: 0.08 },
                scaleVariance: 0.18,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 7,
                intensityScaling: { scale: 1.18, emissiveMax: 1.2 }
            }
        },

        // ── Layer 2: Rising u-vine wreath — bottom to center, gentle spin ──
        {
            type: 'axis-travel',
            axisTravel: {
                start: 'bottom',
                end: 'center',
                easing: 'easeOut',
                holdAt: 0.7,
                orientation: 'vertical',
                verticalEdgeAlign: false,
                diameterUnit: 'mascot',
                uniformDiameter: true,
                startDiameter: 0.7,
            },
            count: 1,
            scale: 0.8,
            models: ['u-vine'],
            animation: {
                blending: 'normal',
                renderOrder: 12,
                appearAt: 0.05,
                disappearAt: 0.8,
                enter: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                rotate: { axis: 'y', rotations: 1.0 },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['u-vine'],
                    anchor: 'around',
                    intensity: 0.3,
                    sizeScale: 0.7,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.2,
                }],
                modelOverrides: {
                    'u-vine': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.7,
                            arcSpeed: 0.8,
                            arcCount: 1
                        }
                    }
                }
            }
        }
    ],

    // Glow - bright spring green
    glowColor: [0.5, 0.9, 0.35],
    glowIntensityMin: 0.6,
    glowIntensityMax: 0.95,
    glowFlickerRate: 4,

    // Scale dynamics - upward growth
    scaleVibration: 0.018,
    scaleFrequency: 3,

    // Rising motion
    decayRate: 0.18,

    // Post-processing
    cutout: {
        primary: { pattern: 'sprout', scale: 3.5, blend: 'multiply', travelSpeed: 0.35 },
        secondary: { pattern: 'organic', scale: 6.0, blend: 'overlay', travelSpeed: 0.2 }
    },
    grain: { type: 3, strength: 0.03, blend: 'multiply', speed: 0.4 }
};

export default buildNatureEffectGesture(CONFIG);
