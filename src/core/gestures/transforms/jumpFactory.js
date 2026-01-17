/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Jump Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional jump gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/jumpFactory
 *
 * Creates jumping gestures for all four directions with squash & stretch.
 * Classic animation principles applied directionally.
 *
 * JUMP: Squash, leap, land (~800ms) - energetic, expressive
 *
 * Use cases:
 * - jumpUp: Joy, excitement, celebration
 * - jumpDown: Stomp, impact, emphasis
 * - jumpLeft/Right: Dodge, evasion, surprise
 */

import { DIRECTIONS, capitalize } from '../motions/directions.js';

/**
 * Create a jump gesture - directional leap with squash & stretch
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createJumpGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid jump direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';
    const isPositive = direction === 'up' || direction === 'right';

    return {
        name: `jump${capitalize(direction)}`,
        emoji: direction === 'up' ? '🦘' : direction === 'down' ? '💥' : direction === 'left' ? '⬅️' : '➡️',
        type: 'override',
        description: `Jump ${direction} with squash & stretch`,

        config: {
            duration: 800,  // Legacy fallback
            musicalDuration: { musical: true, beats: 2 }, // 2 beats
            jumpDistance: 60,
            squashAmount: 0.8,
            stretchAmount: 1.2,
            anticipation: 0.2,
            hangTime: 0.1,
            landingImpact: true,
            easing: 'quad',
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'jump',
                strength: 0.9,
                jumpDistance: 60,
                squash: 0.8,
                stretch: 1.2
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'beats', beats: 2 }, // 2 beats duration

            phaseSync: {
                anticipation: 'eighth',
                jump: 'beat',
                landing: 'sixteenth'
            },

            distanceSync: {
                onBeat: 1.5,
                offBeat: 0.8,
                accent: 2.0,
                curve: 'exponential'
            },

            deformationSync: {
                squashOnBeat: 0.6,
                stretchOnBeat: 1.4,
                timing: 'anticipatory'
            },

            dynamics: {
                forte: { jumpDistance: 80, stretch: 1.3 },
                piano: { jumpDistance: 30, stretch: 1.1 }
            }
        },

        initialize(particle, motion, centerX, centerY) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }

            particle.gestureData.jump = {
                startX: particle.x,
                startY: particle.y,
                startSize: particle.size,
                originalVx: particle.vx,
                originalVy: particle.vy,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.jump?.initialized) {
                this.initialize(particle, motion, centerX, centerY);
            }

            const data = particle.gestureData.jump;
            const config = { ...this.config, ...motion };
            const strength = motion.strength || 1.0;

            const jumpDistance = config.jumpDistance * strength * particle.scaleFactor;
            const squash = config.squashAmount;
            const stretch = config.stretchAmount;

            const anticipationEnd = config.anticipation;
            const jumpEnd = 1 - config.anticipation * 0.5;

            if (progress < anticipationEnd) {
                // PHASE 1: Anticipation (squash in opposite direction)
                const squashProgress = progress / anticipationEnd;
                const easedSquash = this.easeOutQuad(squashProgress);

                // Squash size
                particle.size = data.startSize * (1 - (1 - squash) * easedSquash);

                // Slightly move opposite to jump direction (wind up)
                if (isVertical) {
                    particle.y = data.startY - dir.y * easedSquash * 5 * particle.scaleFactor;
                } else {
                    particle.x = data.startX - dir.x * easedSquash * 5 * particle.scaleFactor;
                }

                particle.vx = 0;
                particle.vy = 0;

            } else if (progress < jumpEnd) {
                // PHASE 2: Jump (arc motion with stretch)
                const jumpProgress = (progress - anticipationEnd) / (jumpEnd - anticipationEnd);

                // Use sine curve for smooth arc
                let jumpCurve = Math.sin(jumpProgress * Math.PI);

                // Add hang time at peak
                if (config.hangTime > 0 && jumpProgress > 0.4 && jumpProgress < 0.6) {
                    const hangProgress = (jumpProgress - 0.4) / 0.2;
                    const hangCurve = this.easeInOutCubic(hangProgress);
                    jumpCurve = 0.95 + hangCurve * 0.05;
                }

                // Apply jump in the specified direction
                if (isVertical) {
                    particle.y = data.startY + dir.y * jumpCurve * jumpDistance;
                    // Slight horizontal wobble
                    particle.x = data.startX + Math.sin(jumpProgress * Math.PI * 2) * 3;
                } else {
                    particle.x = data.startX + dir.x * jumpCurve * jumpDistance;
                    // Slight vertical arc
                    particle.y = data.startY - Math.sin(jumpProgress * Math.PI) * jumpDistance * 0.3;
                }

                // Stretch/squash based on phase
                if (jumpProgress < 0.5) {
                    const stretchProgress = jumpProgress * 2;
                    particle.size = data.startSize * (squash + (stretch - squash) * stretchProgress);
                } else {
                    const fallProgress = (jumpProgress - 0.5) * 2;
                    particle.size = data.startSize * (stretch - (stretch - 1) * fallProgress * 0.8);
                }

                // Set velocity for motion blur
                if (isVertical) {
                    particle.vy = dir.y * Math.cos(jumpProgress * Math.PI) * jumpDistance * 0.1;
                    particle.vx = 0;
                } else {
                    particle.vx = dir.x * Math.cos(jumpProgress * Math.PI) * jumpDistance * 0.1;
                    particle.vy = -Math.cos(jumpProgress * Math.PI) * jumpDistance * 0.05;
                }

            } else {
                // PHASE 3: Landing (impact squash)
                const landProgress = (progress - jumpEnd) / (1 - jumpEnd);
                const easedLand = this.easeOutBounce(landProgress);

                // Return to origin
                particle.x = data.startX;
                particle.y = data.startY;

                if (config.landingImpact) {
                    if (landProgress < 0.3) {
                        const impactProgress = landProgress / 0.3;
                        particle.size = data.startSize * (1 - (1 - squash * 0.8) * (1 - impactProgress));
                    } else {
                        const recoverProgress = (landProgress - 0.3) / 0.7;
                        particle.size = data.startSize * (squash * 0.8 + (1 - squash * 0.8) * recoverProgress);
                    }
                } else {
                    particle.size = data.startSize * (squash + (1 - squash) * easedLand);
                }

                particle.vx = data.originalVx * easedLand;
                particle.vy = data.originalVy * easedLand;
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.jump) {
                const data = particle.gestureData.jump;
                particle.size = data.startSize;
                particle.vx = data.originalVx;
                particle.vy = data.originalVy;
                delete particle.gestureData.jump;
            }
        },

        easeOutQuad(t) {
            return t * (2 - t);
        },

        easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },

        easeOutBounce(t) {
            const n1 = 7.5625;
            const d1 = 2.75;

            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || motion || {};
                const strength = motion.strength || 1.0;

                const PIXEL_TO_3D = 0.004;
                const jumpDistancePixels = config.jumpDistance || 60;
                const jumpDistance = jumpDistancePixels * PIXEL_TO_3D * strength;

                const squash = config.squashAmount || 0.8;
                const stretch = config.stretchAmount || 1.2;
                const anticipationEnd = config.anticipation || 0.2;
                const jumpEnd = 1 - anticipationEnd * 0.5;

                let posX = 0, posY = 0;
                let scale = 1.0;
                let rotX = 0, rotY = 0, rotZ = 0;

                if (progress < anticipationEnd) {
                    // PHASE 1: Anticipation
                    const squashProgress = progress / anticipationEnd;
                    const easedSquash = squashProgress * (2 - squashProgress);

                    scale = 1.0 - (1 - squash) * easedSquash;

                    // Slight movement opposite to direction
                    if (isVertical) {
                        posY = -dir.y * easedSquash * 0.02;
                    } else {
                        posX = -dir.x * easedSquash * 0.02;
                    }

                } else if (progress < jumpEnd) {
                    // PHASE 2: Jump
                    const jumpProgress = (progress - anticipationEnd) / (jumpEnd - anticipationEnd);
                    const jumpCurve = Math.sin(jumpProgress * Math.PI);

                    // Position in jump direction
                    if (isVertical) {
                        posY = dir.y * jumpCurve * jumpDistance;
                    } else {
                        posX = dir.x * jumpCurve * jumpDistance;
                        posY = Math.sin(jumpProgress * Math.PI) * jumpDistance * 0.3; // Arc
                    }

                    // Stretch/squash
                    if (jumpProgress < 0.5) {
                        const stretchProgress = jumpProgress * 2;
                        scale = squash + (stretch - squash) * stretchProgress;
                    } else {
                        const fallProgress = (jumpProgress - 0.5) * 2;
                        scale = stretch - (stretch - 1) * fallProgress * 0.8;
                    }

                    // Rotation into jump direction
                    if (isVertical) {
                        rotX = dir.y * Math.sin(jumpProgress * Math.PI) * 0.1;
                    } else {
                        rotY = dir.x * Math.sin(jumpProgress * Math.PI) * 0.15;
                        rotZ = -dir.x * Math.sin(jumpProgress * Math.PI) * 0.05;
                    }

                } else {
                    // PHASE 3: Landing
                    const landProgress = (progress - jumpEnd) / (1 - jumpEnd);

                    // Bounce
                    if (landProgress < 0.5) {
                        const bounceProgress = landProgress * 2;
                        if (isVertical) {
                            posY = -dir.y * Math.sin(bounceProgress * Math.PI) * jumpDistance * 0.15;
                        } else {
                            posX = -dir.x * Math.sin(bounceProgress * Math.PI) * jumpDistance * 0.1;
                        }
                    }

                    // Landing squash
                    if (config.landingImpact !== false) {
                        if (landProgress < 0.3) {
                            const impactProgress = landProgress / 0.3;
                            scale = 1.0 - (1 - squash * 0.8) * (1 - impactProgress);
                        } else {
                            const recoverProgress = (landProgress - 0.3) / 0.7;
                            scale = squash * 0.8 + (1 - squash * 0.8) * recoverProgress;
                        }
                    } else {
                        scale = squash + (1 - squash) * landProgress;
                    }
                }

                return {
                    cameraRelativePosition: [posX, posY, 0],
                    rotation: [rotX, rotY, rotZ],
                    scale
                };
            }
        }
    };
}
