/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Spin Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Spin gesture - orbital rotation around center
 * @author Emotive Engine Team
 * @module gestures/transforms/spin
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Transform patterns for complex animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a spinning vortex effect with particles orbiting around the center.
 * ║ This is an OVERRIDE gesture that completely replaces particle motion.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ↻ Clockwise rotation
 *      · → ·
 *     ↓     ↑
 *    · ← ⭐ → ·
 *     ↑     ↓
 *      · ← ·
 *
 * USED BY:
 * - Dizzy/confused states
 * - Celebration spins
 * - Whirlwind effects
 * - Portal/vortex animations
 */

/**
 * Spin gesture configuration and implementation
 */
export default {
    name: 'spin',
    emoji: '🌀',
    type: 'override', // Completely replaces motion
    description: 'Orbital rotation around center point',

    // Default configuration
    config: {
        duration: 600, // Legacy fallback
        musicalDuration: { musical: true, beats: 1 }, // 1 beat (quarter note)
        rotations: 1, // Number of full rotations
        direction: 'random', // 'clockwise', 'counter-clockwise', or 'random'
        radiusMultiplier: 1.0, // Orbital radius multiplier
        spiralOut: false, // Spiral outward while spinning
        accelerate: true, // Speed up then slow down
        maintainDistance: true, // Keep relative distance from center
        scaleAmount: 0.1, // Scale change during spin
        easing: 'linear', // Animation curve type
        strength: 0.7, // Particle motion strength
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'spin',
            strength: 0.7,
            rotations: 1,
            radius: 1.0,
        },
    },

    // Rhythm configuration - spin as a dance move
    rhythm: {
        enabled: true,
        syncMode: 'bar',

        // Rotations sync to musical time
        rotationSync: {
            mode: 'bars',
            rotationsPerBar: 1, // One spin per bar
            accelerateOnBeat: true, // Speed up on downbeats
        },

        // Radius changes with beat
        radiusSync: {
            subdivision: 'quarter',
            expandOnBeat: 1.2,
            contractOffBeat: 0.9,
            curve: 'bounce',
        },

        // Duration in musical time
        durationSync: {
            mode: 'beats',
            beats: 4, // Spin for 4 beats (1 bar)
        },

        // Pattern-specific spins
        patternOverrides: {
            waltz: {
                // Elegant waltz spin
                rotationSync: { rotationsPerBar: 0.75 },
                radiusSync: { curve: 'ease' },
            },
            swing: {
                // Jazzy swing spin
                rotationSync: { accelerateOnBeat: false },
                direction: 'alternating', // Change direction each bar
            },
            dubstep: {
                // Aggressive spin with wobble
                radiusSync: {
                    subdivision: 'eighth',
                    expandOnBeat: 1.5,
                    dropMultiplier: 2.0,
                },
                spiralOut: true,
            },
            breakbeat: {
                // Chaotic spin patterns
                rotationSync: { mode: 'random', range: [0.5, 2] },
                direction: 'random',
            },
        },
    },

    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        // Calculate starting position relative to center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;

        // Determine spin direction
        let direction = motion.direction || this.config.direction;
        if (direction === 'random') {
            direction = Math.random() < 0.5 ? 'clockwise' : 'counter-clockwise';
        }

        particle.gestureData.spin = {
            startAngle: Math.atan2(dy, dx),
            startRadius: Math.sqrt(dx * dx + dy * dy) || 30, // Min radius if at center
            originalX: particle.x,
            originalY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            direction, // Store chosen direction
            initialized: true,
        };
    },

    /**
     * Apply spin motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.spin?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const data = particle.gestureData.spin;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;

        // Apply rhythm modulation if present
        let { rotations } = config;
        let { radiusMultiplier } = config;
        if (motion.rhythmModulation) {
            if (motion.rhythmModulation.rotationMultiplier) {
                rotations *= motion.rhythmModulation.rotationMultiplier;
            }
            if (motion.rhythmModulation.radiusMultiplier) {
                radiusMultiplier *= motion.rhythmModulation.radiusMultiplier;
            }
        }

        // Apply acceleration curve if enabled
        let speedProgress = progress;
        if (config.accelerate) {
            // Speed up for first half, slow down for second half
            if (progress < 0.5) {
                speedProgress = this.easeInQuad(progress * 2) * 0.5;
            } else {
                speedProgress = 0.5 + this.easeOutQuad((progress - 0.5) * 2) * 0.5;
            }
        }

        // Calculate rotation angle using stored direction
        const rotationAmount = rotations * Math.PI * 2 * strength;
        const direction = data.direction === 'counter-clockwise' ? -1 : 1;
        const currentAngle = data.startAngle + rotationAmount * speedProgress * direction;

        // Calculate radius (with optional spiral)
        let currentRadius = data.startRadius;
        if (config.spiralOut) {
            currentRadius *= 1 + progress * 0.5; // Expand outward during spin
        }
        if (radiusMultiplier !== 1) {
            // Apply radius multiplier with smooth curve
            const radiusCurve = Math.sin(progress * Math.PI); // Peak at middle
            currentRadius *= 1 + (radiusMultiplier - 1) * radiusCurve;
        }

        // Calculate target position
        const targetX = centerX + Math.cos(currentAngle) * currentRadius;
        const targetY = centerY + Math.sin(currentAngle) * currentRadius;

        // For override gesture, directly set position with smooth interpolation
        const moveSpeed = 0.25; // Adjust for smoothness
        particle.x += (targetX - particle.x) * moveSpeed;
        particle.y += (targetY - particle.y) * moveSpeed;

        // Set velocity to match movement (for trail effects)
        particle.vx = (targetX - particle.x) * 0.5;
        particle.vy = (targetY - particle.y) * 0.5;

        // Smooth ending - return to original velocities
        if (progress > 0.9) {
            const endFactor = (1 - progress) * 10;
            particle.vx = particle.vx * endFactor + data.originalVx * (1 - endFactor);
            particle.vy = particle.vy * endFactor + data.originalVy * (1 - endFactor);
        }
    },

    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.spin) {
            // Restore original velocities
            const data = particle.gestureData.spin;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.spin;
        }
    },

    /**
     * Easing function for acceleration
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInQuad(t) {
        return t * t;
    },

    /**
     * Easing function for deceleration
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeOutQuad(t) {
        return t * (2 - t);
    },

    /**
     * 3D translation for WebGL rendering
     * Mascot stays in place and spins on Y-axis
     * Particles orbit around the mascot (handled by particle apply function)
     */
    '3d': {
        /**
         * Evaluate 3D transform for current progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration with particle data
         * @returns {Object} Transform with position, rotation, scale
         */
        evaluate(progress, motion) {
            const config = motion?.config || motion || {};
            const strength = motion?.strength || 1.0;

            // Determine direction - check particle data or config
            const particle = motion?.particle;
            let directionSign = 1;
            if (particle?.gestureData?.spin) {
                directionSign =
                    particle.gestureData.spin.direction === 'counter-clockwise' ? -1 : 1;
            } else if (config.direction === 'counter-clockwise' || config.direction === 'left') {
                directionSign = -1;
            }

            // Apply acceleration curve if enabled
            let speedProgress = progress;
            if (config.accelerate !== false) {
                if (progress < 0.5) {
                    speedProgress = progress * progress * 4 * 0.5; // easeInQuad
                } else {
                    speedProgress = 0.5 + (progress - 0.5) * (2 - (progress - 0.5)) * 0.5; // easeOutQuad
                }
            }

            // Calculate Y-axis rotation (spinning around vertical axis)
            const rotations = config.rotations || 1;
            const rotationAmount = rotations * Math.PI * 2 * strength;

            // Full rotation during gesture (mascot spins in place)
            const yRotation = rotationAmount * speedProgress * directionSign;

            // Scale changes during spin
            const scaleAmount = config.scaleAmount || 0.1;
            const scaleCurve = Math.sin(progress * Math.PI); // Peak at middle
            const scale = 1.0 + scaleAmount * scaleCurve * strength;

            // Mascot stays in place - only rotates on Y axis
            return {
                position: [0, 0, 0], // Stay in place
                rotation: [0, yRotation, 0], // Y-axis rotation only
                scale,
            };
        },
    },
};
