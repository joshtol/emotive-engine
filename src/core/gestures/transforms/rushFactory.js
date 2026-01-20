/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rush Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional rush gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/rushFactory
 *
 * Creates rush gestures for all directions.
 * Quick eager dash movement with momentum.
 *
 * RUSH: Quick dash (~600ms, 1.5 beats)
 *
 * Use cases:
 * - rushForward: Eager approach toward camera
 * - rushBack: Quick retreat away
 * - rushLeft/Right: Dodge, strafe
 * - rushUp: Jump/leap up
 * - rushDown: Dive/duck down
 */

import { capitalize } from '../motions/directions.js';

/**
 * Create a rush gesture - quick eager dash
 * @param {string} direction - 'up', 'down', 'left', 'right', 'forward', 'back'
 * @returns {Object} Gesture definition
 */
export function createRushGesture(direction) {
    const validDirections = ['forward', 'back', 'left', 'right', 'up', 'down'];
    if (!validDirections.includes(direction)) {
        throw new Error(`Invalid rush direction: ${direction}`);
    }

    const emojis = {
        forward: '💨',
        back: '🏃',
        left: '⬅️',
        right: '➡️',
        up: '⬆️',
        down: '⬇️'
    };

    const descriptions = {
        forward: 'Quick rush toward camera',
        back: 'Quick retreat away',
        left: 'Quick strafe left',
        right: 'Quick strafe right',
        up: 'Quick leap upward',
        down: 'Quick dive downward'
    };

    return {
        name: `rush${capitalize(direction)}`,
        emoji: emojis[direction],
        type: 'override',
        description: descriptions[direction],

        config: {
            duration: 600,
            musicalDuration: { musical: true, beats: 1.5 },
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'rush',
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
                multiplier: 1.4
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const dir = config.direction || 'forward';

                // RUSH: Quick 3-phase dash
                // Phase 1 (0-0.2): Quick lean/anticipation
                // Phase 2 (0.2-0.6): DASH!
                // Phase 3 (0.6-1.0): Return/settle

                let posX = 0, posY = 0, posZ = 0;
                let rotX = 0;
                const rotY = 0;
                let rotZ = 0;
                let scale = 1.0;
                let glowIntensity = 1.0;
                let glowBoost = 0;

                // Direction vectors - ALL in camera-relative space
                // X: positive = right from camera's view, negative = left
                // Y: positive = up, negative = down
                // Z: negative = toward camera, positive = away
                // lean.x: positive = tilt top toward camera (forward lean)
                // lean.z: positive = tilt top to viewer's left (CCW), negative = right (CW)
                const dirVectors = {
                    forward: { x: 0, y: 0, z: 1, lean: { x: 0.2, z: 0 } },   // Toward camera (camera faces +Z)
                    back: { x: 0, y: 0, z: -1, lean: { x: -0.2, z: 0 } },    // Away from camera
                    left: { x: -1, y: 0, z: 0, lean: { x: 0, z: 0.2 } },   // Lean INTO rush = top-left
                    right: { x: 1, y: 0, z: 0, lean: { x: 0, z: -0.2 } },  // Lean INTO rush = top-right
                    up: { x: 0, y: 1, z: 0, lean: { x: -0.15, z: 0 } },
                    down: { x: 0, y: -1, z: 0, lean: { x: 0.2, z: 0 } }
                };

                const dirVec = dirVectors[dir];
                const dashDistance = 0.2;

                if (progress < 0.2) {
                    // Phase 1: Quick lean in direction
                    const leanT = progress / 0.2;
                    const leanEase = 1 - Math.pow(1 - leanT, 2);

                    // Lean into the rush direction
                    rotX = leanEase * dirVec.lean.x * strength;
                    rotZ = leanEase * dirVec.lean.z * strength;

                    // Slight crouch for horizontal/down, slight prep for up
                    if (dir === 'up') {
                        posY = -leanEase * 0.03 * strength; // Crouch before jump
                    } else {
                        posY = -leanEase * 0.02 * strength;
                    }

                    // Building glow
                    glowIntensity = 1.0 + leanEase * 0.3;

                } else if (progress < 0.6) {
                    // Phase 2: DASH!
                    const dashT = (progress - 0.2) / 0.4;
                    const dashEase = 1 - Math.pow(1 - dashT, 3);

                    // Move in direction
                    posX = dirVec.x * dashEase * dashDistance * strength;
                    posY = dirVec.y * dashEase * dashDistance * strength;
                    posZ = dirVec.z * dashEase * dashDistance * strength;

                    // For up/down, add arc
                    if (dir === 'up') {
                        posY += dashEase * 0.05 * strength; // Extra height
                    } else if (dir !== 'down') {
                        // Slight rise during horizontal dash
                        posY += (-0.02 + dashEase * 0.04) * strength;
                    }

                    // Maintain lean
                    rotX = dirVec.lean.x * strength;
                    rotZ = dirVec.lean.z * strength;

                    // Stretch in direction of movement
                    scale = 1.0 + dashEase * 0.08;

                    // Speed glow
                    glowIntensity = 1.3 + dashEase * 0.5;
                    glowBoost = dashEase * 0.35;

                    // Motion blur wobble
                    const blur = Math.sin(dashT * Math.PI * 12) * (1 - dashT) * 0.015;
                    rotZ += blur * strength;

                } else {
                    // Phase 3: Return/settle
                    const returnT = (progress - 0.6) / 0.4;
                    const returnEase = returnT < 0.5
                        ? 2 * returnT * returnT
                        : 1 - Math.pow(-2 * returnT + 2, 2) / 2;

                    // Return from dash position
                    posX = dirVec.x * dashDistance * (1 - returnEase) * strength;
                    posY = dirVec.y * dashDistance * (1 - returnEase) * strength;
                    posZ = dirVec.z * dashDistance * (1 - returnEase) * strength;

                    // Return lean
                    rotX = dirVec.lean.x * (1 - returnEase) * strength;
                    rotZ = dirVec.lean.z * (1 - returnEase) * strength;

                    // Scale normalize
                    scale = 1.08 - returnEase * 0.08;

                    // Small bounce at end
                    if (returnT > 0.7) {
                        const bounceT = (returnT - 0.7) / 0.3;
                        const bounce = Math.sin(bounceT * Math.PI) * 0.02;
                        posY -= bounce * strength;
                    }

                    // Glow fade
                    glowIntensity = 1.8 - returnEase * 0.8;
                    glowBoost = 0.35 * (1 - returnEase);
                }

                // Use camera-relative for ALL directions so rush works regardless of model rotation
                return {
                    cameraRelativePosition: [posX, posY, posZ],
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
export default createRushGesture;
