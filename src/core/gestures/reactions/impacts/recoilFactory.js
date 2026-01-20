/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Recoil Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional recoil gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/recoilFactory
 *
 * Creates recoil gestures for all four directions.
 * Snap back reaction - instant jolt followed by slow recovery.
 *
 * RECOIL: Shock reaction (~600ms)
 *
 * Use cases:
 * - recoilBack: Surprise, fear, shock, hit from front
 * - recoilForward: Hit from behind, pushed forward
 * - recoilLeft/Right: Dodge reaction, side impact
 * - recoilUp: Startled jump
 * - recoilDown: Ducking, cowering
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a recoil gesture - snap reaction with recovery
 * @param {string} direction - 'up', 'down', 'left', 'right', 'forward', 'back'
 * @returns {Object} Gesture definition
 */
export function createRecoilGesture(direction) {
    // Extended directions for 3D
    // Note: In 3D, negative Z is towards camera (forward), positive Z is away (back)
    const RECOIL_DIRECTIONS = {
        ...DIRECTIONS,
        forward: { x: 0, y: 0, z: -1 },
        back: { x: 0, y: 0, z: 1 }
    };

    const dir = RECOIL_DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid recoil direction: ${direction}`);

    const emojis = {
        back: '😱',
        forward: '😵',
        left: '😰',
        right: '😰',
        up: '😲',
        down: '😨'
    };

    return {
        name: `recoil${capitalize(direction)}`,
        emoji: emojis[direction] || '😱',
        type: 'override',
        description: `Recoil ${direction} in shock`,

        config: {
            duration: 600,
            musicalDuration: { musical: true, beats: 1.5 },
            distance: 0.2,
            intensity: 1.0,
            recover: true,
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'recoil',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 1.5 },
            timingSync: 'onBeat',

            accentResponse: {
                enabled: true,
                multiplier: 1.6
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const distance = config.distance || 0.2;
                const intensity = config.intensity || 1.0;
                const recover = config.recover !== false;
                const moveDir = config.direction || 'back';

                // Recoil: instant snap, then slow recovery
                let recoilAmount;
                if (progress < 0.15) {
                    // Instant snap
                    recoilAmount = (progress / 0.15);
                    recoilAmount = 1 - Math.pow(1 - recoilAmount, 4); // Very fast ease out
                } else if (progress < 0.4) {
                    // Hold in shock
                    recoilAmount = 1.0;
                } else if (recover) {
                    // Slow recovery
                    recoilAmount = 1 - ((progress - 0.4) / 0.6);
                    recoilAmount = Math.pow(recoilAmount, 0.5); // Slow ease
                } else {
                    recoilAmount = 1.0;
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
                // Z: negative = toward camera, positive = away
                // rotX: positive = tilt top toward camera (forward lean)
                // rotZ: positive = tilt top to viewer's left (CCW), negative = right (CW)

                switch (moveDir) {
                case 'back':
                    // Recoil back = move away from camera = negative Z (camera faces +Z)
                    zOffset = -recoilAmount * distance * strength * intensity;
                    rotX = -recoilAmount * 0.25 * strength * intensity; // Lean back (tilt away)
                    yOffset = recoilAmount * 0.05 * strength; // Slight rise
                    break;
                case 'forward':
                    // Recoil forward = move towards camera = positive Z (camera faces +Z)
                    zOffset = recoilAmount * distance * strength * intensity;
                    rotX = recoilAmount * 0.25 * strength * intensity; // Lean forward (tilt towards)
                    yOffset = -recoilAmount * 0.05 * strength; // Slight dip
                    break;
                case 'left':
                    // Recoil left = move left from camera's view = negative X
                    xOffset = -recoilAmount * distance * strength * intensity;
                    rotZ = recoilAmount * 0.2 * strength * intensity; // Lean left (top goes left = positive)
                    break;
                case 'right':
                    // Recoil right = move right from camera's view = positive X
                    xOffset = recoilAmount * distance * strength * intensity;
                    rotZ = -recoilAmount * 0.2 * strength * intensity; // Lean right (top goes right = negative)
                    break;
                case 'up':
                    yOffset = recoilAmount * distance * strength * intensity;
                    rotX = -recoilAmount * 0.1 * strength * intensity; // Slight tilt back
                    break;
                case 'down':
                    yOffset = -recoilAmount * distance * strength * intensity;
                    rotX = recoilAmount * 0.3 * strength * intensity; // Cower forward
                    break;
                }

                // Contract slightly in shock
                const scale = 1 - recoilAmount * 0.1 * intensity;

                // Flash of shock
                const glowIntensity = 1.0 + (progress < 0.2 ? (0.2 - progress) * 3 : 0);
                const glowBoost = progress < 0.15 ? 0.5 : 0;

                // Use camera-relative for ALL directions so recoil works regardless of model rotation
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
export default createRecoilGesture;
