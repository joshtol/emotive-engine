/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Spin Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional spin gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/spinFactory
 *
 * Creates spin gestures for left (counter-clockwise) and right (clockwise) rotations.
 * Full Y-axis rotation with smooth acceleration/deceleration.
 *
 * SPIN: Full rotation (~600ms) - dramatic, attention-grabbing
 */

import { capitalize } from '../../_shared/directions.js';

/**
 * Map direction to spin direction
 */
const SPIN_DIRECTIONS = {
    left: 'counter-clockwise',
    right: 'clockwise'
};

/**
 * Create a spin gesture - rotation in a direction
 * @param {string} direction - 'left' (counter-clockwise), 'right' (clockwise)
 * @returns {Object} Gesture definition
 */
export function createSpinGesture(direction) {
    const spinDirection = SPIN_DIRECTIONS[direction];
    if (!spinDirection) throw new Error(`Invalid spin direction: ${direction}`);

    const directionMult = direction === 'left' ? -1 : 1;

    return {
        name: `spin${capitalize(direction)}`,
        emoji: direction === 'left' ? '↺' : '↻',
        type: 'override',
        description: `Spin ${spinDirection}`,

        config: {
            duration: 600,
            rotations: 1,
            direction: spinDirection,
            radiusMultiplier: 1.0,
            spiralOut: false,
            accelerate: true,
            maintainDistance: true,
            scaleAmount: 0.1,
            strength: 0.7
        },

        rhythm: {
            enabled: true,
            syncMode: 'bar',
            timingSync: 'nextBeat',
            interruptible: false,
            priority: 7,
            blendable: false,

            durationSync: {
                mode: 'beats',
                beats: 4
            },

            rotationSync: {
                mode: 'bars',
                rotationsPerBar: 1,
                accelerateOnBeat: true
            }
        },

        initialize(particle, motion, centerX, centerY) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }

            const dx = particle.x - centerX;
            const dy = particle.y - centerY;

            particle.gestureData.spin = {
                startAngle: Math.atan2(dy, dx),
                startRadius: Math.sqrt(dx * dx + dy * dy) || 30,
                originalX: particle.x,
                originalY: particle.y,
                originalVx: particle.vx,
                originalVy: particle.vy,
                direction: spinDirection,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.spin?.initialized) {
                this.initialize(particle, motion, centerX, centerY);
            }

            const data = particle.gestureData.spin;
            const config = { ...this.config, ...motion };
            const strength = motion.strength || 1.0;

            let { rotations, radiusMultiplier } = config;
            if (motion.rhythmModulation) {
                if (motion.rhythmModulation.rotationMultiplier) {
                    rotations *= motion.rhythmModulation.rotationMultiplier;
                }
                if (motion.rhythmModulation.radiusMultiplier) {
                    radiusMultiplier *= motion.rhythmModulation.radiusMultiplier;
                }
            }

            // Acceleration curve
            let speedProgress = progress;
            if (config.accelerate) {
                if (progress < 0.5) {
                    speedProgress = this.easeInQuad(progress * 2) * 0.5;
                } else {
                    speedProgress = 0.5 + this.easeOutQuad((progress - 0.5) * 2) * 0.5;
                }
            }

            const rotationAmount = rotations * Math.PI * 2 * strength;
            const currentAngle = data.startAngle + (rotationAmount * speedProgress * directionMult);

            let currentRadius = data.startRadius;
            if (config.spiralOut) {
                currentRadius *= (1 + progress * 0.5);
            }
            if (radiusMultiplier !== 1) {
                const radiusCurve = Math.sin(progress * Math.PI);
                currentRadius *= (1 + (radiusMultiplier - 1) * radiusCurve);
            }

            const targetX = centerX + Math.cos(currentAngle) * currentRadius;
            const targetY = centerY + Math.sin(currentAngle) * currentRadius;

            const moveSpeed = 0.25;
            particle.x += (targetX - particle.x) * moveSpeed;
            particle.y += (targetY - particle.y) * moveSpeed;

            particle.vx = (targetX - particle.x) * 0.5;
            particle.vy = (targetY - particle.y) * 0.5;

            if (progress > 0.9) {
                const endFactor = (1 - progress) * 10;
                particle.vx = particle.vx * endFactor + data.originalVx * (1 - endFactor);
                particle.vy = particle.vy * endFactor + data.originalVy * (1 - endFactor);
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.spin) {
                const data = particle.gestureData.spin;
                particle.vx = data.originalVx;
                particle.vy = data.originalVy;
                delete particle.gestureData.spin;
            }
        },

        easeInQuad(t) {
            return t * t;
        },

        easeOutQuad(t) {
            return t * (2 - t);
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion?.config || motion || {};
                const strength = motion?.strength || 1.0;

                let speedProgress = progress;
                if (config.accelerate !== false) {
                    if (progress < 0.5) {
                        speedProgress = (progress * progress * 4) * 0.5;
                    } else {
                        speedProgress = 0.5 + ((progress - 0.5) * (2 - (progress - 0.5))) * 0.5;
                    }
                }

                const rotations = config.rotations || 1;
                const rotationAmount = rotations * Math.PI * 2 * strength;

                // Full rotation during gesture (mascot spins in place)
                const yRotation = rotationAmount * speedProgress * directionMult;

                const scaleAmount = config.scaleAmount || 0.1;
                const scaleCurve = Math.sin(progress * Math.PI);
                const scale = 1.0 + (scaleAmount * scaleCurve * strength);

                // Mascot stays in place - only rotates on Y axis
                return {
                    position: [0, 0, 0],
                    rotation: [0, yRotation, 0],
                    scale
                };
            }
        }
    };
}
