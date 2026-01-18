/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Scatter Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional scatter gestures
 * @author Emotive Engine Team
 * @module gestures/effects/scatterFactory
 *
 * Creates scatter gestures for all four directions.
 * Chaotic dispersal with directional bias - particles scatter erratically.
 *
 * Use cases:
 * - scatterUp: Explosion upward, startled birds
 * - scatterDown: Crumbling, debris falling
 * - scatterLeft/Right: Blown away by wind
 */

import { DIRECTIONS, capitalize } from '../motions/directions.js';

/**
 * Create a scatter gesture - chaotic dispersal with directional bias
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createScatterGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid scatter direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';

    return {
        name: `scatter${capitalize(direction)}`,
        emoji: direction === 'up' ? '🐦' : direction === 'down' ? '🪨' : '🍃',
        type: 'override',
        description: `Chaotic scatter ${direction}`,

        config: {
            duration: 1500,
            musicalDuration: { musical: true, bars: 1 },
            distance: 150,
            chaos: 0.7,           // Randomness factor (0-1)
            directionBias: 0.6,   // How strongly biased toward direction (0-1)
            tumble: 1.0,          // Rotation chaos
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'scatter',
                strength: 1.0,
                direction
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            durationSync: { mode: 'bars', bars: 1 },
            timingSync: 'onBeat',

            chaosSync: {
                onBeat: 1.0,
                offBeat: 0.5
            }
        },

        initialize(particle, motion) {
            if (!particle.gestureData) particle.gestureData = {};

            const config = { ...this.config, ...motion };
            const chaos = config.chaos || 0.7;
            const directionBias = config.directionBias || 0.6;

            // Random scatter direction with bias
            const randomAngle = Math.random() * Math.PI * 2;
            const biasAngle = Math.atan2(dir.y, dir.x);

            // Blend random with bias
            const finalAngle = randomAngle * (1 - directionBias) + biasAngle * directionBias;

            // Random speed
            const speed = 0.5 + Math.random() * 0.5;

            particle.gestureData.scatter = {
                originalX: particle.x,
                originalY: particle.y,
                originalOpacity: particle.opacity ?? 1,
                velocityX: Math.cos(finalAngle) * speed,
                velocityY: Math.sin(finalAngle) * speed,
                tumbleSpeed: (Math.random() - 0.5) * 2,
                wobblePhase: Math.random() * Math.PI * 2,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.scatter?.initialized) {
                this.initialize(particle, motion);
            }

            const config = { ...this.config, ...motion };
            const strength = config.strength || 1.0;
            const distance = config.distance || 150;
            const data = particle.gestureData.scatter;

            // Eased progress for deceleration
            const easedProgress = 1 - Math.pow(1 - progress, 2);

            // Movement with deceleration
            const moveX = data.velocityX * distance * easedProgress * strength;
            const moveY = data.velocityY * distance * easedProgress * strength;

            // Add wobble/chaos
            data.wobblePhase += 0.1;
            const wobbleX = Math.sin(data.wobblePhase * 3) * 5 * (1 - progress);
            const wobbleY = Math.cos(data.wobblePhase * 2.7) * 5 * (1 - progress);

            particle.x = data.originalX + moveX + wobbleX;
            particle.y = data.originalY + moveY + wobbleY;

            // Fade out
            if (progress > 0.5) {
                particle.opacity = data.originalOpacity * (1 - (progress - 0.5) * 2);
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.scatter) {
                const data = particle.gestureData.scatter;
                particle.x = data.originalX;
                particle.y = data.originalY;
                particle.opacity = data.originalOpacity;
                delete particle.gestureData.scatter;
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion.config || this.config || {};
                const strength = config.strength || 1.0;
                const direction = config.direction || 'up';
                const chaos = config.chaos || 0.7;

                // SCATTER: Dramatic dissolution effect (Thanos-snap inspired)
                // Note: True mesh disintegration requires custom shaders with vertex
                // displacement. This approximates the effect with non-uniform scale,
                // violent rotation, and glowIntensity fade.
                //
                // Phase 1 (0-0.2): Initial shock/vibration
                // Phase 2 (0.2-0.8): Scatter outward with wild spin
                // Phase 3 (0.8-1.0): Fade to nothing

                // Direction vectors (with depth for 3D effect)
                const dirVec = {
                    up: [0, 1, 0.3],
                    down: [0, -1, 0.3],
                    left: [-1, 0, 0.2],
                    right: [1, 0, 0.2]
                };
                const [dx, dy, dz] = dirVec[direction] || [0, 1, 0.3];

                let posX = 0, posY = 0, posZ = 0;
                let rotX = 0, rotY = 0, rotZ = 0;
                let scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0;
                let glowIntensity = 1.0;
                let glowBoost = 0;

                if (progress < 0.2) {
                    // Phase 1: Initial shock - violent vibration
                    const shockT = progress / 0.2;
                    const shakeIntensity = Math.sin(shockT * Math.PI) * chaos;

                    // High-frequency vibration
                    const vibTime = progress * 80;
                    posX = Math.sin(vibTime * 2.3) * 0.015 * shakeIntensity;
                    posY = Math.sin(vibTime * 1.7) * 0.01 * shakeIntensity;
                    posZ = Math.sin(vibTime * 3.1) * 0.008 * shakeIntensity;

                    // Slight expansion as if about to explode
                    const expand = shockT * 0.05;
                    scaleX = 1.0 + expand;
                    scaleY = 1.0 + expand;
                    scaleZ = 1.0 + expand;

                    glowIntensity = 1.0 + shockT * 0.5;
                    glowBoost = shockT * 0.3;

                } else if (progress < 0.8) {
                    // Phase 2: Scatter outward with dramatic movement
                    const scatterT = (progress - 0.2) / 0.6;
                    const easedScatter = 1 - Math.pow(1 - scatterT, 2);

                    // Main movement in direction (accelerating)
                    const moveAmount = easedScatter * 0.25 * strength;
                    posX = dx * moveAmount;
                    posY = dy * moveAmount;
                    posZ = dz * moveAmount;

                    // Chaotic wobble that increases
                    const wobbleIntensity = scatterT * chaos;
                    posX += Math.sin(progress * Math.PI * 8) * 0.04 * wobbleIntensity;
                    posY += Math.cos(progress * Math.PI * 7) * 0.03 * wobbleIntensity;

                    // Wild tumbling rotation
                    const tumbleSpeed = scatterT * Math.PI * 3 * chaos;
                    rotX = Math.sin(tumbleSpeed * 1.3) * 0.5 * strength;
                    rotY = Math.sin(tumbleSpeed * 0.9) * 0.4 * strength;
                    rotZ = Math.sin(tumbleSpeed * 1.7) * 0.6 * strength;

                    // Non-uniform scale for "breaking apart" visual
                    // Different axes shrink at different rates
                    const shrinkBase = 1 - scatterT * 0.4;
                    scaleX = shrinkBase + Math.sin(scatterT * Math.PI * 3) * 0.08;
                    scaleY = shrinkBase - Math.sin(scatterT * Math.PI * 2.5) * 0.06;
                    scaleZ = shrinkBase + Math.cos(scatterT * Math.PI * 4) * 0.07;

                    // Glow fluctuates wildly then fades
                    glowIntensity = 1.2 + Math.sin(scatterT * Math.PI * 5) * 0.4 * (1 - scatterT);
                    glowBoost = 0.3 * (1 - scatterT);

                } else {
                    // Phase 3: Fade to nothing
                    const fadeT = (progress - 0.8) / 0.2;
                    const easedFade = fadeT * fadeT; // Accelerating fade

                    // Continue movement direction
                    const finalMove = 0.25 * strength + fadeT * 0.1;
                    posX = dx * finalMove;
                    posY = dy * finalMove;
                    posZ = dz * finalMove;

                    // Slow rotation continues
                    rotX = Math.sin(Math.PI * 2.7 * chaos * 1.3) * 0.3 * strength;
                    rotY = Math.sin(Math.PI * 2.7 * chaos * 0.9) * 0.25 * strength;
                    rotZ = Math.sin(Math.PI * 2.7 * chaos * 1.7) * 0.35 * strength;

                    // Shrink to nothing (non-uniform for organic dissolve look)
                    const finalScale = 0.6 * (1 - easedFade);
                    scaleX = finalScale * (1 + Math.sin(fadeT * Math.PI) * 0.1);
                    scaleY = finalScale * (1 - Math.sin(fadeT * Math.PI * 1.3) * 0.08);
                    scaleZ = finalScale * (1 + Math.cos(fadeT * Math.PI) * 0.12);

                    // Glow fades out
                    glowIntensity = (1 - easedFade) * 0.5;
                    glowBoost = 0;
                }

                return {
                    cameraRelativePosition: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale: [scaleX, scaleY, scaleZ],  // Non-uniform for "breaking apart" look
                    glowIntensity,
                    glowBoost
                };
            }
        }
    };
}

export default createScatterGesture;
