/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Oof Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional "oof" blow gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/oofFactory
 *
 * Creates BRUTAL punch impact gestures. The goal is to look like someone
 * literally took their fist and knocked the shit out of the mascot's torso.
 *
 * PHYSICS MODEL:
 * 1. INSTANT IMPACT - Fist connects, flesh caves in at impact site
 * 2. SHOCKWAVE - Ripple propagates outward through jello-like flesh
 * 3. KNOCKBACK - Kinetic energy transfers, body gets THROWN
 * 4. ELASTIC RECOIL - Body bounces back as stored energy releases
 *
 * OOF: Brutal impact (~800ms)
 */

import { capitalize } from '../motions/directions.js';

/**
 * Create an oof gesture - brutal punch impact
 * @param {string} direction - 'left', 'right', 'front', 'back', 'up', 'down'
 * @returns {Object} Gesture definition
 */
export function createOofGesture(direction) {
    const validDirections = ['left', 'right', 'front', 'back', 'up', 'down'];
    if (!validDirections.includes(direction)) {
        throw new Error(`Invalid oof direction: ${direction}`);
    }

    const emojis = {
        left: '🤜',
        right: '🤛',
        front: '👊',
        back: '😫',
        up: '🥊',
        down: '💥'
    };

    const descriptions = {
        left: 'Brutal punch from left - knocked right',
        right: 'Brutal punch from right - knocked left',
        front: 'Gut punch - fist buries into torso',
        back: 'Kidney shot from behind - arches forward',
        up: 'Uppercut - head snaps back violently',
        down: 'Hammer fist - crushed down'
    };

    return {
        name: `oof${capitalize(direction)}`,
        emoji: emojis[direction],
        type: 'override',
        description: descriptions[direction],

        config: {
            duration: 800,  // Slightly longer for the full physics to play out
            musicalDuration: { musical: true, beats: 2 },
            intensity: 1.0,
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'oof',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 2 },
            timingSync: 'onBeat',

            accentResponse: {
                enabled: true,
                multiplier: 1.5
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const intensity = config.intensity || 1.0;
                const dir = config.direction || 'front';

                // ═══════════════════════════════════════════════════════════════════
                // BRUTAL PUNCH PHYSICS - 4 PHASES
                // ═══════════════════════════════════════════════════════════════════
                //
                // Phase 1 (0-0.08): IMPACT - Fist connects. INSTANT crater forms.
                //                   Flesh caves in at impact site. No translation yet.
                //
                // Phase 2 (0.08-0.25): SHOCKWAVE - Ripple travels outward through
                //                      jello-like flesh. Body starts to move.
                //
                // Phase 3 (0.25-0.55): KNOCKBACK - Full kinetic transfer. Body gets
                //                      THROWN by the accumulated force. Maximum displacement.
                //
                // Phase 4 (0.55-1.0): RECOIL - Elastic recovery. Body bounces back
                //                     with decreasing oscillations like jello settling.

                // ─────────────────────────────────────────────────────────────────
                // IMPACT CRATER - How deep the fist buries into the flesh
                // ─────────────────────────────────────────────────────────────────
                let craterDepth = 0;
                if (progress < 0.08) {
                    // INSTANT cave-in - exponential attack
                    const t = progress / 0.08;
                    craterDepth = 1 - Math.pow(1 - t, 4);  // Very fast, almost instant
                } else if (progress < 0.25) {
                    // Crater holds while shockwave propagates
                    const t = (progress - 0.08) / 0.17;
                    craterDepth = 1.0 - t * 0.3;  // Slowly releasing
                } else if (progress < 0.55) {
                    // Crater releasing as body moves
                    const t = (progress - 0.25) / 0.3;
                    craterDepth = 0.7 * (1 - t);
                } else {
                    // Elastic bounce-back with oscillation
                    const t = (progress - 0.55) / 0.45;
                    const bounceFreq = 4;
                    const bounceDamp = Math.exp(-t * 5);
                    // Overshoot in opposite direction then settle
                    craterDepth = -0.15 * Math.sin(t * Math.PI * bounceFreq) * bounceDamp;
                }

                // ─────────────────────────────────────────────────────────────────
                // SHOCKWAVE RIPPLE - Wave traveling through flesh
                // ─────────────────────────────────────────────────────────────────
                let rippleIntensity = 0;
                let ripplePhase = 0;
                if (progress > 0.02 && progress < 0.5) {
                    // Shockwave starts slightly after impact
                    const rippleT = (progress - 0.02) / 0.48;
                    rippleIntensity = Math.sin(rippleT * Math.PI) * (1 - rippleT * 0.5);
                    // Multiple waves at different frequencies
                    ripplePhase = rippleT * Math.PI * 6;
                }
                const ripple1 = Math.sin(ripplePhase) * rippleIntensity * 0.08;
                const ripple2 = Math.sin(ripplePhase * 1.7 + 0.5) * rippleIntensity * 0.05;
                const ripple3 = Math.sin(ripplePhase * 2.3 + 1.0) * rippleIntensity * 0.03;
                const combinedRipple = ripple1 + ripple2 + ripple3;

                // ─────────────────────────────────────────────────────────────────
                // KNOCKBACK - Body gets THROWN by the punch
                // ─────────────────────────────────────────────────────────────────
                let knockback = 0;
                if (progress < 0.08) {
                    // No movement during initial impact - force is being absorbed
                    knockback = 0;
                } else if (progress < 0.25) {
                    // Starts moving - force transferring
                    const t = (progress - 0.08) / 0.17;
                    knockback = t * t * 0.4;  // Accelerating
                } else if (progress < 0.55) {
                    // MAXIMUM knockback - body flying
                    const t = (progress - 0.25) / 0.3;
                    const ease = 1 - Math.pow(1 - t, 2);
                    knockback = 0.4 + ease * 0.6;  // Reaches 1.0 at peak
                } else {
                    // Elastic return with bounce
                    const t = (progress - 0.55) / 0.45;
                    const bounceFreq = 2.5;
                    const bounceDamp = Math.exp(-t * 3);
                    // Returns to center but overshoots slightly
                    knockback = (1 - t) * 0.8 + Math.sin(t * Math.PI * bounceFreq) * 0.15 * bounceDamp;
                }

                // ─────────────────────────────────────────────────────────────────
                // BODY ROTATION - Doubles over / bends from impact
                // ─────────────────────────────────────────────────────────────────
                let bendAmount = 0;
                if (progress < 0.08) {
                    // Instant reaction to impact
                    const t = progress / 0.08;
                    bendAmount = t * 0.3;
                } else if (progress < 0.4) {
                    // Full bend while absorbing/flying
                    const t = (progress - 0.08) / 0.32;
                    bendAmount = 0.3 + t * 0.7;  // Reaches 1.0
                } else {
                    // Recovery
                    const t = (progress - 0.4) / 0.6;
                    const ease = t * t * (3 - 2 * t);
                    bendAmount = 1.0 - ease * 0.85;  // Doesn't fully recover (lingering pain)
                }

                // ─────────────────────────────────────────────────────────────────
                // TRAUMA SHAKE - High frequency vibration during impact
                // ─────────────────────────────────────────────────────────────────
                let traumaShake = 0;
                if (progress < 0.35) {
                    // Intense shake at impact, fading
                    const shakeEnv = progress < 0.1
                        ? progress / 0.1
                        : 1 - (progress - 0.1) / 0.25;
                    const highFreq = Math.sin(progress * 180) * 0.4 +
                                    Math.sin(progress * 230) * 0.3 +
                                    Math.sin(progress * 170) * 0.3;
                    traumaShake = highFreq * Math.max(0, shakeEnv) * 0.04;
                }

                // ─────────────────────────────────────────────────────────────────
                // APPLY DIRECTION-SPECIFIC TRANSFORMS
                // ─────────────────────────────────────────────────────────────────
                let posX = 0, posY = 0, posZ = 0;
                let rotX = 0, rotZ = 0;
                const rotY = 0;
                let scaleX = 1, scaleY = 1, scaleZ = 1;

                // Impact point offset for shader (where fist hits)
                let impactPointLocal = [0, 0, 0];

                // Camera-relative coordinate system:
                // X: positive = right, negative = left (from camera's view)
                // Z: positive = toward camera, negative = away
                // rotX: positive = bow forward, negative = arch back
                // rotZ: positive = tilt top-left (CCW), negative = tilt top-right (CW)

                const knockbackDist = 0.35 * strength;  // Max knockback distance
                const bendAngle = 0.7 * strength * intensity;  // Max bend angle

                switch (dir) {
                case 'left':
                    // PUNCHED FROM LEFT - Knocked to the right
                    posX = knockback * knockbackDist;
                    posY = -craterDepth * 0.08 * strength;  // Slight drop
                    rotZ = -bendAmount * bendAngle;  // Bend right (top goes right)
                    rotX = bendAmount * 0.15 * strength;  // Slight forward hunch

                    // Crater on left side - X compresses, Y/Z bulge
                    scaleX = 1.0 - craterDepth * 0.25 * intensity;
                    scaleY = 1.0 + craterDepth * 0.12 * intensity + combinedRipple;
                    scaleZ = 1.0 + craterDepth * 0.10 * intensity - combinedRipple * 0.5;

                    impactPointLocal = [-0.3, 0, 0];  // Left side of torso
                    break;

                case 'right':
                    // PUNCHED FROM RIGHT - Knocked to the left
                    posX = -knockback * knockbackDist;
                    posY = -craterDepth * 0.08 * strength;
                    rotZ = bendAmount * bendAngle;  // Bend left (top goes left)
                    rotX = bendAmount * 0.15 * strength;

                    scaleX = 1.0 - craterDepth * 0.25 * intensity;
                    scaleY = 1.0 + craterDepth * 0.12 * intensity + combinedRipple;
                    scaleZ = 1.0 + craterDepth * 0.10 * intensity - combinedRipple * 0.5;

                    impactPointLocal = [0.3, 0, 0];  // Right side of torso
                    break;

                case 'front':
                    // GUT PUNCH - Fist buries deep, knocked backward
                    posZ = -knockback * knockbackDist * 0.8;  // Pushed away from camera
                    posY = -craterDepth * 0.15 * strength - bendAmount * 0.1 * strength;
                    rotX = bendAmount * bendAngle * 1.2;  // Doubles over HARD

                    // Deep crater in front - Z compresses hard, X bulges out
                    scaleZ = 1.0 - craterDepth * 0.35 * intensity;
                    scaleX = 1.0 + craterDepth * 0.20 * intensity + combinedRipple;
                    scaleY = 1.0 - craterDepth * 0.05 * intensity + combinedRipple * 0.3;

                    impactPointLocal = [0, 0, 0.3];  // Front of torso
                    break;

                case 'back':
                    // KIDNEY SHOT - Arches forward from behind
                    posZ = knockback * knockbackDist;  // Pushed toward camera
                    posY = craterDepth * 0.05 * strength;
                    rotX = -bendAmount * bendAngle * 0.8;  // Arches back/forward reaction

                    scaleZ = 1.0 - craterDepth * 0.28 * intensity;
                    scaleX = 1.0 + craterDepth * 0.15 * intensity + combinedRipple;
                    scaleY = 1.0 + craterDepth * 0.10 * intensity;

                    impactPointLocal = [0, 0, -0.3];  // Back of torso
                    break;

                case 'up':
                    // UPPERCUT - Head snaps back, lifted off ground
                    posY = knockback * knockbackDist * 0.9;  // Lifted up
                    posZ = -knockback * knockbackDist * 0.3;  // Slight backward
                    rotX = -bendAmount * bendAngle;  // Head snaps back

                    scaleY = 1.0 - craterDepth * 0.20 * intensity;
                    scaleX = 1.0 + craterDepth * 0.12 * intensity + combinedRipple;
                    scaleZ = 1.0 + craterDepth * 0.12 * intensity;

                    impactPointLocal = [0, -0.2, 0.1];  // Under chin
                    break;

                case 'down':
                    // HAMMER FIST / STOMP - Crushed downward
                    posY = -knockback * knockbackDist * 1.1;  // Smashed down HARD
                    rotX = bendAmount * 0.15 * strength;  // Minimal forward hunch

                    // PANCAKE - Y compresses extremely, X/Z bulge wide
                    scaleY = 1.0 - craterDepth * 0.45 * intensity;
                    scaleX = 1.0 + craterDepth * 0.30 * intensity + combinedRipple;
                    scaleZ = 1.0 + craterDepth * 0.30 * intensity - combinedRipple * 0.3;

                    impactPointLocal = [0, 0.3, 0];  // Top of head/shoulders
                    break;
                }

                // Add trauma shake to position
                posX += traumaShake * strength;
                posZ += traumaShake * 0.5 * strength;
                rotZ += traumaShake * 2 * strength;

                // ─────────────────────────────────────────────────────────────────
                // VOLUME PRESERVATION - Keep scaleX * scaleY * scaleZ ≈ 1.0
                // ─────────────────────────────────────────────────────────────────
                const volume = scaleX * scaleY * scaleZ;
                const volumeCorrection = Math.pow(1.0 / volume, 1/3);
                const correctionBlend = 0.75;  // 75% toward volume preservation
                const correction = 1 + (volumeCorrection - 1) * correctionBlend;
                scaleX *= correction;
                scaleY *= correction;
                scaleZ *= correction;

                // ─────────────────────────────────────────────────────────────────
                // GLOW EFFECTS - Impact flash
                // ─────────────────────────────────────────────────────────────────
                let glowIntensity = 1.0;
                let glowBoost = 0;
                if (progress < 0.1) {
                    // BRIGHT flash at impact
                    const flashT = progress / 0.1;
                    glowIntensity = 1.0 + (1 - flashT * flashT) * 2.0;
                    glowBoost = (1 - flashT) * 1.0;
                } else if (progress < 0.3) {
                    // Sustained glow during trauma
                    glowIntensity = 1.5 - (progress - 0.1) / 0.2 * 0.3;
                    glowBoost = 0.3;
                } else {
                    // Fade
                    const fadeT = (progress - 0.3) / 0.7;
                    glowIntensity = 1.2 - fadeT * 0.2;
                    glowBoost = 0.3 * (1 - fadeT);
                }

                // ─────────────────────────────────────────────────────────────────
                // SHADER DEFORMATION - Localized vertex displacement
                // ─────────────────────────────────────────────────────────────────
                const directionVectors = {
                    left:  [-1, 0, 0],
                    right: [1, 0, 0],
                    front: [0, 0, 1],
                    back:  [0, 0, -1],
                    up:    [0, 1, 0],
                    down:  [0, -1, 0]
                };

                // Deformation strength follows crater depth but with ripple overlay
                const deformStrength = (craterDepth * 0.8 + rippleIntensity * 0.4) * intensity;

                return {
                    cameraRelativePosition: [posX, posY, posZ],
                    cameraRelativeRotation: [rotX, rotY, rotZ],
                    scale: [scaleX, scaleY, scaleZ],
                    glowIntensity,
                    glowBoost,

                    // Shader-based vertex deformation for localized jello ripple
                    deformation: {
                        enabled: true,
                        type: 'elastic',  // Jello-like ripple with wobble
                        strength: Math.max(deformStrength, 0),
                        phase: progress,
                        direction: directionVectors[dir] || [0, 0, 1],
                        impactPoint: impactPointLocal,
                        falloffRadius: 0.7  // Affects 70% of mesh from impact
                    }
                };
            }
        }
    };
}

// Export factory
export default createOofGesture;
