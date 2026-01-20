/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Drift Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional drift gestures
 * @author Emotive Engine Team
 * @module gestures/effects/driftFactory
 *
 * Creates ethereal drifting gestures for all four directions.
 * Controlled floating motion with smooth return - dreamy and atmospheric.
 *
 * DRIFT: Gentle outward drift with return (~800ms) - ethereal, meditative
 *
 * Use cases:
 * - driftUp: Rising mist, ascending thoughts, hope
 * - driftDown: Settling dust, sinking feelings, melancholy
 * - driftLeft/Right: Wandering thoughts, lateral movement, exploration
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a drift gesture - controlled floating in a direction
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createDriftGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid drift direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';

    return {
        name: `drift${capitalize(direction)}`,
        emoji: direction === 'up' ? '☁️' : direction === 'down' ? '🍃' : direction === 'left' ? '🌫️' : '💭',
        type: 'override',
        description: `Gentle drifting ${direction}`,

        config: {
            duration: 800,  // Legacy fallback
            musicalDuration: { musical: true, beats: 2 }, // 2 beats
            distance: 50,
            returnToOrigin: true,
            fadeOut: false,
            holdTime: 0.2,
            turbulence: 0.1,
            smoothness: 0.08,
            strength: 1.0,
            direction,
            particleMotion: {
                type: 'drift',
                strength: 1.0,
                distance: 60
            }
        },

        rhythm: {
            enabled: true,
            syncMode: 'ambient',
            durationSync: { mode: 'beats', beats: 2 }, // 2 beats duration

            distanceSync: {
                quiet: 30,
                loud: 80,
                crescendo: 'expand',
                diminuendo: 'contract'
            },

            holdSync: {
                shortPhrase: 0.1,
                longPhrase: 0.4,
                fermata: 'sustain'
            },

            accentResponse: {
                enabled: true,
                multiplier: 1.3,
                type: 'distance'
            }
        },

        initialize(particle, motion, centerX, centerY) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }

            const config = { ...this.config, ...motion };
            const homeRadius = (30 + Math.random() * 30) * particle.scaleFactor;

            // For directional drift, start from current position
            particle.gestureData.drift = {
                startX: particle.x,
                startY: particle.y,
                originalVx: particle.vx,
                originalVy: particle.vy,
                baseOpacity: particle.opacity || particle.life || 1,
                homeRadius,
                role: Math.random(),
                turbulencePhase: Math.random() * Math.PI * 2,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, centerX, centerY) {
            if (!particle.gestureData?.drift?.initialized) {
                this.initialize(particle, motion, centerX, centerY);
            }

            const data = particle.gestureData.drift;
            const config = { ...this.config, ...motion };
            const strength = motion.strength || 1.0;

            // Apply easing
            const easeProgress = this.easeInOutCubic(progress);

            // Add role-based phase shift for staggered movement
            const adjustedPhase = Math.max(0, easeProgress - data.role * 0.1);

            let targetX = data.startX;
            let targetY = data.startY;

            // Calculate drift offset based on direction
            let driftProgress;
            if (!config.returnToOrigin) {
                driftProgress = adjustedPhase;
            } else if (adjustedPhase < 0.5) {
                // Drift out
                driftProgress = adjustedPhase * 2;
            } else {
                // Drift back
                driftProgress = (1 - adjustedPhase) * 2;
            }

            const driftDistance = config.distance * strength * particle.scaleFactor * driftProgress;

            // Add turbulence
            data.turbulencePhase += config.turbulence * dt;
            const turbulenceX = Math.sin(data.turbulencePhase) * config.turbulence * 10;
            const turbulenceY = Math.cos(data.turbulencePhase * 1.3) * config.turbulence * 10;

            // Apply directional drift
            if (isVertical) {
                targetY = data.startY + (dir.y * driftDistance) + turbulenceX;
                targetX = data.startX + turbulenceY * 0.5;
            } else {
                targetX = data.startX + (dir.x * driftDistance) + turbulenceY;
                targetY = data.startY + turbulenceX * 0.5;
            }

            // Smooth movement
            const smoothness = config.smoothness + data.role * 0.08;
            particle.x += (targetX - particle.x) * smoothness;
            particle.y += (targetY - particle.y) * smoothness;

            // Set velocity for trails
            particle.vx = (targetX - particle.x) * 0.25;
            particle.vy = (targetY - particle.y) * 0.25;

            // Apply fade effect if enabled
            if (config.fadeOut) {
                let fadeFactor = 1.0;
                if (progress < 0.25) {
                    fadeFactor = 0.3 + (progress / 0.25) * 0.7;
                } else if (progress < 0.75) {
                    fadeFactor = 0.7 + Math.sin((progress - 0.25) * Math.PI / 0.5) * 0.3;
                } else {
                    fadeFactor = (1 - progress) * 4;
                }
                particle.opacity = data.baseOpacity * fadeFactor;
            }

            // Clean ending
            if (progress >= 0.99) {
                particle.vx = data.originalVx * 0.1;
                particle.vy = data.originalVy * 0.1;
                if (config.fadeOut) {
                    particle.opacity = data.baseOpacity;
                }
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.drift) {
                const data = particle.gestureData.drift;
                particle.vx = data.originalVx;
                particle.vy = data.originalVy;
                particle.opacity = data.baseOpacity;
                delete particle.gestureData.drift;
            }
        },

        easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion || {};
                const strength = config.strength || 1.0;
                const distance = config.distance || 50;

                const PIXEL_TO_3D = 0.004;

                // Drift curve - out and back
                const returnToOrigin = config.returnToOrigin !== false;
                const driftProgress = returnToOrigin
                    ? Math.sin(progress * Math.PI)
                    : progress;

                const driftAmount = distance * PIXEL_TO_3D * strength * driftProgress;

                // Position based on direction
                const posX = dir.x * driftAmount;
                const posY = dir.y * driftAmount;

                // Subtle rotation following drift direction
                let rotX = 0, rotY = 0;
                if (isVertical) {
                    rotX = dir.y * driftProgress * 0.1;
                } else {
                    rotY = dir.x * driftProgress * 0.15;
                }

                // Scale slightly during drift
                const scale = 1.0 + driftProgress * 0.03;

                return {
                    cameraRelativePosition: [posX, posY, 0],
                    rotation: [rotX, rotY, 0],
                    scale,
                    glowIntensity: 1.0 - driftProgress * 0.1
                };
            }
        }
    };
}
