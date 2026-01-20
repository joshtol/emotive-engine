/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lunge Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional lunge gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/lungeFactory
 *
 * Creates lunge gestures for all four directions.
 * Forward thrust pose with emphasis and recovery.
 *
 * LUNGE: Quick thrust movement (~500ms)
 *
 * Use cases:
 * - lungeForward: Attack, reaching forward, emphasis
 * - lungeBack: Retreat, defensive pose
 * - lungeLeft/Right: Dodge, sidestep attack
 * - lungeUp: Uppercut, reaching up
 * - lungeDown: Stomp, diving attack
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a lunge gesture - forward thrust with recovery
 * @param {string} direction - 'up', 'down', 'left', 'right', 'forward', 'back'
 * @returns {Object} Gesture definition
 */
export function createLungeGesture(direction) {
    // Extended directions for 3D
    // Note: In 3D, negative Z is towards camera (forward), positive Z is away (back)
    const LUNGE_DIRECTIONS = {
        ...DIRECTIONS,
        forward: { x: 0, y: 0, z: -1 },
        back: { x: 0, y: 0, z: 1 }
    };

    const dir = LUNGE_DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid lunge direction: ${direction}`);

    const emojis = {
        forward: '🤺',
        back: '🏃',
        left: '👈',
        right: '👉',
        up: '☝️',
        down: '👇'
    };

    return {
        name: `lunge${capitalize(direction)}`,
        emoji: emojis[direction] || '🤺',
        type: 'override',
        description: `Lunge thrust ${direction}`,

        config: {
            duration: 500,
            musicalDuration: { musical: true, beats: 1 },
            distance: 0.25,
            recover: true,
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'lunge',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 1 },
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
                const distance = config.distance || 0.25;
                const recover = config.recover !== false;
                const moveDir = config.direction || 'forward';

                // Lunge envelope: quick thrust, hold briefly, recover
                let lungeAmount;
                if (progress < 0.3) {
                    // Quick thrust
                    lungeAmount = (progress / 0.3);
                    lungeAmount = 1 - Math.pow(1 - lungeAmount, 3); // Ease out
                } else if (progress < 0.6) {
                    // Hold
                    lungeAmount = 1.0;
                } else if (recover) {
                    // Recover
                    lungeAmount = 1 - ((progress - 0.6) / 0.4);
                    lungeAmount = Math.pow(lungeAmount, 2); // Ease in
                } else {
                    lungeAmount = 1.0;
                }

                // Calculate position based on direction
                // ALL directions use camera-relative so they work regardless of model rotation
                let xOffset = 0, yOffset = 0, zOffset = 0;
                let rotX = 0;
                const rotY = 0;
                let rotZ = 0;

                // Camera-relative coordinate system:
                // X: positive = right from camera's view, negative = left
                // Y: positive = up, negative = down
                // Z: negative = toward camera, positive = away from camera
                // rotX: positive = tilt top toward camera (bow forward)
                // rotZ: positive = tilt top to viewer's left (CCW), negative = right (CW)

                switch (moveDir) {
                case 'forward':
                    // Forward = towards camera = positive Z (camera faces -Z, so moving toward it = +Z in camera space)
                    zOffset = lungeAmount * distance * strength;
                    rotX = lungeAmount * 0.2 * strength; // Lean forward (tilt top toward camera)
                    yOffset = -Math.sin(lungeAmount * Math.PI) * 0.05 * strength;
                    break;
                case 'back':
                    // Back = away from camera = negative Z
                    zOffset = -lungeAmount * distance * strength;
                    rotX = -lungeAmount * 0.2 * strength; // Lean back (tilt top away)
                    yOffset = -Math.sin(lungeAmount * Math.PI) * 0.05 * strength;
                    break;
                case 'left':
                    // Left = negative X from camera's view
                    xOffset = -lungeAmount * distance * strength;
                    // Lead with TOP = tilt top to LEFT = negative rotZ (top goes left, body follows)
                    rotZ = -lungeAmount * 0.2 * strength;
                    yOffset = -Math.sin(lungeAmount * Math.PI) * 0.03 * strength;
                    break;
                case 'right':
                    // Right = positive X from camera's view
                    xOffset = lungeAmount * distance * strength;
                    // Lead with TOP = tilt top to RIGHT = positive rotZ (top goes right, body follows)
                    rotZ = lungeAmount * 0.2 * strength;
                    yOffset = -Math.sin(lungeAmount * Math.PI) * 0.03 * strength;
                    break;
                case 'up':
                    yOffset = lungeAmount * distance * strength;
                    rotX = -lungeAmount * 0.15 * strength; // Tilt back for upward reach
                    break;
                case 'down':
                    yOffset = -lungeAmount * distance * strength;
                    rotX = lungeAmount * 0.25 * strength; // Bend forward
                    break;
                }

                // Scale stretch in direction of lunge
                const scale = 1 + lungeAmount * 0.1 * strength;

                // Intensity glow on thrust
                const glowIntensity = 1.0 + lungeAmount * 0.3;
                const glowBoost = progress < 0.4 ? lungeAmount * 0.4 : 0;

                // Use camera-relative for ALL directions so lunge works regardless of model rotation
                return {
                    cameraRelativePosition: [xOffset, yOffset, zOffset],
                    cameraRelativeRotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost
                };
            }
        }
    };
}

// Export factory
export default createLungeGesture;
