/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fireblast Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fireblast gesture - explosive fire burst with multiple elements
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireblast
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *              🔥              ← Center burst shoots UP
 *           🔥    🔥           ← Side flames arc up/out
 *         •  •  •  •  •        ← Tiny ember particles (radial)
 *        ═══════════════       ← Expanding ring (blast base)
 *            ○○○               ← Ember cluster at impact
 *
 * FEATURES:
 * - Central expanding flame-ring (RADIAL cutout)
 * - 5 large fire-bursts shooting UP and OUT like blast arms
 * - 8 medium flame-tongues in radial burst (EMBERS cutout)
 * - 12 tiny ember particles for fine sparks (DISSOLVE cutout)
 * - Ember cluster at impact base
 * - TRUE BLAST: centered burst, not trailing
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Fire impact effects
 * - Blast reactions
 * - Dramatic fire bursts
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Fireblast gesture configuration
 * Explosive blast - flames bursting outward with ember spray
 */
const FIREBLAST_CONFIG = {
    name: 'fireblast',
    emoji: '💥',
    type: 'blending',
    description: 'Explosive fire blast with bursting flames and ember spray',
    duration: 1000,
    beats: 2,
    intensity: 1.3,
    category: 'impact',
    temperature: 0.9,

    // 3D Element spawning - TRUE BLAST: centered burst of flames
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Central expanding ring - the blast "base"
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 2.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.5,
            models: ['flame-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.4,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 2, scale: 1.8, weight: 1.0 },    // RADIAL - blast lines
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.0,
                    strengthCurve: 'fadeOut',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.25,
                        softness: 1.2
                    }
                },
                grain: { type: 3, strength: 0.5, scale: 0.3, speed: 1.5, blend: 'multiply' },
                blending: 'additive',
                renderOrder: 8,
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                modelOverrides: {
                    'flame-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: BIG fire-bursts shooting UP and OUT - main blast arms (5 directions)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.3, endScale: 1.6, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 1.2, models: ['fire-burst'],
            animation: {
                appearAt: 0.0, disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: { strength: 0.4, primary: { pattern: 5, scale: 1.0, weight: 1.0 }, blend: 'multiply', travel: 'vertical', travelSpeed: 0.8, strengthCurve: 'fadeOut' },
                drift: { speed: 1.4, distance: 0.8, direction: { x: 0, y: 1.0, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'additive', renderOrder: 12,
                modelOverrides: { 'fire-burst': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.25, endScale: 1.3, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 1.0, models: ['fire-burst'],
            animation: {
                appearAt: 0.02, disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: { strength: 0.45, primary: { pattern: 5, scale: 0.8, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 0.6, strengthCurve: 'fadeOut' },
                drift: { speed: 1.3, distance: 0.75, direction: { x: -0.7, y: 0.85, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'additive', renderOrder: 12,
                modelOverrides: { 'fire-burst': { shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.25, endScale: 1.3, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 1.0, models: ['fire-burst'],
            animation: {
                appearAt: 0.02, disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: { strength: 0.45, primary: { pattern: 5, scale: 0.8, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 0.6, strengthCurve: 'fadeOut' },
                drift: { speed: 1.3, distance: 0.75, direction: { x: 0.7, y: 0.85, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'additive', renderOrder: 12,
                modelOverrides: { 'fire-burst': { shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.2, endScale: 1.1, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.85, models: ['fire-burst'],
            animation: {
                appearAt: 0.03, disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.18, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: { strength: 0.4, primary: { pattern: 5, scale: 1.2, weight: 1.0 }, blend: 'multiply', travel: 'vertical', travelSpeed: 0.8, strengthCurve: 'fadeOut' },
                drift: { speed: 1.1, distance: 0.6, direction: { x: -0.95, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'additive', renderOrder: 11,
                modelOverrides: { 'fire-burst': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.2, endScale: 1.1, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.85, models: ['fire-burst'],
            animation: {
                appearAt: 0.03, disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.18, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: { strength: 0.4, primary: { pattern: 5, scale: 1.2, weight: 1.0 }, blend: 'multiply', travel: 'vertical', travelSpeed: 0.8, strengthCurve: 'fadeOut' },
                drift: { speed: 1.1, distance: 0.6, direction: { x: 0.95, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'additive', renderOrder: 11,
                modelOverrides: { 'fire-burst': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: MEDIUM flame-tongues - secondary blast (radial burst, 8 directions)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8,
                radius: 0.05,
                endRadius: 0.65,
                angleSpread: 360,
                startAngle: 22,
                orientation: 'camera',
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutQuad'
            },
            count: 8, scale: 0.6, models: ['flame-tongue'],
            animation: {
                appearAt: 0.02, disappearAt: 0.4, stagger: 0.008,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                cutout: { strength: 0.35, primary: { pattern: 5, scale: 0.7, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 0.8, strengthCurve: 'fadeOut' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                scaleVariance: 0.3, lifetimeVariance: 0.15,
                blending: 'additive', renderOrder: 14,
                modelOverrides: { 'flame-tongue': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 4: TINY ember particles - fine sparks (radial burst, 12 particles)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 12,
                radius: 0.03,
                endRadius: 0.5,
                angleSpread: 360,
                startAngle: 0,
                orientation: 'camera',
                startScale: 0.1,
                endScale: 0.35,
                scaleEasing: 'easeOutQuad'
            },
            count: 12, scale: 0.2, models: ['ember-cluster'],
            animation: {
                appearAt: 0.01, disappearAt: 0.3, stagger: 0.005,
                enter: { type: 'scale', duration: 0.02, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.1, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                cutout: { strength: 0.25, primary: { pattern: 7, scale: 0.5, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 1.0, strengthCurve: 'fadeOut' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                scaleVariance: 0.5, lifetimeVariance: 0.25,
                blending: 'additive', renderOrder: 16,
                modelOverrides: { 'ember-cluster': { shaderAnimation: { type: 1, arcWidth: 0.98, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 5: Ember cluster at base - impact embers
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: -0.1, z: 0.12 }, orientation: 'camera', startScale: 0.2, endScale: 0.9, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.7, models: ['ember-cluster'],
            animation: {
                appearAt: 0.05, disappearAt: 0.6,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                cutout: { strength: 0.5, primary: { pattern: 5, scale: 1.2, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 0.5, strengthCurve: 'constant' },
                pulse: { amplitude: 0.1, frequency: 8, easing: 'easeInOut' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'additive', renderOrder: 6,
                modelOverrides: { 'ember-cluster': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 2 }, orientationOverride: 'camera' } }
            }
        }
    ],

    // Flicker - punchy impact
    flickerFrequency: 14,
    flickerAmplitude: 0.02,
    flickerDecay: 0.4,
    // Scale - burst expansion
    scaleVibration: 0.035,
    scaleFrequency: 7,
    scaleGrowth: 0.015,
    // Glow - bright fire flash
    glowColor: [1.0, 0.5, 0.15],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 10
};

/**
 * Fireblast gesture - centered fire explosion.
 *
 * TRUE BLAST design - flames bursting from center point:
 * - Layer 1: Expanding flame-ring blast base (RADIAL cutout)
 * - Layer 2: 5 fire-bursts shooting UP and OUT (blast arms)
 * - Layer 3: 8 flame-tongues in radial burst (EMBERS cutout)
 * - Layer 4: 12 tiny ember particles (DISSOLVE cutout)
 * - Layer 5: Ember cluster at impact base (EMBERS cutout)
 * All elements burst FROM center OUTWARD - no trailing.
 */
export default buildFireEffectGesture(FIREBLAST_CONFIG);
