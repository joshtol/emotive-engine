/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Cascade Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional cascade gestures
 * @author Emotive Engine Team
 * @module gestures/effects/cascadeFactory
 *
 * Creates cascading gestures for all four directions.
 * Sequential falling in waves - particles fall in staggered groups.
 *
 * CASCADE: Waterfall-like sequential motion (~2000ms)
 *
 * Use cases:
 * - cascadeDown: Waterfall, tears, sadness, letting go
 * - cascadeUp: Rising sparks, hope, ascending thoughts
 * - cascadeLeft/Right: Wind-blown, swept away
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a cascade gesture - sequential falling in waves
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createCascadeGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid cascade direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';
    const isPositive = direction === 'down' || direction === 'right';

    return {
        name: `cascade${capitalize(direction)}`,
        emoji: direction === 'down' ? '🌊' : direction === 'up' ? '✨' : direction === 'left' ? '🍂' : '🌬️',
        type: 'override',
        description: `Sequential cascade ${direction}`,

        config: {
            duration: 2000,
            musicalDuration: { musical: true, bars: 1 },
            distance: 200,
            waveCount: 4,         // Number of wave groups
            staggerDelay: 0.15,   // Delay between waves
            wobble: 1.0,          // Cross-axis wobble
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'cascade',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'bars', bars: 1 },
            timingSync: 'onBeat',

            distanceSync: {
                quiet: 100,
                loud: 300,
                crescendo: 'expand',
                diminuendo: 'contract'
            }
        },

        initialize(particle, motion) {
            if (!particle.gestureData) particle.gestureData = {};

            // Assign particle to a wave group based on position
            const waveCount = motion?.waveCount || 4;
            let waveGroup;

            if (isVertical) {
                // Vertical cascade: waves based on Y position (or random)
                waveGroup = Math.floor(Math.random() * waveCount);
            } else {
                // Horizontal cascade: waves based on X position (or random)
                waveGroup = Math.floor(Math.random() * waveCount);
            }

            particle.gestureData.cascade = {
                originalX: particle.x,
                originalY: particle.y,
                originalOpacity: particle.opacity ?? particle.life ?? 1,
                waveGroup,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.3 + Math.random() * 0.4,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, _centerX, _centerY) {
            if (!particle.gestureData?.cascade?.initialized) {
                this.initialize(particle, motion);
            }

            const config = { ...this.config, ...motion };
            const strength = config.strength || 1.0;
            const data = particle.gestureData.cascade;
            const safeDt = (typeof dt === 'number') ? dt : 1;

            const waveCount = config.waveCount || 4;
            const staggerDelay = config.staggerDelay || 0.15;

            // Calculate this particle's delayed progress
            const delayedStart = data.waveGroup * staggerDelay;
            const effectiveProgress = Math.max(0, (progress - delayedStart) / (1 - delayedStart * (waveCount - 1) / waveCount));

            if (effectiveProgress <= 0) return;

            // Eased progress for smooth motion
            const easedProgress = 1 - Math.pow(1 - effectiveProgress, 2);

            // Calculate movement
            const distance = (config.distance || 200) * strength;
            const movement = easedProgress * distance * (isPositive ? 1 : -1);

            // Cross-axis wobble
            data.wobblePhase += data.wobbleSpeed * safeDt * 0.1;
            const wobble = Math.sin(data.wobblePhase) * (config.wobble || 1.0) * 10;

            // Apply movement
            if (isVertical) {
                particle.y = data.originalY + movement;
                particle.x = data.originalX + wobble;
            } else {
                particle.x = data.originalX + movement;
                particle.y = data.originalY + wobble;
            }

            // Fade out
            if (effectiveProgress > 0.6) {
                const fadeProgress = (effectiveProgress - 0.6) / 0.4;
                particle.opacity = data.originalOpacity * (1 - fadeProgress);
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.cascade) {
                const data = particle.gestureData.cascade;
                particle.x = data.originalX;
                particle.y = data.originalY;
                particle.opacity = data.originalOpacity;
                delete particle.gestureData.cascade;
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const cascadeDirection = config.direction || 'down';

                // Simplified 3D: average cascade effect
                const easedProgress = 1 - Math.pow(1 - progress, 2);

                // Direction vectors
                let posX = 0, posY = 0;
                const moveAmount = easedProgress * 0.3 * strength;

                switch (cascadeDirection) {
                case 'down': posY = -moveAmount; break;
                case 'up': posY = moveAmount; break;
                case 'left': posX = -moveAmount; break;
                case 'right': posX = moveAmount; break;
                }

                // Wobble perpendicular to direction
                const wobble = Math.sin(progress * Math.PI * 4) * 0.03 * strength;
                if (cascadeDirection === 'down' || cascadeDirection === 'up') {
                    posX += wobble;
                } else {
                    posY += wobble;
                }

                // Slight tilt in direction of movement
                const rotZ = cascadeDirection === 'left' ? 0.1 : cascadeDirection === 'right' ? -0.1 : 0;
                const rotX = cascadeDirection === 'down' ? 0.05 : cascadeDirection === 'up' ? -0.05 : 0;

                // Fade envelope
                const fadeEnvelope = progress > 0.85 ? (1 - progress) / 0.15 : 1.0;

                return {
                    cameraRelativePosition: [posX * fadeEnvelope, posY * fadeEnvelope, 0],
                    rotation: [rotX * strength * fadeEnvelope, 0, rotZ * strength * fadeEnvelope],
                    scale: 1.0 - easedProgress * 0.1,
                    glowIntensity: 1.0 + (1 - easedProgress) * 0.2
                };
            }
        }
    };
}

// Export factory
export default createCascadeGesture;
