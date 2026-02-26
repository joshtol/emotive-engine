/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Orbit Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional orbit gestures
 * @author Emotive Engine Team
 * @module gestures/transforms/orbitFactory
 *
 * Creates orbital gestures with direction variants.
 * Particles orbit around the center with smooth 3D motion.
 *
 * ORBIT: Smooth circular motion (~1500ms) - hypnotic, flowing
 *
 * Use cases:
 * - orbitLeft (counter-clockwise): Natural rotation, contemplation
 * - orbitRight (clockwise): Energy, excitement
 * - orbitUp: Rising spiral, ascension
 * - orbitDown: Descending spiral, sinking
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create an orbit gesture - particles orbit in specified direction
 * @param {string} direction - 'left' (CCW), 'right' (CW), 'up' (rising), 'down' (sinking)
 * @returns {Object} Gesture definition
 */
export function createOrbitGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid orbit direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';
    // For horizontal: left = CCW (positive angle), right = CW (negative angle)
    // For vertical: determines the spiral direction
    const orbitDirection = direction === 'left' || direction === 'up' ? 1 : -1;

    return {
        name: `orbit${capitalize(direction)}`,
        emoji:
            direction === 'left'
                ? '🔄'
                : direction === 'right'
                  ? '🔃'
                  : direction === 'up'
                    ? '🌀'
                    : '💫',
        type: 'override',
        description: `Orbit ${direction === 'left' ? 'counter-clockwise' : direction === 'right' ? 'clockwise' : direction}`,

        config: {
            duration: 1500, // Legacy fallback
            musicalDuration: { musical: true, beats: 4 }, // 4 beats (1 bar)
            speed: 0.02,
            maintainRadius: true,
            use3D: true,
            rotations: 1,
            strength: 1.0,
            direction,
            verticalOscillation: isVertical ? 0.3 : 0,
            particleMotion: {
                type: 'orbit',
                strength: 1.0,
                rotations: 1,
            },
        },

        rhythm: {
            enabled: true,
            syncMode: 'harmonic',
            durationSync: { mode: 'bars', bars: 1 }, // 1 bar duration

            speedSync: {
                tonic: 0.02,
                fifth: 0.03,
                octave: 0.04,
                curve: 'smooth',
            },

            radiusSync: {
                bass: 150,
                mid: 100,
                treble: 50,
                scaling: 'logarithmic',
            },

            dynamics: {
                forte: { speed: 0.04, maintainRadius: false },
                piano: { speed: 0.01, maintainRadius: true },
            },
        },

        initialize(particle, motion, centerX, centerY) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }

            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const calculatedRadius = Math.sqrt(dx * dx + dy * dy);

            // Set minimum radius to prevent center clustering
            const MIN_RADIUS = 80;
            const radius = Math.max(calculatedRadius, MIN_RADIUS + Math.random() * 100);

            const initialAngle =
                calculatedRadius < 5 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);

            particle.gestureData.orbit = {
                radius,
                targetRadius: radius,
                angle: initialAngle,
                initialAngle,
                originalVx: particle.vx,
                originalVy: particle.vy,
                originalZ: particle.z || 0,
                zPhase: Math.random() * Math.PI * 2,
                direction: orbitDirection,
                initialized: true,
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.orbit?.initialized) {
                this.initialize(particle, motion, centerX, centerY);
            }

            const data = particle.gestureData.orbit;
            const config = { ...this.config, ...motion };
            const strength = motion.strength || 1.0;
            const speed = (config.speed || 0.02) * strength;

            // Smooth entry/exit envelope
            let envelope = 1.0;
            if (progress < 0.15) {
                envelope = progress / 0.15;
                envelope = Math.sin(envelope * Math.PI * 0.5);
            } else if (progress > 0.85) {
                envelope = (1 - progress) / 0.15;
                envelope = Math.sin(envelope * Math.PI * 0.5);
            }

            // Update angle with direction
            data.angle += speed * dt * data.direction * envelope;

            // Calculate radius with optional variation
            let { radius } = data;
            if (!config.maintainRadius) {
                radius = data.radius * (1 + Math.sin(progress * Math.PI * 2) * 0.1);
            }

            // Apply position with envelope
            const effectiveRadius = radius * envelope + (1 - envelope) * data.radius * 0.5;
            particle.x = centerX + Math.cos(data.angle) * effectiveRadius;
            particle.y = centerY + Math.sin(data.angle) * effectiveRadius;

            // 3D depth animation
            if (config.use3D !== false) {
                const zAngle = data.angle + data.zPhase;
                particle.z = Math.sin(zAngle) * 0.8 * envelope;

                // Vertical oscillation for rising/sinking effect
                if (isVertical && config.verticalOscillation) {
                    const verticalOffset =
                        dir.y * progress * config.verticalOscillation * radius * 0.5;
                    particle.y += verticalOffset;
                }
            }

            // Set velocity to match motion
            particle.vx = -Math.sin(data.angle) * effectiveRadius * speed * envelope;
            particle.vy = Math.cos(data.angle) * effectiveRadius * speed * envelope;

            // Restore original velocity at end
            if (progress > 0.9) {
                const blendFactor = (1 - progress) * 10;
                particle.vx = particle.vx * blendFactor + data.originalVx * (1 - blendFactor);
                particle.vy = particle.vy * blendFactor + data.originalVy * (1 - blendFactor);
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.orbit) {
                const data = particle.gestureData.orbit;
                particle.vx = data.originalVx;
                particle.vy = data.originalVy;
                particle.z = data.originalZ;
                delete particle.gestureData.orbit;
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || motion || {};
                const strength = motion.strength || 1.0;
                const rotations = config.rotations || 1;

                // Smooth entry/exit envelope
                let envelope = 1.0;
                if (progress < 0.15) {
                    envelope = Math.sin((progress / 0.15) * Math.PI * 0.5);
                } else if (progress > 0.85) {
                    envelope = Math.sin(((1 - progress) / 0.15) * Math.PI * 0.5);
                }

                // Orbital motion in XZ plane
                const orbitRadius = 0.25 * strength;
                const angle = progress * Math.PI * 2 * rotations * orbitDirection;

                // Position offset
                const xOffset = Math.cos(angle) * orbitRadius * envelope;
                const zOffset = Math.sin(angle) * orbitRadius * envelope;

                // Y offset for vertical variants
                let yOffset = 0;
                if (isVertical) {
                    yOffset = dir.y * progress * 0.2 * strength * envelope;
                }

                // Rotation to face direction of motion
                const yRotation = angle * envelope * 0.5;

                // Scale based on depth
                const scale = 1.0 + zOffset * 0.2;

                return {
                    cameraRelativePosition: [xOffset, yOffset, zOffset],
                    rotation: [0, yRotation, 0],
                    scale,
                };
            },
        },
    };
}
