/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Bow Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional bow gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/bowFactory
 *
 * Creates bow gestures for all directions.
 * Graceful bow with directional lean - always camera-relative (tidal locked).
 *
 * BOW: Respectful bow gesture (~1200ms)
 *
 * Use cases:
 * - bowForward: Standard forward bow (default, same as bow.js)
 * - bowLeft: Bow while leaning left (theatrical sideways bow)
 * - bowRight: Bow while leaning right (theatrical sideways bow)
 * - bowBack: Bow away (humble retreat bow)
 */

import { capitalize } from '../../_shared/directions.js';

/**
 * Create a bow gesture - graceful bow with directional lean
 * @param {string} direction - 'forward', 'left', 'right', 'back'
 * @returns {Object} Gesture definition
 */
export function createBowGesture(direction) {
    const validDirections = ['forward', 'left', 'right', 'back'];
    if (!validDirections.includes(direction)) {
        throw new Error(`Invalid bow direction: ${direction}. Use 'forward', 'left', 'right', or 'back'.`);
    }

    const emojis = {
        forward: '🙇',
        left: '🙇',
        right: '🙇',
        back: '🙇'
    };

    const descriptions = {
        forward: 'Graceful forward bow of respect',
        left: 'Theatrical bow with leftward flourish',
        right: 'Theatrical bow with rightward flourish',
        back: 'Humble retreating bow'
    };

    return {
        name: `bow${capitalize(direction)}`,
        emoji: emojis[direction],
        type: 'override',
        description: descriptions[direction],

        config: {
            duration: 1200,
            musicalDuration: { musical: true, beats: 3 },
            depth: 0.4,           // How deep to bow (rotation amount)
            holdTime: 0.4,        // How long to hold the bow
            graceful: true,
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'bow',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 3 },
            timingSync: 'onBeat'
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const depth = config.depth || 0.4;
                const holdTime = config.holdTime || 0.4;
                const dir = config.direction || 'forward';

                // Bow envelope: graceful down, hold, graceful up
                let bowAmount;
                const downPhase = (1 - holdTime) * 0.4;
                const upStart = 1 - (1 - holdTime) * 0.6;

                if (progress < downPhase) {
                    // Bowing down
                    bowAmount = progress / downPhase;
                    bowAmount = Math.sin(bowAmount * Math.PI / 2); // Smooth ease
                } else if (progress < upStart) {
                    // Holding bow
                    bowAmount = 1.0;
                } else {
                    // Rising up
                    bowAmount = 1 - ((progress - upStart) / (1 - upStart));
                    bowAmount = Math.sin(bowAmount * Math.PI / 2);
                }

                // Calculate position and rotation based on direction
                // All in camera-relative space for tidal lock
                let xOffset = 0, yOffset = 0, zOffset = 0;
                let rotX = 0, rotZ = 0;
                const rotY = 0;

                // Base bow: always tilt forward (toward camera)
                const baseTilt = bowAmount * depth * Math.PI * strength;
                yOffset = -bowAmount * 0.1 * strength; // Lower during bow

                switch (dir) {
                case 'forward':
                    // Standard forward bow
                    rotX = baseTilt;
                    zOffset = -bowAmount * 0.05 * strength; // Move toward camera
                    break;

                case 'back':
                    // Bow backward (retreating, humble)
                    rotX = baseTilt * 0.7; // Slightly less forward tilt
                    zOffset = bowAmount * 0.1 * strength; // Move away from camera
                    break;

                case 'left':
                    // Theatrical bow to the left
                    // In camera space: positive rotZ = CCW = top goes to viewer's LEFT
                    rotX = baseTilt * 0.8;
                    rotZ = bowAmount * 0.3 * strength; // Lean left (positive = CCW = top-left)
                    xOffset = -bowAmount * 0.08 * strength; // Move left (negative X in camera space)
                    break;

                case 'right':
                    // Theatrical bow to the right
                    // In camera space: negative rotZ = CW = top goes to viewer's RIGHT
                    rotX = baseTilt * 0.8;
                    rotZ = -bowAmount * 0.3 * strength; // Lean right (negative = CW = top-right)
                    xOffset = bowAmount * 0.08 * strength; // Move right (positive X in camera space)
                    break;
                }

                // Soft, respectful glow
                const glowIntensity = 1.0 - bowAmount * 0.2;
                const glowBoost = 0;

                // Use camera-relative transforms for tidal lock
                return {
                    cameraRelativePosition: [xOffset, yOffset, zOffset],
                    cameraRelativeRotation: [rotX, rotY, rotZ],
                    scale: 1.0,
                    glowIntensity,
                    glowBoost
                };
            }
        }
    };
}

// Export factory
export default createBowGesture;
