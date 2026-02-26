/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Swarm Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional swarm gestures
 * @author Emotive Engine Team
 * @module gestures/effects/swarmFactory
 *
 * Creates swarm gestures for all four directions.
 * Particles cluster together then move as a group - flock behavior.
 *
 * Use cases:
 * - swarmUp: Birds taking flight, hope rising
 * - swarmDown: Descending together, diving
 * - swarmLeft/Right: Flock movement, curiosity
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a swarm gesture - particles cluster then move together
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createSwarmGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid swarm direction: ${direction}`);

    return {
        name: `swarm${capitalize(direction)}`,
        emoji: direction === 'up' ? '🦅' : direction === 'down' ? '🦆' : '🐟',
        type: 'override',
        description: `Flock movement ${direction}`,

        config: {
            duration: 1800,
            musicalDuration: { musical: true, bars: 1 },
            clusterPhase: 0.3,    // Portion of animation for clustering
            moveDistance: 120,    // How far the swarm moves
            clusterTightness: 0.5, // How tight particles cluster (0-1)
            wobble: 1.0,          // Individual wobble amount
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'swarm',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'bars', bars: 1 },
            timingSync: 'onBeat'
        },

        initialize(particle, _motion, _centerX, _centerY) {
            if (!particle.gestureData) particle.gestureData = {};

            particle.gestureData.swarm = {
                originalX: particle.x,
                originalY: particle.y,
                originalOpacity: particle.opacity ?? 1,
                // Random offset for individual movement
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.3 + Math.random() * 0.4,
                // Slightly different timing per particle
                timeOffset: Math.random() * 0.1,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.swarm?.initialized) {
                this.initialize(particle, motion, centerX, centerY);
            }

            const config = { ...this.config, ...motion };
            const strength = config.strength || 1.0;
            const data = particle.gestureData.swarm;

            const clusterPhase = config.clusterPhase || 0.3;
            const moveDistance = config.moveDistance || 120;
            const clusterTightness = config.clusterTightness || 0.5;

            // Offset progress per particle
            const offsetProgress = Math.max(0, Math.min(1, progress - data.timeOffset));

            // Phase 1: Cluster toward center (0 to clusterPhase)
            // Phase 2: Move together in direction (clusterPhase to 1)

            let targetX, targetY;

            if (offsetProgress < clusterPhase) {
                // Clustering phase - move toward center
                const clusterProgress = offsetProgress / clusterPhase;
                const eased = 1 - Math.pow(1 - clusterProgress, 2);

                const clusterX = data.originalX + (centerX - data.originalX) * clusterTightness * eased;
                const clusterY = data.originalY + (centerY - data.originalY) * clusterTightness * eased;

                targetX = clusterX;
                targetY = clusterY;
            } else {
                // Movement phase - swarm moves together
                const moveProgress = (offsetProgress - clusterPhase) / (1 - clusterPhase);
                const eased = 1 - Math.pow(1 - moveProgress, 2);

                // Start from clustered position
                const clusterX = data.originalX + (centerX - data.originalX) * clusterTightness;
                const clusterY = data.originalY + (centerY - data.originalY) * clusterTightness;

                // Move in direction
                const moveX = dir.x * moveDistance * eased * strength;
                const moveY = dir.y * moveDistance * eased * strength;

                targetX = clusterX + moveX;
                targetY = clusterY + moveY;
            }

            // Add individual wobble for organic flock feel
            const safeDt = (typeof dt === 'number') ? dt : 1;
            data.wobblePhase += data.wobbleSpeed * safeDt * 0.1;
            const wobbleX = Math.sin(data.wobblePhase * 3) * config.wobble * 5;
            const wobbleY = Math.cos(data.wobblePhase * 2.5) * config.wobble * 5;

            particle.x = targetX + wobbleX;
            particle.y = targetY + wobbleY;

            // Fade out at end
            if (offsetProgress > 0.8) {
                particle.opacity = data.originalOpacity * (1 - (offsetProgress - 0.8) * 5);
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.swarm) {
                const data = particle.gestureData.swarm;
                particle.x = data.originalX;
                particle.y = data.originalY;
                particle.opacity = data.originalOpacity;
                delete particle.gestureData.swarm;
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const swarmDirection = config.direction || 'up';
                const clusterPhase = config.clusterPhase || 0.3;

                // Direction vectors
                const dirVec = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
                const [dx, dy] = dirVec[swarmDirection] || [0, 1];

                let posX = 0, posY = 0, scale = 1.0;

                if (progress < clusterPhase) {
                    // Clustering - slight contraction
                    const clusterProgress = progress / clusterPhase;
                    scale = 1 - clusterProgress * 0.1 * strength;
                } else {
                    // Movement
                    const moveProgress = (progress - clusterPhase) / (1 - clusterPhase);
                    const eased = 1 - Math.pow(1 - moveProgress, 2);

                    posX = dx * eased * 0.25 * strength;
                    posY = dy * eased * 0.25 * strength;
                    scale = 0.9 + moveProgress * 0.1; // Expand back
                }

                // Subtle wobble
                const wobble = Math.sin(progress * Math.PI * 6) * 0.02 * strength;

                // Slight tilt in movement direction
                const tiltAmount = progress > clusterPhase ? 0.1 : 0;
                const rotX = dy * tiltAmount * strength;
                const rotZ = -dx * tiltAmount * strength;

                // Fade envelope
                const fadeEnvelope = progress > 0.85 ? (1 - progress) / 0.15 : 1.0;

                return {
                    cameraRelativePosition: [(posX + wobble) * fadeEnvelope, posY * fadeEnvelope, 0],
                    rotation: [rotX, 0, rotZ],
                    scale,
                    glowIntensity: 1.0 + (progress > clusterPhase ? 0.2 : 0)
                };
            }
        }
    };
}

export default createSwarmGesture;
