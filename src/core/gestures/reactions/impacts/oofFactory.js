/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Oof Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional "oof" punch gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/oofFactory
 *
 * OOF: Getting punched hard. The mascot recoils from a blow.
 *
 * ## Animation System
 *
 * Transform-based animation with shader deformation:
 * - Position: body flies away from the hit (cameraRelativePosition)
 * - Rotation: body bends/twists from the force (cameraRelativeRotation)
 * - Deformation: localized dent at impact site (shader vertex displacement)
 *
 * ## Deformation & Tidal Locking
 *
 * The impactPoint is specified in CAMERA-RELATIVE coordinates:
 * - X = camera's right (positive = right side of screen)
 * - Y = up (positive = top of screen)
 * - Z = toward camera (positive = closer to viewer)
 *
 * Crystal dimensions used for impactPoint placement:
 * - CRYSTAL_RADIUS (0.4): approximate radius in X/Z plane
 * - CRYSTAL_HEIGHT (0.8): half-height in Y axis
 *
 * Core3DManager transforms these to mesh-local space using the camera basis
 * vectors and inverse mesh quaternion. This ensures the dent always appears
 * on the camera-facing side regardless of mesh rotation ("tidal locking").
 *
 * See: deformation.js for shader code, Core3DManager.js for coordinate transform
 */

import { capitalize } from '../../_shared/directions.js';

/**
 * Create an oof gesture - getting punched
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
        down: '💥',
    };

    const descriptions = {
        left: 'Punched from left',
        right: 'Punched from right',
        front: 'Gut punch',
        back: 'Kidney shot',
        up: 'Uppercut',
        down: 'Hammer fist',
    };

    return {
        name: `oof${capitalize(direction)}`,
        emoji: emojis[direction],
        type: 'override',
        description: descriptions[direction],

        config: {
            duration: 500,
            musicalDuration: { musical: true, beats: 1 },
            intensity: 1.0,
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'oof',
                strength: 1.0,
                direction,
            },
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 1 },
            timingSync: 'onBeat',
            accentResponse: {
                enabled: true,
                multiplier: 1.5,
            },
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const dir = config.direction || 'front';

                // ═══════════════════════════════════════════════════════════════
                // PUNCH - Movement, rotation, and localized dent
                // ═══════════════════════════════════════════════════════════════

                // Recoil curve: fast out, slow back
                let recoil;
                if (progress < 0.25) {
                    const t = progress / 0.25;
                    recoil = t * (2 - t);
                } else {
                    const t = (progress - 0.25) / 0.75;
                    recoil = 1 - t * t;
                }

                // Dent curve: instant on, fade out
                let dentStrength;
                if (progress < 0.1) {
                    dentStrength = progress / 0.1; // Quick ramp up
                } else if (progress < 0.4) {
                    dentStrength = 1.0; // Hold
                } else {
                    dentStrength = 1 - (progress - 0.4) / 0.6; // Fade out
                }

                const moveDist = 0.2 * strength;
                const tiltAngle = 0.35 * strength;

                let posX = 0,
                    posY = 0,
                    posZ = 0;
                let rotX = 0,
                    rotZ = 0;
                const rotY = 0;

                // Impact point as VIEW SPACE offset from mesh center
                // VIEW SPACE coordinates (from camera's perspective):
                // - X = right (positive = camera's right)
                // - Y = up (positive = up)
                // - Z = toward camera (positive = closer to camera)
                //
                // Crystal dimensions in view space after typical transforms:
                // approximately 0.4-0.5 radius in X/Z, 0.8 in Y
                const CRYSTAL_RADIUS = 0.4; // Approximate radius in X/Z
                const CRYSTAL_HEIGHT = 0.8; // Half-height in Y
                let impactPoint = [0, 0, CRYSTAL_RADIUS]; // Default: front (toward camera)

                switch (dir) {
                    case 'left':
                        // Punch from camera's left - dent on left, recoil to the right
                        posX = -recoil * moveDist;
                        rotZ = recoil * tiltAngle;
                        impactPoint = [CRYSTAL_RADIUS, 0, 0]; // Positive X in camera-relative = left side
                        break;

                    case 'right':
                        // Punch from camera's right - dent on right, recoil to the left
                        posX = recoil * moveDist;
                        rotZ = -recoil * tiltAngle;
                        impactPoint = [-CRYSTAL_RADIUS, 0, 0]; // Negative X in camera-relative = right side
                        break;

                    case 'front':
                        // Punch from camera toward mesh - impact on front (positive Z = toward camera)
                        posZ = -recoil * moveDist;
                        posY = -recoil * 0.03;
                        rotX = recoil * tiltAngle * 0.7;
                        impactPoint = [0, 0, CRYSTAL_RADIUS];
                        break;

                    case 'back':
                        // Punch from behind - impact on back (negative Z = away from camera)
                        posZ = recoil * moveDist;
                        rotX = -recoil * tiltAngle * 0.6;
                        impactPoint = [0, 0, -CRYSTAL_RADIUS];
                        break;

                    case 'up':
                        // Uppercut - impact on top (positive Y)
                        posY = recoil * moveDist;
                        rotX = -recoil * tiltAngle * 0.4;
                        impactPoint = [0, CRYSTAL_HEIGHT, 0];
                        break;

                    case 'down':
                        // Hammer fist - impact on bottom (negative Y)
                        posY = -recoil * moveDist;
                        rotX = recoil * tiltAngle * 0.3;
                        impactPoint = [0, -CRYSTAL_HEIGHT, 0];
                        break;
                }

                // Glow flash on impact
                let glowIntensity = 1.0;
                let glowBoost = 0;
                if (progress < 0.15) {
                    const t = progress / 0.15;
                    glowIntensity = 1.0 + (1 - t) * 0.6;
                    glowBoost = (1 - t) * 0.4;
                }

                return {
                    cameraRelativePosition: [posX, posY, posZ],
                    cameraRelativeRotation: [rotX, rotY, rotZ],
                    scale: 1.0,
                    glowIntensity,
                    glowBoost,

                    // Localized dent at impact site
                    // impactPoint is in CAMERA-RELATIVE space (X=right, Y=up, Z=toward camera)
                    // Core3DManager transforms this to mesh-local space for tidal locking
                    deformation: {
                        enabled: true,
                        strength: dentStrength * strength * 2.0, // Strong dent
                        impactPoint, // Camera-relative, transformed by Core3DManager
                        falloffRadius: 0.5, // Radius of dent effect
                    },
                };
            },
        },
    };
}

export default createOofGesture;
