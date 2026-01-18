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
 * BRUTAL PUNCH - Fist buries into flesh, body gets THROWN.
 *
 * The shader handles the localized crater/bulge at impact site.
 * This gesture handles the violent knockback motion.
 *
 * OOF: Punch impact (~600ms)
 */

import { capitalize } from '../motions/directions.js';

/**
 * Create an oof gesture - brutal punch
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
        left: 'Punched from left',
        right: 'Punched from right',
        front: 'Gut punch',
        back: 'Kidney shot',
        up: 'Uppercut',
        down: 'Hammer fist'
    };

    return {
        name: `oof${capitalize(direction)}`,
        emoji: emojis[direction],
        type: 'override',
        description: descriptions[direction],

        config: {
            duration: 600,
            musicalDuration: { musical: true, beats: 1.5 },
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
            durationSync: { mode: 'beats', beats: 1.5 },
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
                // SIMPLE BRUTAL PUNCH - 3 phases, no bullshit
                // ═══════════════════════════════════════════════════════════════════
                //
                // Phase 1 (0-0.1): IMPACT - Instant. Crater forms (shader). Body reacts.
                // Phase 2 (0.1-0.5): THROWN - Body flies from the hit. Fast.
                // Phase 3 (0.5-1.0): RECOVER - Stumble back to position.

                // ─────────────────────────────────────────────────────────────────
                // CRATER STRENGTH - How hard the punch lands (for shader)
                // ─────────────────────────────────────────────────────────────────
                let craterStrength = 0;
                if (progress < 0.1) {
                    // INSTANT crater
                    craterStrength = progress / 0.1;
                    craterStrength = 1 - Math.pow(1 - craterStrength, 3);  // Fast attack
                } else if (progress < 0.3) {
                    // Holds
                    craterStrength = 1.0;
                } else if (progress < 0.6) {
                    // Releasing
                    const t = (progress - 0.3) / 0.3;
                    craterStrength = 1 - t;
                } else {
                    craterStrength = 0;
                }

                // ─────────────────────────────────────────────────────────────────
                // KNOCKBACK - How far body gets thrown
                // ─────────────────────────────────────────────────────────────────
                let knockback = 0;
                if (progress < 0.1) {
                    // Absorbing hit
                    knockback = 0;
                } else if (progress < 0.5) {
                    // THROWN - fast ease out
                    const t = (progress - 0.1) / 0.4;
                    knockback = 1 - Math.pow(1 - t, 2);
                } else {
                    // Return
                    const t = (progress - 0.5) / 0.5;
                    knockback = 1 - t * t;
                }

                // ─────────────────────────────────────────────────────────────────
                // DIRECTION-SPECIFIC MOTION
                // ─────────────────────────────────────────────────────────────────
                let posX = 0, posY = 0, posZ = 0;
                let rotX = 0, rotZ = 0;
                const rotY = 0;

                // Knockback distance - BIG movement
                const dist = 0.4 * strength;
                // Bend angle
                const bend = 0.6 * strength * intensity;

                // Impact point for shader (local mesh coordinates)
                let impactPoint = [0, 0, 0];
                // Direction vector for shader
                let punchDir = [0, 0, 1];

                switch (dir) {
                case 'left':
                    // Punched from left -> thrown right
                    posX = knockback * dist;
                    posY = -craterStrength * 0.05;  // Slight drop on impact
                    rotZ = -knockback * bend;  // Bend right
                    impactPoint = [-0.4, 0, 0];
                    punchDir = [1, 0, 0];
                    break;

                case 'right':
                    // Punched from right -> thrown left
                    posX = -knockback * dist;
                    posY = -craterStrength * 0.05;
                    rotZ = knockback * bend;  // Bend left
                    impactPoint = [0.4, 0, 0];
                    punchDir = [-1, 0, 0];
                    break;

                case 'front':
                    // Gut punch -> thrown back, doubles over
                    posZ = -knockback * dist * 0.7;
                    posY = -craterStrength * 0.1 - knockback * 0.08;
                    rotX = knockback * bend * 1.2;  // Double over hard
                    impactPoint = [0, 0, 0.4];
                    punchDir = [0, 0, -1];
                    break;

                case 'back':
                    // Kidney shot -> thrown forward, arches
                    posZ = knockback * dist * 0.8;
                    rotX = -knockback * bend * 0.7;  // Arch back
                    impactPoint = [0, 0, -0.4];
                    punchDir = [0, 0, 1];
                    break;

                case 'up':
                    // Uppercut -> lifted, head snaps back
                    posY = knockback * dist * 0.8;
                    posZ = -knockback * dist * 0.3;
                    rotX = -knockback * bend;  // Head back
                    impactPoint = [0, -0.3, 0.2];
                    punchDir = [0, 1, 0];
                    break;

                case 'down':
                    // Hammer fist -> crushed down
                    posY = -knockback * dist * 1.2;
                    impactPoint = [0, 0.4, 0];
                    punchDir = [0, -1, 0];
                    break;
                }

                // ─────────────────────────────────────────────────────────────────
                // GLOW - Flash on impact
                // ─────────────────────────────────────────────────────────────────
                let glowIntensity = 1.0;
                let glowBoost = 0;
                if (progress < 0.15) {
                    const t = progress / 0.15;
                    glowIntensity = 1.0 + (1 - t) * 1.5;
                    glowBoost = (1 - t) * 0.8;
                }

                return {
                    cameraRelativePosition: [posX, posY, posZ],
                    cameraRelativeRotation: [rotX, rotY, rotZ],
                    scale: 1.0,  // No scale fuckery - let shader handle deformation
                    glowIntensity,
                    glowBoost,

                    // Shader deformation - THIS is what makes the punch visible
                    deformation: {
                        enabled: true,
                        type: 'elastic',
                        strength: craterStrength * intensity,
                        phase: progress,
                        direction: punchDir,
                        impactPoint,
                        falloffRadius: 0.5
                    }
                };
            }
        }
    };
}

export default createOofGesture;
