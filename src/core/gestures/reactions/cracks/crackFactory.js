/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Crack Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for creating directional crack gestures
 * @author Emotive Engine Team
 * @module gestures/reactions/cracks/crackFactory
 *
 * Creates procedural surface crack effects that spread from an impact point.
 * Cracks are rendered as a post-processing overlay (via CrackLayer) that works
 * on any geometry/material.
 *
 * Unlike shatter (which destroys geometry), crack gestures leave the mesh intact
 * and render visual crack patterns on top. Good for:
 * - Damage indicators
 * - Stress visualization
 * - Pre-shatter warnings
 * - Dramatic impact effects
 */

/**
 * Easing function for crack propagation
 * Fast initial spread, slows at edges
 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Create a directional crack gesture
 * @param {string} direction - Direction of impact: 'front', 'back', 'left', 'right', 'up', 'down'
 * @returns {Object} Gesture definition
 */
export function createCrackGesture(direction) {
    // Cracks always appear on the camera-facing surface of the mesh.
    // This is a screen-space post-processing effect, so by definition it faces the camera.
    //
    // The direction parameter controls:
    // 1. Where on the screen the crack epicenter appears (slight offset from center)
    // 2. Which direction the cracks bias/spread toward in screen space
    // 3. Which direction the mascot recoils from the impact
    //
    // Screen space coordinates: X=right, Y=up (relative to screen center)
    // Recoil uses camera-relative space: X=right, Y=up, Z=toward camera

    const SCREEN_OFFSET = 0.1;  // Small offset from mesh center for impact point
    const RECOIL_DIST = 0.03;   // Recoil distance

    const directionMap = {
        // Front: impact dead center, cracks spread radially (no bias)
        front:  {
            screenOffset: [0, 0],           // Center of mesh
            screenDirection: [0, 0],        // Radial (no directional bias)
            recoilDir: [0, 0, -1]           // Recoil backward (away from camera)
        },
        // Back: same as front visually (cracks on camera-facing side)
        back:   {
            screenOffset: [0, 0],
            screenDirection: [0, 0],
            recoilDir: [0, 0, 1]            // Recoil forward (toward camera)
        },
        // Left: hit from left, cracks spread from left edge rightward
        left:   {
            screenOffset: [-SCREEN_OFFSET, 0],   // Left side of mesh
            screenDirection: [1, 0],             // Spread rightward
            recoilDir: [1, 0, 0]                 // Recoil right
        },
        // Right: hit from right, cracks spread from right edge leftward
        right:  {
            screenOffset: [SCREEN_OFFSET, 0],    // Right side of mesh
            screenDirection: [-1, 0],            // Spread leftward
            recoilDir: [-1, 0, 0]                // Recoil left
        },
        // Up: hit from above, cracks spread from top downward
        up:     {
            screenOffset: [0, SCREEN_OFFSET],    // Top of mesh
            screenDirection: [0, -1],            // Spread downward
            recoilDir: [0, -1, 0]                // Recoil down
        },
        // Down: hit from below, cracks spread from bottom upward
        down:   {
            screenOffset: [0, -SCREEN_OFFSET],   // Bottom of mesh
            screenDirection: [0, 1],             // Spread upward
            recoilDir: [0, 1, 0]                 // Recoil up
        }
    };

    const dirConfig = directionMap[direction] || directionMap.front;
    const name = `crack${direction.charAt(0).toUpperCase() + direction.slice(1)}`;

    return {
        name,
        emoji: '💔',
        type: 'override',
        category: 'reactions',
        description: `Surface cracks spreading from ${direction} impact`,

        // Default configuration
        config: {
            duration: 2000,      // Time for cracks to fully propagate
            strength: 1.0,       // Crack intensity
            glowStrength: 0.3,   // Edge emission intensity
            holdTime: 500        // Time to hold at full crack before healing
        },

        // Rhythm configuration - cracks can sync to heavy beats
        rhythm: {
            enabled: true,
            syncMode: 'accent',
            strengthSync: {
                onBeat: 1.2,
                offBeat: 0.8
            }
        },

        /**
         * 3D core transformation for crack gesture
         * @param {number} progress - Gesture progress (0-1)
         * @param {Object} motion - Gesture configuration
         * @returns {Object} 3D transformation with crack channel
         */
        '3d': {
            evaluate(progress, motion) {
                const config = { duration: 2000, strength: 1.0, glowStrength: 0.3, holdTime: 500, ...motion };
                const { strength, glowStrength } = config;

                // Subtle recoil on initial impact
                const recoilProgress = Math.max(0, 1 - progress * 4);
                const recoilAmount = recoilProgress * RECOIL_DIST * strength;

                // Recoil in the direction opposite to impact
                const {recoilDir} = dirConfig;

                // Trigger flag: true in first 5% of gesture (first ~100ms of 2000ms gesture)
                // GestureBlender will only process the FIRST trigger it sees
                const trigger = progress < 0.05;

                return {
                    // Subtle recoil from impact (camera-relative)
                    cameraRelativePosition: [
                        recoilDir[0] * recoilAmount,
                        recoilDir[1] * recoilAmount,
                        recoilDir[2] * recoilAmount
                    ],

                    // Crack effect (screen-space coordinates)
                    // PERSISTENT MODEL: trigger adds impact with FULL values, cracks stay until healed
                    crack: {
                        enabled: true,  // Always enabled once triggered (persistent)
                        trigger,        // True in first 5% - adds new impact
                        // Use full strength values - the crack persists at full intensity until healed
                        amount: strength,
                        propagation: 0.8,
                        // Screen offset from mesh center (X=right, Y=up in screen space)
                        screenOffset: dirConfig.screenOffset,
                        // Crack spread direction in screen space
                        screenDirection: dirConfig.screenDirection,
                        glowStrength
                    }
                };
            }
        }
    };
}

/**
 * Create a crack-heal gesture
 * Explicitly heals/fades existing cracks
 * @returns {Object} Gesture definition
 */
export function createCrackHealGesture() {
    return {
        name: 'crackHeal',
        emoji: '✨',
        type: 'override',
        category: 'reactions',
        description: 'Heal and fade existing cracks',

        config: {
            duration: 1500,
            glowStrength: 0.5  // Bright glow as cracks heal
        },

        '3d': {
            evaluate(progress, motion) {
                const config = { duration: 1500, glowStrength: 0.5, ...motion };

                // Heal trigger: true in first 5% of gesture
                // GestureBlender will deduplicate to only process once
                const healTrigger = progress < 0.05;

                // Subtle upward float as cracks heal (renewal feel)
                const floatUp = Math.sin(progress * Math.PI) * 0.02;

                return {
                    cameraRelativePosition: [0, floatUp, 0],

                    // Crack heal command
                    // PERSISTENT MODEL: healTrigger tells CrackLayer to start fading all impacts
                    crack: {
                        enabled: false,   // Not adding new cracks
                        heal: true,       // Signal that this is a heal gesture
                        healTrigger,      // True on first frame - starts healing animation
                        healDuration: config.duration
                    },

                    // Subtle positive glow during healing
                    glowBoost: Math.sin(progress * Math.PI) * 0.1
                };
            }
        }
    };
}

// Pre-built directional crack gestures
export const crackFront = createCrackGesture('front');
export const crackBack = createCrackGesture('back');
export const crackLeft = createCrackGesture('left');
export const crackRight = createCrackGesture('right');
export const crackUp = createCrackGesture('up');
export const crackDown = createCrackGesture('down');
export const crackHeal = createCrackHealGesture();

// Default export for convenience
export default crackFront;
